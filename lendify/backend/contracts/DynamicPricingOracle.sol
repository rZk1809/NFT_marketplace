// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
 * @title DynamicPricingOracle
 * @dev AI-powered dynamic pricing oracle for NFT rentals with Chainlink integration
 */
contract DynamicPricingOracle is ReentrancyGuard, AccessControl, Pausable, VRFConsumerBaseV2 {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");

    VRFCoordinatorV2Interface public immutable vrfCoordinator;
    
    // VRF parameters
    uint64 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;

    struct PriceData {
        uint256 basePrice;
        uint256 dynamicMultiplier; // 10000 = 1.0x, 15000 = 1.5x
        uint256 lastUpdate;
        uint256 confidence; // 0-10000, higher is better
        uint256 demandScore; // 0-10000
        uint256 rarityScore; // 0-10000
        uint256 utilityScore; // 0-10000
        uint256 marketSentiment; // 0-10000
        bool isActive;
    }

    struct CollectionMetrics {
        uint256 floorPrice;
        uint256 volume24h;
        uint256 averageRentalDuration;
        uint256 totalRentals;
        uint256 activeRentals;
        uint256 uniqueRenters;
        uint256 ownerCount;
        uint256 lastMetricsUpdate;
        mapping(address => uint256) userRentalHistory;
    }

    struct AIAnalysisRequest {
        uint256 requestId;
        address nftContract;
        uint256 tokenId;
        address requester;
        uint256 timestamp;
        bytes32 vrfRequestId;
        bool fulfilled;
        uint256 result;
    }

    struct MarketConditions {
        uint256 ethPrice; // USD price with 8 decimals
        uint256 gasPrice; // Current gas price
        uint256 networkActivity; // 0-10000 scale
        uint256 nftMarketCap; // Total NFT market cap
        uint256 seasonalityFactor; // Time-based factor
        uint256 lastConditionsUpdate;
    }

    mapping(address => mapping(uint256 => PriceData)) public tokenPricing;
    mapping(address => CollectionMetrics) public collectionMetrics;
    mapping(uint256 => AIAnalysisRequest) public aiRequests;
    mapping(bytes32 => uint256) public vrfRequestToAI;
    
    // External price feeds
    mapping(string => AggregatorV3Interface) public priceFeeds;
    MarketConditions public marketConditions;
    
    // AI model parameters
    mapping(string => uint256) public aiModelWeights;
    uint256 public aiModelVersion = 1;
    uint256 public constant MULTIPLIER_DENOMINATOR = 10000;
    
    // Dynamic pricing parameters
    uint256 public basePriceUpdateInterval = 3600; // 1 hour
    uint256 public maxPriceMultiplier = 50000; // 5x max
    uint256 public minPriceMultiplier = 1000; // 0.1x min
    uint256 public volatilityThreshold = 2000; // 20%

    event PriceUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 multiplier,
        uint256 confidence
    );

    event AIAnalysisRequested(
        uint256 indexed requestId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address requester
    );

    event AIAnalysisCompleted(
        uint256 indexed requestId,
        uint256 result,
        uint256 confidence
    );

    event MarketConditionsUpdated(
        uint256 ethPrice,
        uint256 gasPrice,
        uint256 networkActivity
    );

    event ModelWeightUpdated(string parameter, uint256 oldWeight, uint256 newWeight);

    modifier validCollection(address _nftContract) {
        require(_nftContract != address(0), "Invalid NFT contract");
        _;
    }

    modifier validToken(address _nftContract, uint256 _tokenId) {
        require(tokenPricing[_nftContract][_tokenId].isActive, "Token pricing not active");
        _;
    }

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);

        _initializeAIModelWeights();
        _initializePriceFeeds();
    }

    /**
     * @dev Initialize AI model weights
     */
    function _initializeAIModelWeights() internal {
        aiModelWeights["demand"] = 2500; // 25%
        aiModelWeights["rarity"] = 2000; // 20%
        aiModelWeights["utility"] = 2000; // 20%
        aiModelWeights["market_sentiment"] = 1500; // 15%
        aiModelWeights["seasonality"] = 1000; // 10%
        aiModelWeights["gas_price"] = 500; // 5%
        aiModelWeights["network_activity"] = 500; // 5%
    }

    /**
     * @dev Initialize Chainlink price feeds
     */
    function _initializePriceFeeds() internal {
        // These addresses are for Ethereum mainnet - adjust for other networks
        // ETH/USD feed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        // Add more feeds as needed
    }

    /**
     * @dev Set price feed for a given pair
     */
    function setPriceFeed(string calldata _pair, address _feedAddress) external onlyRole(ADMIN_ROLE) {
        priceFeeds[_pair] = AggregatorV3Interface(_feedAddress);
    }

    /**
     * @dev Initialize pricing for a token
     */
    function initializeTokenPricing(
        address _nftContract,
        uint256 _tokenId,
        uint256 _basePrice,
        uint256 _rarityScore
    ) external onlyRole(ORACLE_ROLE) validCollection(_nftContract) {
        require(_basePrice > 0, "Base price must be positive");
        require(_rarityScore <= MULTIPLIER_DENOMINATOR, "Invalid rarity score");

        tokenPricing[_nftContract][_tokenId] = PriceData({
            basePrice: _basePrice,
            dynamicMultiplier: MULTIPLIER_DENOMINATOR,
            lastUpdate: block.timestamp,
            confidence: 5000, // Start with medium confidence
            demandScore: 5000,
            rarityScore: _rarityScore,
            utilityScore: 5000,
            marketSentiment: 5000,
            isActive: true
        });
    }

    /**
     * @dev Request AI analysis for dynamic pricing
     */
    function requestAIAnalysis(
        address _nftContract,
        uint256 _tokenId
    ) external returns (uint256 requestId) {
        require(tokenPricing[_nftContract][_tokenId].isActive, "Token pricing not initialized");

        // Request randomness from Chainlink VRF for entropy
        bytes32 vrfRequestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1
        );

        requestId = uint256(keccak256(abi.encodePacked(
            _nftContract,
            _tokenId,
            msg.sender,
            block.timestamp,
            vrfRequestId
        )));

        aiRequests[requestId] = AIAnalysisRequest({
            requestId: requestId,
            nftContract: _nftContract,
            tokenId: _tokenId,
            requester: msg.sender,
            timestamp: block.timestamp,
            vrfRequestId: vrfRequestId,
            fulfilled: false,
            result: 0
        });

        vrfRequestToAI[vrfRequestId] = requestId;

        emit AIAnalysisRequested(requestId, _nftContract, _tokenId, msg.sender);
        return requestId;
    }

    /**
     * @dev Chainlink VRF callback
     */
    function fulfillRandomWords(bytes32 _requestId, uint256[] memory _randomWords) internal override {
        uint256 aiRequestId = vrfRequestToAI[_requestId];
        require(aiRequestId != 0, "Invalid VRF request");

        AIAnalysisRequest storage request = aiRequests[aiRequestId];
        require(!request.fulfilled, "Request already fulfilled");

        // Simulate AI analysis using randomness and current data
        uint256 aiResult = _performAIAnalysis(
            request.nftContract,
            request.tokenId,
            _randomWords[0]
        );

        request.fulfilled = true;
        request.result = aiResult;

        // Update token pricing based on AI analysis
        _updatePricingFromAI(request.nftContract, request.tokenId, aiResult);

        emit AIAnalysisCompleted(aiRequestId, aiResult, tokenPricing[request.nftContract][request.tokenId].confidence);
    }

    /**
     * @dev Perform AI analysis simulation
     */
    function _performAIAnalysis(
        address _nftContract,
        uint256 _tokenId,
        uint256 _randomness
    ) internal view returns (uint256) {
        PriceData memory pricing = tokenPricing[_nftContract][_tokenId];
        CollectionMetrics storage metrics = collectionMetrics[_nftContract];
        
        // Simulate complex AI analysis
        uint256 demandFactor = _calculateDemandFactor(metrics, _randomness);
        uint256 marketFactor = _calculateMarketFactor();
        uint256 rarityFactor = pricing.rarityScore;
        uint256 utilityFactor = _calculateUtilityFactor(_nftContract, _tokenId);
        
        // Weighted combination of factors
        uint256 result = (
            (demandFactor * aiModelWeights["demand"]) +
            (rarityFactor * aiModelWeights["rarity"]) +
            (utilityFactor * aiModelWeights["utility"]) +
            (marketFactor * aiModelWeights["market_sentiment"])
        ) / MULTIPLIER_DENOMINATOR;

        return result;
    }

    /**
     * @dev Calculate demand factor based on rental history and activity
     */
    function _calculateDemandFactor(
        CollectionMetrics storage _metrics,
        uint256 _randomness
    ) internal view returns (uint256) {
        if (_metrics.totalRentals == 0) return 5000; // Neutral if no history
        
        // Factor in rental frequency, active rentals, and some randomness
        uint256 rentalRate = (_metrics.activeRentals * MULTIPLIER_DENOMINATOR) / _metrics.totalRentals;
        uint256 activityBonus = _metrics.uniqueRenters > 10 ? 1000 : (_metrics.uniqueRenters * 100);
        uint256 randomFactor = (_randomness % 2000) + 4000; // 40-60% base
        
        return (rentalRate + activityBonus + randomFactor) / 3;
    }

    /**
     * @dev Calculate market factor based on overall conditions
     */
    function _calculateMarketFactor() internal view returns (uint256) {
        MarketConditions memory conditions = marketConditions;
        
        // Simple market sentiment calculation
        uint256 ethFactor = conditions.ethPrice > 0 ? 
            (conditions.ethPrice / 1e6) : 5000; // Normalize ETH price factor
        
        uint256 activityFactor = conditions.networkActivity;
        uint256 gasFactor = conditions.gasPrice < 50 gwei ? 8000 : 
                           conditions.gasPrice < 100 gwei ? 6000 : 4000;
        
        return (ethFactor + activityFactor + gasFactor) / 3;
    }

    /**
     * @dev Calculate utility factor for NFT
     */
    function _calculateUtilityFactor(address _nftContract, uint256 _tokenId) internal view returns (uint256) {
        // This would integrate with external utility APIs or on-chain data
        // For now, return stored utility score
        return tokenPricing[_nftContract][_tokenId].utilityScore;
    }

    /**
     * @dev Update pricing based on AI analysis result
     */
    function _updatePricingFromAI(
        address _nftContract,
        uint256 _tokenId,
        uint256 _aiResult
    ) internal {
        PriceData storage pricing = tokenPricing[_nftContract][_tokenId];
        uint256 oldMultiplier = pricing.dynamicMultiplier;
        
        // Convert AI result to price multiplier
        uint256 newMultiplier = _aiResult;
        
        // Apply bounds
        if (newMultiplier > maxPriceMultiplier) {
            newMultiplier = maxPriceMultiplier;
        } else if (newMultiplier < minPriceMultiplier) {
            newMultiplier = minPriceMultiplier;
        }
        
        // Gradual adjustment to prevent price shock
        uint256 adjustment = newMultiplier > oldMultiplier ?
            (newMultiplier - oldMultiplier) / 10 : // 10% of increase
            (oldMultiplier - newMultiplier) / 10;   // 10% of decrease
            
        newMultiplier = newMultiplier > oldMultiplier ?
            oldMultiplier + adjustment :
            oldMultiplier - adjustment;

        pricing.dynamicMultiplier = newMultiplier;
        pricing.lastUpdate = block.timestamp;
        pricing.confidence = _calculateConfidence(_nftContract, _tokenId);

        uint256 oldPrice = (pricing.basePrice * oldMultiplier) / MULTIPLIER_DENOMINATOR;
        uint256 newPrice = (pricing.basePrice * newMultiplier) / MULTIPLIER_DENOMINATOR;

        emit PriceUpdated(_nftContract, _tokenId, oldPrice, newPrice, newMultiplier, pricing.confidence);
    }

    /**
     * @dev Calculate confidence score based on data freshness and market stability
     */
    function _calculateConfidence(address _nftContract, uint256 _tokenId) internal view returns (uint256) {
        PriceData memory pricing = tokenPricing[_nftContract][_tokenId];
        CollectionMetrics memory metrics = collectionMetrics[_nftContract];
        
        // Base confidence from data recency
        uint256 timeSinceUpdate = block.timestamp - pricing.lastUpdate;
        uint256 freshnessScore = timeSinceUpdate < 3600 ? 10000 : 
                                timeSinceUpdate < 86400 ? 7000 : 5000;
        
        // Confidence from sample size
        uint256 sampleScore = metrics.totalRentals > 100 ? 10000 :
                             metrics.totalRentals > 20 ? 7000 :
                             metrics.totalRentals > 5 ? 5000 : 3000;
        
        // Market stability factor
        uint256 stabilityScore = 8000; // Assume reasonable stability
        
        return (freshnessScore + sampleScore + stabilityScore) / 3;
    }

    /**
     * @dev Get current price for token
     */
    function getCurrentPrice(
        address _nftContract,
        uint256 _tokenId
    ) external view validToken(_nftContract, _tokenId) returns (uint256, uint256) {
        PriceData memory pricing = tokenPricing[_nftContract][_tokenId];
        uint256 currentPrice = (pricing.basePrice * pricing.dynamicMultiplier) / MULTIPLIER_DENOMINATOR;
        return (currentPrice, pricing.confidence);
    }

    /**
     * @dev Update market conditions (called by oracle)
     */
    function updateMarketConditions(
        uint256 _ethPrice,
        uint256 _gasPrice,
        uint256 _networkActivity
    ) external onlyRole(ORACLE_ROLE) {
        marketConditions = MarketConditions({
            ethPrice: _ethPrice,
            gasPrice: _gasPrice,
            networkActivity: _networkActivity,
            nftMarketCap: marketConditions.nftMarketCap,
            seasonalityFactor: _calculateSeasonalityFactor(),
            lastConditionsUpdate: block.timestamp
        });

        emit MarketConditionsUpdated(_ethPrice, _gasPrice, _networkActivity);
    }

    /**
     * @dev Calculate seasonality factor based on time
     */
    function _calculateSeasonalityFactor() internal view returns (uint256) {
        // Simple seasonality based on month
        uint256 month = (block.timestamp / 2629746) % 12; // Approximate month
        
        // Higher activity in certain months (crypto seasons)
        if (month == 0 || month == 3 || month == 10 || month == 11) { // Jan, Apr, Nov, Dec
            return 12000; // 20% boost
        } else if (month == 6 || month == 7) { // Jul, Aug (summer lull)
            return 8000; // 20% reduction
        }
        
        return MULTIPLIER_DENOMINATOR; // Neutral
    }

    /**
     * @dev Update collection metrics after rental events
     */
    function updateCollectionMetrics(
        address _nftContract,
        uint256 _rentalDuration,
        address _renter,
        bool _isNewRental
    ) external onlyRole(ORACLE_ROLE) validCollection(_nftContract) {
        CollectionMetrics storage metrics = collectionMetrics[_nftContract];
        
        if (_isNewRental) {
            metrics.totalRentals++;
            metrics.activeRentals++;
            
            // Track unique renters
            if (metrics.userRentalHistory[_renter] == 0) {
                metrics.uniqueRenters++;
            }
            metrics.userRentalHistory[_renter]++;
        } else {
            // Rental ended
            if (metrics.activeRentals > 0) {
                metrics.activeRentals--;
            }
            
            // Update average duration
            uint256 totalDuration = metrics.averageRentalDuration * (metrics.totalRentals - 1);
            metrics.averageRentalDuration = (totalDuration + _rentalDuration) / metrics.totalRentals;
        }
        
        metrics.lastMetricsUpdate = block.timestamp;
    }

    /**
     * @dev Update AI model weights (admin only)
     */
    function updateModelWeight(
        string calldata _parameter,
        uint256 _weight
    ) external onlyRole(ADMIN_ROLE) {
        uint256 oldWeight = aiModelWeights[_parameter];
        aiModelWeights[_parameter] = _weight;
        emit ModelWeightUpdated(_parameter, oldWeight, _weight);
    }

    /**
     * @dev Batch update multiple weights
     */
    function batchUpdateModelWeights(
        string[] calldata _parameters,
        uint256[] calldata _weights
    ) external onlyRole(ADMIN_ROLE) {
        require(_parameters.length == _weights.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _parameters.length; i++) {
            uint256 oldWeight = aiModelWeights[_parameters[i]];
            aiModelWeights[_parameters[i]] = _weights[i];
            emit ModelWeightUpdated(_parameters[i], oldWeight, _weights[i]);
        }
    }

    /**
     * @dev Get comprehensive pricing data for token
     */
    function getTokenPricingData(
        address _nftContract,
        uint256 _tokenId
    ) external view returns (
        uint256 currentPrice,
        uint256 basePrice,
        uint256 multiplier,
        uint256 confidence,
        uint256 lastUpdate
    ) {
        PriceData memory pricing = tokenPricing[_nftContract][_tokenId];
        currentPrice = (pricing.basePrice * pricing.dynamicMultiplier) / MULTIPLIER_DENOMINATOR;
        return (
            currentPrice,
            pricing.basePrice,
            pricing.dynamicMultiplier,
            pricing.confidence,
            pricing.lastUpdate
        );
    }

    /**
     * @dev Get collection metrics
     */
    function getCollectionMetrics(
        address _nftContract
    ) external view returns (
        uint256 floorPrice,
        uint256 volume24h,
        uint256 totalRentals,
        uint256 activeRentals,
        uint256 uniqueRenters,
        uint256 averageDuration
    ) {
        CollectionMetrics storage metrics = collectionMetrics[_nftContract];
        return (
            metrics.floorPrice,
            metrics.volume24h,
            metrics.totalRentals,
            metrics.activeRentals,
            metrics.uniqueRenters,
            metrics.averageRentalDuration
        );
    }

    // Admin functions
    function updateVRFParameters(
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) external onlyRole(ADMIN_ROLE) {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    function updatePricingParameters(
        uint256 _maxMultiplier,
        uint256 _minMultiplier,
        uint256 _updateInterval,
        uint256 _volatilityThreshold
    ) external onlyRole(ADMIN_ROLE) {
        maxPriceMultiplier = _maxMultiplier;
        minPriceMultiplier = _minMultiplier;
        basePriceUpdateInterval = _updateInterval;
        volatilityThreshold = _volatilityThreshold;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}