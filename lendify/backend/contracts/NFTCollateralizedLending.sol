// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title NFTCollateralizedLending
 * @dev Peer-to-peer NFT-backed lending protocol with dynamic liquidation
 */
contract NFTCollateralizedLending is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant LIQUIDATOR_ROLE = keccak256("LIQUIDATOR_ROLE");

    Counters.Counter private _loanIds;

    struct LoanRequest {
        uint256 loanId;
        address borrower;
        address nftContract;
        uint256 tokenId;
        address loanToken;
        uint256 loanAmount;
        uint256 interestRate; // basis points (1% = 100)
        uint256 duration; // in seconds
        uint256 ltv; // loan to value ratio in basis points
        uint256 collateralValue; // estimated NFT value
        LoanStatus status;
        uint256 createdAt;
        string metadataURI;
    }

    struct Loan {
        uint256 loanId;
        uint256 requestId;
        address lender;
        uint256 startTime;
        uint256 endTime;
        uint256 repaidAmount;
        uint256 totalOwed;
        bool isRepaid;
        bool isLiquidated;
        uint256 liquidationThreshold;
        uint256 lastPriceUpdate;
        uint256 currentCollateralValue;
    }

    struct LiquidationData {
        uint256 loanId;
        address liquidator;
        uint256 liquidationPrice;
        uint256 liquidationTime;
        uint256 liquidatorReward;
        uint256 borrowerRecovered;
    }

    enum LoanStatus {
        REQUESTED,
        FUNDED,
        ACTIVE,
        REPAID,
        LIQUIDATED,
        CANCELLED
    }

    mapping(uint256 => LoanRequest) public loanRequests;
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => LiquidationData) public liquidations;
    mapping(address => mapping(uint256 => uint256)) public nftToLoan;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    
    // Oracle price feeds for different NFT collections
    mapping(address => AggregatorV3Interface) public nftPriceFeeds;
    mapping(address => uint256) public collectionFloorPrices;
    mapping(address => uint256) public priceUpdateTimestamps;

    // Platform configuration
    uint256 public platformFeePercentage = 100; // 1%
    uint256 public liquidationFeePercentage = 500; // 5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_INTEREST_RATE = 10000; // 100%
    uint256 public constant MAX_LTV = 8000; // 80%
    uint256 public constant MIN_LOAN_DURATION = 1 days;
    uint256 public constant MAX_LOAN_DURATION = 365 days;
    
    address public feeRecipient;
    address public liquidationPool;

    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed nftContract,
        uint256 tokenId,
        uint256 loanAmount,
        uint256 interestRate
    );

    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 fundingAmount
    );

    event LoanRepaid(
        uint256 indexed loanId,
        uint256 repaidAmount,
        uint256 interestPaid
    );

    event LoanLiquidated(
        uint256 indexed loanId,
        address indexed liquidator,
        uint256 liquidationPrice
    );

    event CollateralValueUpdated(
        address indexed nftContract,
        uint256 newFloorPrice,
        uint256 timestamp
    );

    event PriceFeedUpdated(
        address indexed nftContract,
        address indexed priceFeed
    );

    modifier validLoanRequest(uint256 _loanId) {
        require(_loanId > 0 && _loanId <= _loanIds.current(), "Invalid loan ID");
        require(loanRequests[_loanId].status == LoanStatus.REQUESTED, "Loan not available");
        _;
    }

    modifier onlyBorrower(uint256 _loanId) {
        require(loanRequests[_loanId].borrower == msg.sender, "Not borrower");
        _;
    }

    modifier onlyActiveLoan(uint256 _loanId) {
        require(loans[_loanId].startTime > 0, "Loan not active");
        require(!loans[_loanId].isRepaid, "Loan already repaid");
        require(!loans[_loanId].isLiquidated, "Loan liquidated");
        _;
    }

    constructor(address _feeRecipient, address _liquidationPool) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
        liquidationPool = _liquidationPool;
    }

    /**
     * @dev Request a loan using NFT as collateral
     */
    function requestLoan(
        address _nftContract,
        uint256 _tokenId,
        address _loanToken,
        uint256 _loanAmount,
        uint256 _interestRate,
        uint256 _duration,
        string calldata _metadataURI
    ) external nonReentrant whenNotPaused {
        require(IERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "Not NFT owner");
        require(_loanAmount > 0, "Loan amount must be positive");
        require(_interestRate <= MAX_INTEREST_RATE, "Interest rate too high");
        require(_duration >= MIN_LOAN_DURATION && _duration <= MAX_LOAN_DURATION, "Invalid duration");
        require(nftToLoan[_nftContract][_tokenId] == 0, "NFT already used as collateral");

        // Transfer NFT to contract as collateral
        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        _loanIds.increment();
        uint256 loanId = _loanIds.current();

        // Get current collateral value
        uint256 collateralValue = _getCollateralValue(_nftContract, _tokenId);
        uint256 ltv = (_loanAmount * FEE_DENOMINATOR) / collateralValue;
        require(ltv <= MAX_LTV, "LTV too high");

        loanRequests[loanId] = LoanRequest({
            loanId: loanId,
            borrower: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            loanToken: _loanToken,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            duration: _duration,
            ltv: ltv,
            collateralValue: collateralValue,
            status: LoanStatus.REQUESTED,
            createdAt: block.timestamp,
            metadataURI: _metadataURI
        });

        nftToLoan[_nftContract][_tokenId] = loanId;
        borrowerLoans[msg.sender].push(loanId);

        emit LoanRequested(
            loanId,
            msg.sender,
            _nftContract,
            _tokenId,
            _loanAmount,
            _interestRate
        );
    }

    /**
     * @dev Fund a loan request
     */
    function fundLoan(uint256 _loanId) external nonReentrant validLoanRequest(_loanId) whenNotPaused {
        LoanRequest storage request = loanRequests[_loanId];
        require(request.borrower != msg.sender, "Cannot fund own loan");

        // Transfer loan amount from lender to borrower
        uint256 platformFee = (request.loanAmount * platformFeePercentage) / FEE_DENOMINATOR;
        uint256 borrowerReceives = request.loanAmount - platformFee;

        IERC20(request.loanToken).safeTransferFrom(msg.sender, request.borrower, borrowerReceives);
        IERC20(request.loanToken).safeTransferFrom(msg.sender, feeRecipient, platformFee);

        // Create active loan
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + request.duration;
        uint256 totalOwed = request.loanAmount + ((request.loanAmount * request.interestRate) / FEE_DENOMINATOR);

        loans[_loanId] = Loan({
            loanId: _loanId,
            requestId: _loanId,
            lender: msg.sender,
            startTime: startTime,
            endTime: endTime,
            repaidAmount: 0,
            totalOwed: totalOwed,
            isRepaid: false,
            isLiquidated: false,
            liquidationThreshold: (request.collateralValue * 8000) / FEE_DENOMINATOR, // 80% of collateral value
            lastPriceUpdate: block.timestamp,
            currentCollateralValue: request.collateralValue
        });

        request.status = LoanStatus.FUNDED;
        lenderLoans[msg.sender].push(_loanId);

        emit LoanFunded(_loanId, msg.sender, request.loanAmount);
    }

    /**
     * @dev Repay loan
     */
    function repayLoan(uint256 _loanId) external nonReentrant onlyActiveLoan(_loanId) onlyBorrower(_loanId) {
        Loan storage loan = loans[_loanId];
        LoanRequest storage request = loanRequests[_loanId];

        uint256 repaymentAmount = loan.totalOwed;
        
        // Handle early repayment with reduced interest
        if (block.timestamp < loan.endTime) {
            uint256 timeElapsed = block.timestamp - loan.startTime;
            uint256 totalDuration = loan.endTime - loan.startTime;
            uint256 interestPortion = loan.totalOwed - request.loanAmount;
            uint256 proRatedInterest = (interestPortion * timeElapsed) / totalDuration;
            repaymentAmount = request.loanAmount + proRatedInterest;
        }

        // Transfer repayment to lender
        IERC20(request.loanToken).safeTransferFrom(msg.sender, loan.lender, repaymentAmount);

        // Return NFT collateral to borrower
        IERC721(request.nftContract).transferFrom(address(this), request.borrower, request.tokenId);

        loan.isRepaid = true;
        loan.repaidAmount = repaymentAmount;
        request.status = LoanStatus.REPAID;
        nftToLoan[request.nftContract][request.tokenId] = 0;

        emit LoanRepaid(_loanId, repaymentAmount, repaymentAmount - request.loanAmount);
    }

    /**
     * @dev Liquidate undercollateralized loan
     */
    function liquidateLoan(uint256 _loanId) external nonReentrant onlyActiveLoan(_loanId) {
        Loan storage loan = loans[_loanId];
        LoanRequest storage request = loanRequests[_loanId];

        // Update collateral value
        _updateCollateralValue(request.nftContract);
        loan.currentCollateralValue = _getCollateralValue(request.nftContract, request.tokenId);

        // Check if loan is undercollateralized or expired
        bool isUndercollateralized = loan.currentCollateralValue < loan.liquidationThreshold;
        bool isExpired = block.timestamp > loan.endTime;
        
        require(isUndercollateralized || isExpired, "Loan not eligible for liquidation");

        // Calculate liquidation proceeds
        uint256 debtAmount = loan.totalOwed;
        uint256 liquidationReward = (loan.currentCollateralValue * liquidationFeePercentage) / FEE_DENOMINATOR;
        uint256 lenderRecovery = loan.currentCollateralValue - liquidationReward;

        if (lenderRecovery > debtAmount) {
            lenderRecovery = debtAmount;
            uint256 borrowerRecovery = loan.currentCollateralValue - debtAmount - liquidationReward;
            
            // Transfer NFT to liquidation pool for auction
            IERC721(request.nftContract).transferFrom(address(this), liquidationPool, request.tokenId);
            
            // Record liquidation with borrower recovery
            liquidations[_loanId] = LiquidationData({
                loanId: _loanId,
                liquidator: msg.sender,
                liquidationPrice: loan.currentCollateralValue,
                liquidationTime: block.timestamp,
                liquidatorReward: liquidationReward,
                borrowerRecovered: borrowerRecovery
            });
        } else {
            // Full liquidation - NFT goes to liquidator
            IERC721(request.nftContract).transferFrom(address(this), msg.sender, request.tokenId);
            
            liquidations[_loanId] = LiquidationData({
                loanId: _loanId,
                liquidator: msg.sender,
                liquidationPrice: loan.currentCollateralValue,
                liquidationTime: block.timestamp,
                liquidatorReward: liquidationReward,
                borrowerRecovered: 0
            });
        }

        loan.isLiquidated = true;
        request.status = LoanStatus.LIQUIDATED;
        nftToLoan[request.nftContract][request.tokenId] = 0;

        emit LoanLiquidated(_loanId, msg.sender, loan.currentCollateralValue);
    }

    /**
     * @dev Cancel loan request
     */
    function cancelLoanRequest(uint256 _loanId) external validLoanRequest(_loanId) onlyBorrower(_loanId) {
        LoanRequest storage request = loanRequests[_loanId];
        
        // Return NFT to borrower
        IERC721(request.nftContract).transferFrom(address(this), request.borrower, request.tokenId);
        
        request.status = LoanStatus.CANCELLED;
        nftToLoan[request.nftContract][request.tokenId] = 0;
    }

    /**
     * @dev Update collateral value using oracle
     */
    function _updateCollateralValue(address _nftContract) internal {
        if (address(nftPriceFeeds[_nftContract]) != address(0)) {
            try nftPriceFeeds[_nftContract].latestRoundData() returns (
                uint80,
                int256 price,
                uint256,
                uint256,
                uint80
            ) {
                if (price > 0) {
                    collectionFloorPrices[_nftContract] = uint256(price);
                    priceUpdateTimestamps[_nftContract] = block.timestamp;
                    emit CollateralValueUpdated(_nftContract, uint256(price), block.timestamp);
                }
            } catch {
                // Oracle call failed, use last known price
            }
        }
    }

    /**
     * @dev Get collateral value for specific NFT
     */
    function _getCollateralValue(address _nftContract, uint256) internal view returns (uint256) {
        return collectionFloorPrices[_nftContract];
    }

    /**
     * @dev Set price feed for NFT collection (admin only)
     */
    function setPriceFeed(address _nftContract, address _priceFeed) external onlyRole(ADMIN_ROLE) {
        nftPriceFeeds[_nftContract] = AggregatorV3Interface(_priceFeed);
        emit PriceFeedUpdated(_nftContract, _priceFeed);
    }

    /**
     * @dev Update collection floor price (oracle role)
     */
    function updateFloorPrice(address _nftContract, uint256 _floorPrice) external onlyRole(ORACLE_ROLE) {
        collectionFloorPrices[_nftContract] = _floorPrice;
        priceUpdateTimestamps[_nftContract] = block.timestamp;
        emit CollateralValueUpdated(_nftContract, _floorPrice, block.timestamp);
    }

    /**
     * @dev Update platform fee (admin only)
     */
    function updatePlatformFee(uint256 _feePercentage) external onlyRole(ADMIN_ROLE) {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _feePercentage;
    }

    /**
     * @dev Update liquidation fee (admin only)
     */
    function updateLiquidationFee(uint256 _feePercentage) external onlyRole(ADMIN_ROLE) {
        require(_feePercentage <= 2000, "Fee too high"); // Max 20%
        liquidationFeePercentage = _feePercentage;
    }

    // View functions
    function getLoansByBorrower(address _borrower) external view returns (uint256[] memory) {
        return borrowerLoans[_borrower];
    }

    function getLoansByLender(address _lender) external view returns (uint256[] memory) {
        return lenderLoans[_lender];
    }

    function getCollateralValue(address _nftContract, uint256 _tokenId) external view returns (uint256) {
        return _getCollateralValue(_nftContract, _tokenId);
    }

    function isLoanLiquidatable(uint256 _loanId) external view returns (bool) {
        if (loans[_loanId].startTime == 0 || loans[_loanId].isRepaid || loans[_loanId].isLiquidated) {
            return false;
        }

        Loan storage loan = loans[_loanId];
        LoanRequest storage request = loanRequests[_loanId];
        
        uint256 currentValue = _getCollateralValue(request.nftContract, request.tokenId);
        bool isUndercollateralized = currentValue < loan.liquidationThreshold;
        bool isExpired = block.timestamp > loan.endTime;
        
        return isUndercollateralized || isExpired;
    }

    function getLoanHealth(uint256 _loanId) external view returns (uint256) {
        if (loans[_loanId].startTime == 0) return 0;
        
        Loan storage loan = loans[_loanId];
        LoanRequest storage request = loanRequests[_loanId];
        
        uint256 currentValue = _getCollateralValue(request.nftContract, request.tokenId);
        if (loan.totalOwed == 0) return type(uint256).max;
        
        return (currentValue * FEE_DENOMINATOR) / loan.totalOwed;
    }

    // Emergency functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(address _token) external onlyRole(ADMIN_ROLE) {
        if (_token == address(0)) {
            payable(msg.sender).transfer(address(this).balance);
        } else {
            IERC20(_token).safeTransfer(msg.sender, IERC20(_token).balanceOf(address(this)));
        }
    }
}