// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IERC4907.sol";

/**
 * @title NFTRentalMarketplace
 * @dev Advanced NFT rental marketplace with ERC-4907 support
 */
contract NFTRentalMarketplace is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    Counters.Counter private _rentalIds;

    struct RentalListing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address owner;
        address paymentToken;
        uint256 pricePerDay;
        uint256 minRentalDays;
        uint256 maxRentalDays;
        bool isActive;
        uint256 collateralRequired;
        uint256 createdAt;
        RentalCategory category;
    }

    struct RentalAgreement {
        uint256 rentalId;
        uint256 listingId;
        address renter;
        uint256 startTime;
        uint256 endTime;
        uint256 totalCost;
        uint256 collateralDeposit;
        RentalStatus status;
        uint256 createdAt;
    }

    enum RentalCategory {
        GAMING,
        ART,
        METAVERSE,
        UTILITY,
        MEMBERSHIP,
        OTHER
    }

    enum RentalStatus {
        ACTIVE,
        COMPLETED,
        DISPUTED,
        CANCELLED
    }

    mapping(uint256 => RentalListing) public listings;
    mapping(uint256 => RentalAgreement) public rentals;
    mapping(address => mapping(uint256 => uint256)) public nftToListing;
    mapping(address => uint256[]) public ownerListings;
    mapping(address => uint256[]) public renterAgreements;
    
    // Platform fees
    uint256 public platformFeePercentage = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    address public feeRecipient;
    
    // Supported payment tokens
    mapping(address => bool) public supportedPaymentTokens;
    
    // Emergency pause
    mapping(address => bool) public emergencyPauseOperators;

    event ListingCreated(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address owner,
        uint256 pricePerDay,
        RentalCategory category
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 pricePerDay,
        uint256 minRentalDays,
        uint256 maxRentalDays
    );

    event ListingCancelled(uint256 indexed listingId);

    event RentalStarted(
        uint256 indexed rentalId,
        uint256 indexed listingId,
        address indexed renter,
        uint256 startTime,
        uint256 endTime,
        uint256 totalCost
    );

    event RentalCompleted(uint256 indexed rentalId);
    
    event RentalExtended(
        uint256 indexed rentalId,
        uint256 newEndTime,
        uint256 additionalCost
    );

    event DisputeRaised(uint256 indexed rentalId, address indexed party, string reason);
    
    event DisputeResolved(uint256 indexed rentalId, address winner, uint256 compensation);

    event CollateralClaimed(
        uint256 indexed rentalId,
        address indexed claimant,
        uint256 amount,
        string reason
    );

    modifier onlyListingOwner(uint256 _listingId) {
        require(listings[_listingId].owner == msg.sender, "Not listing owner");
        _;
    }

    modifier onlyActiveRental(uint256 _rentalId) {
        require(rentals[_rentalId].status == RentalStatus.ACTIVE, "Rental not active");
        require(block.timestamp <= rentals[_rentalId].endTime, "Rental expired");
        _;
    }

    modifier onlyRenter(uint256 _rentalId) {
        require(rentals[_rentalId].renter == msg.sender, "Not renter");
        _;
    }

    constructor(address _feeRecipient) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
        
        // Add ETH as default supported payment token
        supportedPaymentTokens[address(0)] = true;
    }

    /**
     * @dev Create a new rental listing
     */
    function createListing(
        address _nftContract,
        uint256 _tokenId,
        address _paymentToken,
        uint256 _pricePerDay,
        uint256 _minRentalDays,
        uint256 _maxRentalDays,
        uint256 _collateralRequired,
        RentalCategory _category
    ) external nonReentrant whenNotPaused {
        require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        require(_pricePerDay > 0, "Price must be greater than 0");
        require(_minRentalDays > 0 && _maxRentalDays >= _minRentalDays, "Invalid rental days");
        require(supportedPaymentTokens[_paymentToken], "Payment token not supported");
        require(nftToListing[_nftContract][_tokenId] == 0, "NFT already listed");

        _rentalIds.increment();
        uint256 listingId = _rentalIds.current();

        listings[listingId] = RentalListing({
            listingId: listingId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            owner: msg.sender,
            paymentToken: _paymentToken,
            pricePerDay: _pricePerDay,
            minRentalDays: _minRentalDays,
            maxRentalDays: _maxRentalDays,
            isActive: true,
            collateralRequired: _collateralRequired,
            createdAt: block.timestamp,
            category: _category
        });

        nftToListing[_nftContract][_tokenId] = listingId;
        ownerListings[msg.sender].push(listingId);

        emit ListingCreated(
            listingId,
            _nftContract,
            _tokenId,
            msg.sender,
            _pricePerDay,
            _category
        );
    }

    /**
     * @dev Rent an NFT
     */
    function rentNFT(
        uint256 _listingId,
        uint256 _rentalDays
    ) external payable nonReentrant whenNotPaused {
        RentalListing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");
        require(listing.owner != msg.sender, "Cannot rent own NFT");
        require(_rentalDays >= listing.minRentalDays && _rentalDays <= listing.maxRentalDays, "Invalid rental duration");

        // Check if NFT supports ERC4907
        bool supportsERC4907 = IERC721(listing.nftContract).supportsInterface(type(IERC4907).interfaceId);
        require(supportsERC4907, "NFT does not support ERC4907");

        // Check if NFT is currently available
        if (supportsERC4907) {
            require(
                IERC4907(listing.nftContract).userExpires(listing.tokenId) < block.timestamp,
                "NFT currently rented"
            );
        }

        uint256 totalCost = listing.pricePerDay * _rentalDays;
        uint256 platformFee = (totalCost * platformFeePercentage) / FEE_DENOMINATOR;
        uint256 ownerPayment = totalCost - platformFee;

        _rentalIds.increment();
        uint256 rentalId = _rentalIds.current();

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (_rentalDays * 1 days);

        rentals[rentalId] = RentalAgreement({
            rentalId: rentalId,
            listingId: _listingId,
            renter: msg.sender,
            startTime: startTime,
            endTime: endTime,
            totalCost: totalCost,
            collateralDeposit: listing.collateralRequired,
            status: RentalStatus.ACTIVE,
            createdAt: block.timestamp
        });

        renterAgreements[msg.sender].push(rentalId);

        // Handle payment
        if (listing.paymentToken == address(0)) {
            // ETH payment
            require(msg.value >= totalCost + listing.collateralRequired, "Insufficient payment");
            
            // Send payment to owner
            payable(listing.owner).transfer(ownerPayment);
            
            // Send platform fee
            payable(feeRecipient).transfer(platformFee);
            
            // Refund excess
            if (msg.value > totalCost + listing.collateralRequired) {
                payable(msg.sender).transfer(msg.value - totalCost - listing.collateralRequired);
            }
        } else {
            // ERC20 payment
            IERC20(listing.paymentToken).safeTransferFrom(
                msg.sender,
                address(this),
                totalCost + listing.collateralRequired
            );
            
            IERC20(listing.paymentToken).safeTransfer(listing.owner, ownerPayment);
            IERC20(listing.paymentToken).safeTransfer(feeRecipient, platformFee);
        }

        // Set user in ERC4907
        IERC4907(listing.nftContract).setUser(listing.tokenId, msg.sender, uint64(endTime));

        emit RentalStarted(rentalId, _listingId, msg.sender, startTime, endTime, totalCost);
    }

    /**
     * @dev Complete a rental (can be called by anyone after expiry)
     */
    function completeRental(uint256 _rentalId) external nonReentrant {
        RentalAgreement storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.ACTIVE, "Rental not active");
        require(block.timestamp > rental.endTime, "Rental not expired");

        rental.status = RentalStatus.COMPLETED;

        RentalListing storage listing = listings[rental.listingId];

        // Clear user in ERC4907
        IERC4907(listing.nftContract).setUser(listing.tokenId, address(0), 0);

        // Return collateral if no disputes
        if (rental.collateralDeposit > 0) {
            if (listing.paymentToken == address(0)) {
                payable(rental.renter).transfer(rental.collateralDeposit);
            } else {
                IERC20(listing.paymentToken).safeTransfer(rental.renter, rental.collateralDeposit);
            }
        }

        emit RentalCompleted(_rentalId);
    }

    /**
     * @dev Extend an active rental
     */
    function extendRental(
        uint256 _rentalId,
        uint256 _additionalDays
    ) external payable nonReentrant onlyActiveRental(_rentalId) onlyRenter(_rentalId) {
        RentalAgreement storage rental = rentals[_rentalId];
        RentalListing storage listing = listings[rental.listingId];

        require(_additionalDays > 0, "Must extend by at least 1 day");

        uint256 totalDays = ((rental.endTime - rental.startTime) / 1 days) + _additionalDays;
        require(totalDays <= listing.maxRentalDays, "Exceeds maximum rental period");

        uint256 additionalCost = listing.pricePerDay * _additionalDays;
        uint256 platformFee = (additionalCost * platformFeePercentage) / FEE_DENOMINATOR;
        uint256 ownerPayment = additionalCost - platformFee;

        // Handle additional payment
        if (listing.paymentToken == address(0)) {
            require(msg.value >= additionalCost, "Insufficient payment");
            payable(listing.owner).transfer(ownerPayment);
            payable(feeRecipient).transfer(platformFee);
            
            if (msg.value > additionalCost) {
                payable(msg.sender).transfer(msg.value - additionalCost);
            }
        } else {
            IERC20(listing.paymentToken).safeTransferFrom(msg.sender, listing.owner, ownerPayment);
            IERC20(listing.paymentToken).safeTransferFrom(msg.sender, feeRecipient, platformFee);
        }

        uint256 newEndTime = rental.endTime + (_additionalDays * 1 days);
        rental.endTime = newEndTime;
        rental.totalCost += additionalCost;

        // Update user expiry in ERC4907
        IERC4907(listing.nftContract).setUser(listing.tokenId, rental.renter, uint64(newEndTime));

        emit RentalExtended(_rentalId, newEndTime, additionalCost);
    }

    /**
     * @dev Update listing parameters
     */
    function updateListing(
        uint256 _listingId,
        uint256 _pricePerDay,
        uint256 _minRentalDays,
        uint256 _maxRentalDays,
        uint256 _collateralRequired
    ) external onlyListingOwner(_listingId) {
        RentalListing storage listing = listings[_listingId];
        require(listing.isActive, "Listing not active");

        if (_pricePerDay > 0) listing.pricePerDay = _pricePerDay;
        if (_minRentalDays > 0) listing.minRentalDays = _minRentalDays;
        if (_maxRentalDays >= _minRentalDays) listing.maxRentalDays = _maxRentalDays;
        listing.collateralRequired = _collateralRequired;

        emit ListingUpdated(_listingId, _pricePerDay, _minRentalDays, _maxRentalDays);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 _listingId) external onlyListingOwner(_listingId) {
        RentalListing storage listing = listings[_listingId];
        require(listing.isActive, "Listing already inactive");

        // Check if NFT is currently rented
        bool supportsERC4907 = IERC721(listing.nftContract).supportsInterface(type(IERC4907).interfaceId);
        if (supportsERC4907) {
            require(
                IERC4907(listing.nftContract).userExpires(listing.tokenId) < block.timestamp,
                "Cannot cancel while rented"
            );
        }

        listing.isActive = false;
        nftToListing[listing.nftContract][listing.tokenId] = 0;

        emit ListingCancelled(_listingId);
    }

    /**
     * @dev Raise a dispute for a rental
     */
    function raiseDispute(uint256 _rentalId, string calldata _reason) external {
        RentalAgreement storage rental = rentals[_rentalId];
        RentalListing storage listing = listings[rental.listingId];
        
        require(
            msg.sender == rental.renter || msg.sender == listing.owner,
            "Only renter or owner can raise dispute"
        );
        require(rental.status == RentalStatus.ACTIVE, "Rental not active");

        rental.status = RentalStatus.DISPUTED;

        emit DisputeRaised(_rentalId, msg.sender, _reason);
    }

    /**
     * @dev Resolve a dispute (only admin)
     */
    function resolveDispute(
        uint256 _rentalId,
        address _winner,
        uint256 _compensation
    ) external onlyRole(ADMIN_ROLE) {
        RentalAgreement storage rental = rentals[_rentalId];
        require(rental.status == RentalStatus.DISPUTED, "No dispute to resolve");

        RentalListing storage listing = listings[rental.listingId];
        
        require(
            _winner == rental.renter || _winner == listing.owner,
            "Invalid winner"
        );

        rental.status = RentalStatus.COMPLETED;

        // Handle compensation from collateral
        if (_compensation > 0 && rental.collateralDeposit >= _compensation) {
            if (listing.paymentToken == address(0)) {
                payable(_winner).transfer(_compensation);
                if (rental.collateralDeposit > _compensation) {
                    address loser = _winner == rental.renter ? listing.owner : rental.renter;
                    payable(loser).transfer(rental.collateralDeposit - _compensation);
                }
            } else {
                IERC20(listing.paymentToken).safeTransfer(_winner, _compensation);
                if (rental.collateralDeposit > _compensation) {
                    address loser = _winner == rental.renter ? listing.owner : rental.renter;
                    IERC20(listing.paymentToken).safeTransfer(loser, rental.collateralDeposit - _compensation);
                }
            }
        } else if (_compensation == 0) {
            // Return full collateral to renter
            if (listing.paymentToken == address(0)) {
                payable(rental.renter).transfer(rental.collateralDeposit);
            } else {
                IERC20(listing.paymentToken).safeTransfer(rental.renter, rental.collateralDeposit);
            }
        }

        // Clear user in ERC4907
        IERC4907(listing.nftContract).setUser(listing.tokenId, address(0), 0);

        emit DisputeResolved(_rentalId, _winner, _compensation);
    }

    /**
     * @dev Add supported payment token
     */
    function addSupportedPaymentToken(address _token) external onlyRole(ADMIN_ROLE) {
        supportedPaymentTokens[_token] = true;
    }

    /**
     * @dev Remove supported payment token
     */
    function removeSupportedPaymentToken(address _token) external onlyRole(ADMIN_ROLE) {
        supportedPaymentTokens[_token] = false;
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _feePercentage) external onlyRole(ADMIN_ROLE) {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _feePercentage;
    }

    /**
     * @dev Update fee recipient
     */
    function updateFeeRecipient(address _feeRecipient) external onlyRole(ADMIN_ROLE) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Emergency pause
     */
    function emergencyPause() external {
        require(
            hasRole(ADMIN_ROLE, msg.sender) || emergencyPauseOperators[msg.sender],
            "Not authorized"
        );
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Add emergency pause operator
     */
    function addEmergencyPauseOperator(address _operator) external onlyRole(ADMIN_ROLE) {
        emergencyPauseOperators[_operator] = true;
    }

    /**
     * @dev Remove emergency pause operator
     */
    function removeEmergencyPauseOperator(address _operator) external onlyRole(ADMIN_ROLE) {
        emergencyPauseOperators[_operator] = false;
    }

    // View functions
    function getListingsByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerListings[_owner];
    }

    function getRentalsByRenter(address _renter) external view returns (uint256[] memory) {
        return renterAgreements[_renter];
    }

    function isNFTRented(address _nftContract, uint256 _tokenId) external view returns (bool) {
        bool supportsERC4907 = IERC721(_nftContract).supportsInterface(type(IERC4907).interfaceId);
        if (supportsERC4907) {
            return IERC4907(_nftContract).userExpires(_tokenId) >= block.timestamp;
        }
        return false;
    }

    function getCurrentRentalId() external view returns (uint256) {
        return _rentalIds.current();
    }

    // Emergency withdrawal function (only admin)
    function emergencyWithdraw(address _token) external onlyRole(ADMIN_ROLE) {
        if (_token == address(0)) {
            payable(msg.sender).transfer(address(this).balance);
        } else {
            IERC20(_token).safeTransfer(msg.sender, IERC20(_token).balanceOf(address(this)));
        }
    }
}