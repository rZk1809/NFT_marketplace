// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ReputationSystem
 * @dev Soulbound NFTs for tracking user reputation and rental history
 */
contract ReputationSystem is ERC721, ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;
    using Strings for uint256;

    bytes32 public constant MARKETPLACE_ROLE = keccak256("MARKETPLACE_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _tokenIds;

    struct ReputationData {
        uint256 totalRentals;
        uint256 successfulRentals;
        uint256 totalEarnings;
        uint256 totalSpent;
        uint256 disputesRaised;
        uint256 disputesWon;
        uint256 averageRating;
        uint256 totalRatings;
        uint256 joinedAt;
        uint256 lastActivity;
        mapping(bytes32 => uint256) customMetrics;
        ReputationLevel level;
        uint256[] achievements;
    }

    enum ReputationLevel {
        NEWCOMER,      // 0-10 rentals
        TRUSTED,       // 11-50 rentals
        VERIFIED,      // 51-100 rentals
        EXPERT,        // 101-500 rentals
        LEGENDARY      // 500+ rentals
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        bytes32 criteria;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => uint256) public userToTokenId;
    mapping(uint256 => ReputationData) public reputationData;
    mapping(uint256 => Achievement) public achievements;
    mapping(bytes32 => bool) public validMetrics;

    Counters.Counter private _achievementIds;

    event ReputationMinted(address indexed user, uint256 indexed tokenId);
    event ReputationUpdated(address indexed user, uint256 indexed tokenId, string metric, uint256 value);
    event RatingSubmitted(address indexed rater, address indexed rated, uint256 rating);
    event AchievementUnlocked(address indexed user, uint256 indexed achievementId);
    event AchievementCreated(uint256 indexed achievementId, string name, bytes32 criteria);
    event LevelUp(address indexed user, ReputationLevel newLevel);

    modifier onlyTokenOwner(uint256 _tokenId) {
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier onlyValidUser(address _user) {
        require(_user != address(0), "Invalid user address");
        require(userToTokenId[_user] != 0, "User has no reputation token");
        _;
    }

    constructor() ERC721("LendifyReputation", "LREP") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        
        // Initialize valid metrics
        validMetrics[keccak256("TOTAL_RENTALS")] = true;
        validMetrics[keccak256("SUCCESSFUL_RENTALS")] = true;
        validMetrics[keccak256("TOTAL_EARNINGS")] = true;
        validMetrics[keccak256("TOTAL_SPENT")] = true;
        validMetrics[keccak256("DISPUTES_RAISED")] = true;
        validMetrics[keccak256("DISPUTES_WON")] = true;
        
        _createDefaultAchievements();
    }

    /**
     * @dev Mint a reputation NFT for a new user
     */
    function mintReputation(address _user) external onlyRole(MARKETPLACE_ROLE) returns (uint256) {
        require(_user != address(0), "Invalid user address");
        require(userToTokenId[_user] == 0, "User already has reputation token");

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _mint(_user, tokenId);
        userToTokenId[_user] = tokenId;

        ReputationData storage data = reputationData[tokenId];
        data.joinedAt = block.timestamp;
        data.lastActivity = block.timestamp;
        data.level = ReputationLevel.NEWCOMER;

        emit ReputationMinted(_user, tokenId);
        return tokenId;
    }

    /**
     * @dev Update reputation metrics (only marketplace contract)
     */
    function updateReputation(
        address _user,
        bytes32 _metric,
        uint256 _value,
        bool _increment
    ) external onlyRole(MARKETPLACE_ROLE) onlyValidUser(_user) {
        require(validMetrics[_metric], "Invalid metric");

        uint256 tokenId = userToTokenId[_user];
        ReputationData storage data = reputationData[tokenId];

        if (_metric == keccak256("TOTAL_RENTALS")) {
            if (_increment) {
                data.totalRentals += _value;
            } else {
                data.totalRentals = _value;
            }
            _checkLevelUp(_user, tokenId);
        } else if (_metric == keccak256("SUCCESSFUL_RENTALS")) {
            if (_increment) {
                data.successfulRentals += _value;
            } else {
                data.successfulRentals = _value;
            }
        } else if (_metric == keccak256("TOTAL_EARNINGS")) {
            if (_increment) {
                data.totalEarnings += _value;
            } else {
                data.totalEarnings = _value;
            }
        } else if (_metric == keccak256("TOTAL_SPENT")) {
            if (_increment) {
                data.totalSpent += _value;
            } else {
                data.totalSpent = _value;
            }
        } else if (_metric == keccak256("DISPUTES_RAISED")) {
            if (_increment) {
                data.disputesRaised += _value;
            } else {
                data.disputesRaised = _value;
            }
        } else if (_metric == keccak256("DISPUTES_WON")) {
            if (_increment) {
                data.disputesWon += _value;
            } else {
                data.disputesWon = _value;
            }
        } else {
            // Custom metric
            if (_increment) {
                data.customMetrics[_metric] += _value;
            } else {
                data.customMetrics[_metric] = _value;
            }
        }

        data.lastActivity = block.timestamp;
        
        _checkAchievements(_user, tokenId);
        
        emit ReputationUpdated(_user, tokenId, string(abi.encodePacked(_metric)), _value);
    }

    /**
     * @dev Submit a rating for a user
     */
    function submitRating(
        address _ratedUser,
        uint256 _rating
    ) external onlyValidUser(_ratedUser) onlyValidUser(msg.sender) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(_ratedUser != msg.sender, "Cannot rate yourself");

        uint256 tokenId = userToTokenId[_ratedUser];
        ReputationData storage data = reputationData[tokenId];

        // Calculate new average rating
        uint256 totalRatingPoints = data.averageRating * data.totalRatings + _rating;
        data.totalRatings += 1;
        data.averageRating = totalRatingPoints / data.totalRatings;

        emit RatingSubmitted(msg.sender, _ratedUser, _rating);
    }

    /**
     * @dev Check and update user level based on total rentals
     */
    function _checkLevelUp(address _user, uint256 _tokenId) internal {
        ReputationData storage data = reputationData[_tokenId];
        ReputationLevel currentLevel = data.level;
        ReputationLevel newLevel = _calculateLevel(data.totalRentals);

        if (newLevel != currentLevel) {
            data.level = newLevel;
            emit LevelUp(_user, newLevel);
        }
    }

    /**
     * @dev Calculate reputation level based on total rentals
     */
    function _calculateLevel(uint256 _totalRentals) internal pure returns (ReputationLevel) {
        if (_totalRentals >= 500) return ReputationLevel.LEGENDARY;
        if (_totalRentals >= 101) return ReputationLevel.EXPERT;
        if (_totalRentals >= 51) return ReputationLevel.VERIFIED;
        if (_totalRentals >= 11) return ReputationLevel.TRUSTED;
        return ReputationLevel.NEWCOMER;
    }

    /**
     * @dev Check and unlock achievements
     */
    function _checkAchievements(address _user, uint256 _tokenId) internal {
        ReputationData storage data = reputationData[_tokenId];
        
        // Check various achievements
        _checkAchievement(_user, _tokenId, 1); // First rental
        _checkAchievement(_user, _tokenId, 2); // 10 rentals
        _checkAchievement(_user, _tokenId, 3); // 100 rentals
        _checkAchievement(_user, _tokenId, 4); // Perfect rating (5.0)
        _checkAchievement(_user, _tokenId, 5); // High earner
    }

    /**
     * @dev Check specific achievement
     */
    function _checkAchievement(address _user, uint256 _tokenId, uint256 _achievementId) internal {
        ReputationData storage data = reputationData[_tokenId];
        Achievement storage achievement = achievements[_achievementId];
        
        if (!achievement.isActive) return;
        
        // Check if user already has this achievement
        for (uint256 i = 0; i < data.achievements.length; i++) {
            if (data.achievements[i] == _achievementId) return;
        }

        bool unlocked = false;

        if (_achievementId == 1) { // First rental
            unlocked = data.totalRentals >= 1;
        } else if (_achievementId == 2) { // 10 rentals
            unlocked = data.totalRentals >= 10;
        } else if (_achievementId == 3) { // 100 rentals
            unlocked = data.totalRentals >= 100;
        } else if (_achievementId == 4) { // Perfect rating
            unlocked = data.averageRating == 5 && data.totalRatings >= 10;
        } else if (_achievementId == 5) { // High earner
            unlocked = data.totalEarnings >= 100 ether;
        }

        if (unlocked) {
            data.achievements.push(_achievementId);
            emit AchievementUnlocked(_user, _achievementId);
        }
    }

    /**
     * @dev Create default achievements
     */
    function _createDefaultAchievements() internal {
        _createAchievement("First Steps", "Complete your first rental", keccak256("FIRST_RENTAL"));
        _createAchievement("Getting Started", "Complete 10 rentals", keccak256("TEN_RENTALS"));
        _createAchievement("Century Club", "Complete 100 rentals", keccak256("HUNDRED_RENTALS"));
        _createAchievement("Five Star", "Maintain a perfect 5.0 rating with 10+ reviews", keccak256("PERFECT_RATING"));
        _createAchievement("High Roller", "Earn over 100 ETH in rental income", keccak256("HIGH_EARNER"));
    }

    /**
     * @dev Create a new achievement (admin only)
     */
    function createAchievement(
        string memory _name,
        string memory _description,
        bytes32 _criteria
    ) external onlyRole(ADMIN_ROLE) {
        _createAchievement(_name, _description, _criteria);
    }

    function _createAchievement(
        string memory _name,
        string memory _description,
        bytes32 _criteria
    ) internal {
        _achievementIds.increment();
        uint256 achievementId = _achievementIds.current();

        achievements[achievementId] = Achievement({
            id: achievementId,
            name: _name,
            description: _description,
            criteria: _criteria,
            createdAt: block.timestamp,
            isActive: true
        });

        emit AchievementCreated(achievementId, _name, _criteria);
    }

    /**
     * @dev Add valid metric (admin only)
     */
    function addValidMetric(bytes32 _metric) external onlyRole(ADMIN_ROLE) {
        validMetrics[_metric] = true;
    }

    /**
     * @dev Get reputation score (0-1000 scale)
     */
    function getReputationScore(address _user) external view onlyValidUser(_user) returns (uint256) {
        uint256 tokenId = userToTokenId[_user];
        ReputationData storage data = reputationData[tokenId];

        if (data.totalRentals == 0) return 0;

        uint256 successRate = (data.successfulRentals * 100) / data.totalRentals;
        uint256 ratingScore = data.averageRating * 20; // Convert 1-5 to 20-100
        uint256 volumeScore = data.totalRentals > 100 ? 100 : data.totalRentals;
        
        uint256 disputeRatio = data.disputesRaised == 0 ? 100 : 
            data.disputesRaised > data.disputesWon ? 
                (data.disputesWon * 100) / data.disputesRaised : 100;

        uint256 achievementBonus = data.achievements.length * 10;

        uint256 totalScore = (successRate * 3 + ratingScore * 3 + volumeScore + disputeRatio + achievementBonus) / 8;
        
        return totalScore > 1000 ? 1000 : totalScore;
    }

    /**
     * @dev Get user achievements
     */
    function getUserAchievements(address _user) external view onlyValidUser(_user) returns (uint256[] memory) {
        uint256 tokenId = userToTokenId[_user];
        return reputationData[tokenId].achievements;
    }

    /**
     * @dev Get custom metric value
     */
    function getCustomMetric(address _user, bytes32 _metric) external view onlyValidUser(_user) returns (uint256) {
        uint256 tokenId = userToTokenId[_user];
        return reputationData[tokenId].customMetrics[_metric];
    }

    /**
     * @dev Generate dynamic SVG metadata
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Token does not exist");

        ReputationData storage data = reputationData[_tokenId];
        address owner = ownerOf(_tokenId);
        uint256 score = this.getReputationScore(owner);

        string memory levelName = _getLevelName(data.level);
        string memory svg = _generateSVG(_tokenId, score, levelName, data.totalRentals);
        
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Lendify Reputation #',
                        _tokenId.toString(),
                        '", "description": "Soulbound reputation NFT for Lendify Protocol", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [',
                        '{"trait_type": "Reputation Score", "value": ',
                        score.toString(),
                        '},',
                        '{"trait_type": "Level", "value": "',
                        levelName,
                        '"},',
                        '{"trait_type": "Total Rentals", "value": ',
                        data.totalRentals.toString(),
                        '},',
                        '{"trait_type": "Success Rate", "value": ',
                        data.totalRentals > 0 ? ((data.successfulRentals * 100) / data.totalRentals).toString() : "0",
                        '},',
                        '{"trait_type": "Average Rating", "value": ',
                        data.averageRating.toString(),
                        '},',
                        '{"trait_type": "Achievements", "value": ',
                        data.achievements.length.toString(),
                        '}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _getLevelName(ReputationLevel _level) internal pure returns (string memory) {
        if (_level == ReputationLevel.LEGENDARY) return "Legendary";
        if (_level == ReputationLevel.EXPERT) return "Expert";
        if (_level == ReputationLevel.VERIFIED) return "Verified";
        if (_level == ReputationLevel.TRUSTED) return "Trusted";
        return "Newcomer";
    }

    function _generateSVG(
        uint256 _tokenId,
        uint256 _score,
        string memory _level,
        uint256 _totalRentals
    ) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
                '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="400" height="400" fill="url(#bg)"/>',
                '<circle cx="200" cy="150" r="60" fill="none" stroke="white" stroke-width="4"/>',
                '<text x="200" y="160" text-anchor="middle" fill="white" font-size="24" font-weight="bold">',
                _score.toString(),
                '</text>',
                '<text x="200" y="250" text-anchor="middle" fill="white" font-size="20">',
                _level,
                '</text>',
                '<text x="200" y="280" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="16">',
                _totalRentals.toString(),
                ' Rentals</text>',
                '<text x="200" y="350" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-size="14">#',
                _tokenId.toString(),
                '</text>',
                '</svg>'
            )
        );
    }

    // Override transfer functions to make tokens soulbound
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0), "Soulbound: transfer not allowed");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound: approval not allowed");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approval not allowed");
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: transfer not allowed");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Soulbound: transfer not allowed");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: transfer not allowed");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}