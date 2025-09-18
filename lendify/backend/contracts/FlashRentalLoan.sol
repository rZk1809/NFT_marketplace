// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./interfaces/IERC4907.sol";

interface IFlashRentalReceiver {
    function onFlashRental(
        address nftContract,
        uint256 tokenId,
        uint256 fee,
        bytes calldata data
    ) external returns (bool);
}

/**
 * @title FlashRentalLoan
 * @dev Flash loans for NFT rentals - rent NFTs within a single transaction
 */
contract FlashRentalLoan is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using Address for address;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROVIDER_ROLE = keccak256("PROVIDER_ROLE");

    struct FlashRentalPool {
        address nftContract;
        uint256[] availableTokens;
        mapping(uint256 => bool) isAvailable;
        mapping(uint256 => address) tokenOwners;
        mapping(uint256 => uint256) rentalFees;
        mapping(uint256 => uint256) flashFees;
        uint256 totalLiquidity;
        bool isActive;
    }

    struct FlashRentalData {
        address borrower;
        address nftContract;
        uint256 tokenId;
        uint256 fee;
        uint256 timestamp;
        bytes32 txHash;
    }

    mapping(address => FlashRentalPool) public pools;
    mapping(address => bool) public supportedCollections;
    mapping(address => FlashRentalData[]) public userFlashHistory;
    
    address[] public supportedNFTCollections;
    
    // Flash rental fees
    uint256 public baseFeePercentage = 50; // 0.5%
    uint256 public platformFeePercentage = 10; // 0.1%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    address public feeRecipient;
    
    // Security parameters
    uint256 public maxFlashRentalDuration = 300; // 5 minutes max
    mapping(address => uint256) public lastFlashRental;
    uint256 public flashRentalCooldown = 60; // 1 minute cooldown

    event FlashRentalPoolCreated(address indexed nftContract, uint256 totalTokens);
    event NFTDeposited(address indexed nftContract, uint256 indexed tokenId, address indexed owner);
    event NFTWithdrawn(address indexed nftContract, uint256 indexed tokenId, address indexed owner);
    event FlashRentalExecuted(
        address indexed borrower,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 fee,
        bytes32 txHash
    );
    event FlashFeeUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newFee);

    modifier validCollection(address _nftContract) {
        require(supportedCollections[_nftContract], "Collection not supported");
        require(pools[_nftContract].isActive, "Pool not active");
        _;
    }

    modifier respectsCooldown() {
        require(
            block.timestamp >= lastFlashRental[msg.sender] + flashRentalCooldown,
            "Flash rental cooldown not met"
        );
        _;
    }

    constructor(address _feeRecipient) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Create a flash rental pool for an NFT collection
     */
    function createFlashRentalPool(address _nftContract) external onlyRole(ADMIN_ROLE) {
        require(_nftContract != address(0), "Invalid NFT contract");
        require(!supportedCollections[_nftContract], "Pool already exists");

        pools[_nftContract].nftContract = _nftContract;
        pools[_nftContract].isActive = true;
        
        supportedCollections[_nftContract] = true;
        supportedNFTCollections.push(_nftContract);

        emit FlashRentalPoolCreated(_nftContract, 0);
    }

    /**
     * @dev Deposit NFT into flash rental pool
     */
    function depositNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _flashFee
    ) external validCollection(_nftContract) nonReentrant {
        require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        require(!pools[_nftContract].isAvailable[_tokenId], "NFT already deposited");
        require(_flashFee > 0, "Flash fee must be positive");

        // Check if NFT supports ERC4907 and is not currently rented
        bool supportsERC4907 = IERC721(_nftContract).supportsInterface(type(IERC4907).interfaceId);
        if (supportsERC4907) {
            require(
                IERC4907(_nftContract).userExpires(_tokenId) < block.timestamp,
                "NFT currently rented"
            );
        }

        // Transfer NFT to contract
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        FlashRentalPool storage pool = pools[_nftContract];
        pool.availableTokens.push(_tokenId);
        pool.isAvailable[_tokenId] = true;
        pool.tokenOwners[_tokenId] = msg.sender;
        pool.flashFees[_tokenId] = _flashFee;
        pool.totalLiquidity += 1;

        emit NFTDeposited(_nftContract, _tokenId, msg.sender);
    }

    /**
     * @dev Withdraw NFT from flash rental pool
     */
    function withdrawNFT(address _nftContract, uint256 _tokenId) external nonReentrant {
        FlashRentalPool storage pool = pools[_nftContract];
        require(pool.tokenOwners[_tokenId] == msg.sender, "Not NFT owner");
        require(pool.isAvailable[_tokenId], "NFT not available");

        // Remove from available tokens array
        _removeTokenFromArray(pool.availableTokens, _tokenId);
        
        pool.isAvailable[_tokenId] = false;
        delete pool.tokenOwners[_tokenId];
        delete pool.flashFees[_tokenId];
        pool.totalLiquidity -= 1;

        // Transfer NFT back to owner
        IERC721(_nftContract).transferFrom(address(this), msg.sender, _tokenId);

        emit NFTWithdrawn(_nftContract, _tokenId, msg.sender);
    }

    /**
     * @dev Execute flash rental
     */
    function flashRental(
        address _nftContract,
        uint256 _tokenId,
        bytes calldata _data
    ) external payable nonReentrant respectsCooldown validCollection(_nftContract) whenNotPaused {
        FlashRentalPool storage pool = pools[_nftContract];
        require(pool.isAvailable[_tokenId], "NFT not available for flash rental");

        uint256 flashFee = pool.flashFees[_tokenId];
        uint256 platformFee = (flashFee * platformFeePercentage) / FEE_DENOMINATOR;
        uint256 totalFee = flashFee + platformFee;

        require(msg.value >= totalFee, "Insufficient fee payment");

        // Mark NFT as temporarily unavailable
        pool.isAvailable[_tokenId] = false;
        lastFlashRental[msg.sender] = block.timestamp;

        // Set temporary user if ERC4907
        bool supportsERC4907 = IERC721(_nftContract).supportsInterface(type(IERC4907).interfaceId);
        if (supportsERC4907) {
            uint64 expires = uint64(block.timestamp + maxFlashRentalDuration);
            IERC4907(_nftContract).setUser(_tokenId, msg.sender, expires);
        }

        // Record flash rental
        bytes32 txHash = keccak256(abi.encodePacked(msg.sender, _nftContract, _tokenId, block.timestamp));
        userFlashHistory[msg.sender].push(FlashRentalData({
            borrower: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            fee: totalFee,
            timestamp: block.timestamp,
            txHash: txHash
        }));

        // Execute flash rental callback
        require(
            IFlashRentalReceiver(msg.sender).onFlashRental(_nftContract, _tokenId, totalFee, _data),
            "Flash rental callback failed"
        );

        // Verify NFT is still in contract and rental conditions are met
        require(IERC721(_nftContract).ownerOf(_tokenId) == address(this), "NFT not returned");
        
        // Clear temporary user if ERC4907
        if (supportsERC4907) {
            IERC4907(_nftContract).setUser(_tokenId, address(0), 0);
        }

        // Mark NFT as available again
        pool.isAvailable[_tokenId] = true;

        // Distribute fees
        address tokenOwner = pool.tokenOwners[_tokenId];
        payable(tokenOwner).transfer(flashFee);
        payable(feeRecipient).transfer(platformFee);

        // Refund excess payment
        if (msg.value > totalFee) {
            payable(msg.sender).transfer(msg.value - totalFee);
        }

        emit FlashRentalExecuted(msg.sender, _nftContract, _tokenId, totalFee, txHash);
    }

    /**
     * @dev Batch flash rental for multiple NFTs
     */
    function batchFlashRental(
        address[] calldata _nftContracts,
        uint256[] calldata _tokenIds,
        bytes[] calldata _data
    ) external payable nonReentrant respectsCooldown whenNotPaused {
        require(_nftContracts.length == _tokenIds.length, "Array length mismatch");
        require(_nftContracts.length == _data.length, "Array length mismatch");
        require(_nftContracts.length <= 10, "Too many NFTs"); // Prevent gas issues

        uint256 totalFeeRequired = 0;
        uint256[] memory fees = new uint256[](_nftContracts.length);
        
        // Calculate total fees and validate availability
        for (uint256 i = 0; i < _nftContracts.length; i++) {
            require(supportedCollections[_nftContracts[i]], "Collection not supported");
            FlashRentalPool storage pool = pools[_nftContracts[i]];
            require(pool.isAvailable[_tokenIds[i]], "NFT not available");
            
            uint256 flashFee = pool.flashFees[_tokenIds[i]];
            uint256 platformFee = (flashFee * platformFeePercentage) / FEE_DENOMINATOR;
            uint256 totalFee = flashFee + platformFee;
            
            fees[i] = totalFee;
            totalFeeRequired += totalFee;
        }

        require(msg.value >= totalFeeRequired, "Insufficient fee payment");

        // Mark all NFTs as temporarily unavailable and set users
        for (uint256 i = 0; i < _nftContracts.length; i++) {
            FlashRentalPool storage pool = pools[_nftContracts[i]];
            pool.isAvailable[_tokenIds[i]] = false;

            bool supportsERC4907 = IERC721(_nftContracts[i]).supportsInterface(type(IERC4907).interfaceId);
            if (supportsERC4907) {
                uint64 expires = uint64(block.timestamp + maxFlashRentalDuration);
                IERC4907(_nftContracts[i]).setUser(_tokenIds[i], msg.sender, expires);
            }
        }

        lastFlashRental[msg.sender] = block.timestamp;

        // Execute callbacks for each NFT
        for (uint256 i = 0; i < _nftContracts.length; i++) {
            require(
                IFlashRentalReceiver(msg.sender).onFlashRental(
                    _nftContracts[i], 
                    _tokenIds[i], 
                    fees[i], 
                    _data[i]
                ),
                "Flash rental callback failed"
            );
        }

        // Verify all NFTs are still in contract and clean up
        uint256 totalFeesToDistribute = 0;
        for (uint256 i = 0; i < _nftContracts.length; i++) {
            require(IERC721(_nftContracts[i]).ownerOf(_tokenIds[i]) == address(this), "NFT not returned");
            
            FlashRentalPool storage pool = pools[_nftContracts[i]];
            bool supportsERC4907 = IERC721(_nftContracts[i]).supportsInterface(type(IERC4907).interfaceId);
            if (supportsERC4907) {
                IERC4907(_nftContracts[i]).setUser(_tokenIds[i], address(0), 0);
            }

            pool.isAvailable[_tokenIds[i]] = true;

            // Distribute fees
            uint256 flashFee = pool.flashFees[_tokenIds[i]];
            uint256 platformFee = (flashFee * platformFeePercentage) / FEE_DENOMINATOR;
            
            address tokenOwner = pool.tokenOwners[_tokenIds[i]];
            payable(tokenOwner).transfer(flashFee);
            totalFeesToDistribute += platformFee;

            // Record flash rental
            bytes32 txHash = keccak256(abi.encodePacked(msg.sender, _nftContracts[i], _tokenIds[i], block.timestamp));
            userFlashHistory[msg.sender].push(FlashRentalData({
                borrower: msg.sender,
                nftContract: _nftContracts[i],
                tokenId: _tokenIds[i],
                fee: fees[i],
                timestamp: block.timestamp,
                txHash: txHash
            }));

            emit FlashRentalExecuted(msg.sender, _nftContracts[i], _tokenIds[i], fees[i], txHash);
        }

        // Send platform fees
        payable(feeRecipient).transfer(totalFeesToDistribute);

        // Refund excess payment
        if (msg.value > totalFeeRequired) {
            payable(msg.sender).transfer(msg.value - totalFeeRequired);
        }
    }

    /**
     * @dev Update flash fee for owned NFT
     */
    function updateFlashFee(
        address _nftContract,
        uint256 _tokenId,
        uint256 _newFee
    ) external validCollection(_nftContract) {
        FlashRentalPool storage pool = pools[_nftContract];
        require(pool.tokenOwners[_tokenId] == msg.sender, "Not NFT owner");
        require(_newFee > 0, "Flash fee must be positive");

        pool.flashFees[_tokenId] = _newFee;

        emit FlashFeeUpdated(_nftContract, _tokenId, _newFee);
    }

    /**
     * @dev Get available NFTs for flash rental in a collection
     */
    function getAvailableNFTs(address _nftContract) external view returns (uint256[] memory) {
        require(supportedCollections[_nftContract], "Collection not supported");
        
        FlashRentalPool storage pool = pools[_nftContract];
        uint256[] memory available = new uint256[](pool.totalLiquidity);
        uint256 count = 0;

        for (uint256 i = 0; i < pool.availableTokens.length; i++) {
            uint256 tokenId = pool.availableTokens[i];
            if (pool.isAvailable[tokenId]) {
                available[count] = tokenId;
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = available[i];
        }

        return result;
    }

    /**
     * @dev Get flash rental history for user
     */
    function getFlashRentalHistory(address _user) external view returns (FlashRentalData[] memory) {
        return userFlashHistory[_user];
    }

    /**
     * @dev Get flash fee for specific NFT
     */
    function getFlashFee(address _nftContract, uint256 _tokenId) external view returns (uint256) {
        require(supportedCollections[_nftContract], "Collection not supported");
        return pools[_nftContract].flashFees[_tokenId];
    }

    /**
     * @dev Get total fee (flash fee + platform fee) for specific NFT
     */
    function getTotalFlashFee(address _nftContract, uint256 _tokenId) external view returns (uint256) {
        require(supportedCollections[_nftContract], "Collection not supported");
        
        uint256 flashFee = pools[_nftContract].flashFees[_tokenId];
        uint256 platformFee = (flashFee * platformFeePercentage) / FEE_DENOMINATOR;
        
        return flashFee + platformFee;
    }

    /**
     * @dev Check if NFT is available for flash rental
     */
    function isNFTAvailable(address _nftContract, uint256 _tokenId) external view returns (bool) {
        if (!supportedCollections[_nftContract]) return false;
        return pools[_nftContract].isAvailable[_tokenId];
    }

    /**
     * @dev Remove token from array (internal helper)
     */
    function _removeTokenFromArray(uint256[] storage _array, uint256 _tokenId) internal {
        for (uint256 i = 0; i < _array.length; i++) {
            if (_array[i] == _tokenId) {
                _array[i] = _array[_array.length - 1];
                _array.pop();
                break;
            }
        }
    }

    // Admin functions
    function updateBaseFeePercentage(uint256 _feePercentage) external onlyRole(ADMIN_ROLE) {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        baseFeePercentage = _feePercentage;
    }

    function updatePlatformFeePercentage(uint256 _feePercentage) external onlyRole(ADMIN_ROLE) {
        require(_feePercentage <= 500, "Fee too high"); // Max 5%
        platformFeePercentage = _feePercentage;
    }

    function updateMaxFlashRentalDuration(uint256 _duration) external onlyRole(ADMIN_ROLE) {
        require(_duration >= 60 && _duration <= 3600, "Invalid duration"); // 1 minute to 1 hour
        maxFlashRentalDuration = _duration;
    }

    function updateFlashRentalCooldown(uint256 _cooldown) external onlyRole(ADMIN_ROLE) {
        require(_cooldown <= 300, "Cooldown too long"); // Max 5 minutes
        flashRentalCooldown = _cooldown;
    }

    function deactivatePool(address _nftContract) external onlyRole(ADMIN_ROLE) {
        pools[_nftContract].isActive = false;
    }

    function activatePool(address _nftContract) external onlyRole(ADMIN_ROLE) {
        pools[_nftContract].isActive = true;
    }

    function updateFeeRecipient(address _feeRecipient) external onlyRole(ADMIN_ROLE) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    // Emergency functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdrawNFT(address _nftContract, uint256 _tokenId) external onlyRole(ADMIN_ROLE) {
        IERC721(_nftContract).transferFrom(address(this), msg.sender, _tokenId);
    }

    function emergencyWithdraw() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
}