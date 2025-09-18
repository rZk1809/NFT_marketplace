import apiService from './api.js';

class SearchService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000; // 2 minutes for search results
    this.searchHistory = JSON.parse(localStorage.getItem('lendify_search_history') || '[]');
    this.savedFilters = JSON.parse(localStorage.getItem('lendify_saved_filters') || '[]');
  }

  // Advanced search with multiple filters
  async searchNFTs(params = {}) {
    const {
      query = '',
      category = '',
      priceMin = null,
      priceMax = null,
      traits = {},
      rarity = '',
      status = '',
      chainId = '',
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 24,
      collections = []
    } = params;

    const cacheKey = JSON.stringify(params);
    const cached = this.getCachedResults(cacheKey);
    if (cached) return cached;

    try {
      const searchParams = new URLSearchParams();
      
      if (query) searchParams.append('q', query);
      if (category) searchParams.append('category', category);
      if (priceMin !== null) searchParams.append('priceMin', priceMin);
      if (priceMax !== null) searchParams.append('priceMax', priceMax);
      if (rarity) searchParams.append('rarity', rarity);
      if (status) searchParams.append('status', status);
      if (chainId) searchParams.append('chainId', chainId);
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);
      if (page) searchParams.append('page', page);
      if (limit) searchParams.append('limit', limit);
      
      // Handle array parameters
      if (collections.length > 0) {
        collections.forEach(collection => searchParams.append('collections[]', collection));
      }
      
      // Handle traits object
      Object.entries(traits).forEach(([key, value]) => {
        if (value) searchParams.append(`traits[${key}]`, value);
      });

      const response = await apiService.get(`/nft/search?${searchParams.toString()}`);
      
      if (response.data.success) {
        const results = {
          ...response.data.data,
          searchParams: params,
          timestamp: Date.now()
        };
        
        this.setCachedResults(cacheKey, results);
        
        // Save search query to history if it's a text search
        if (query && query.length > 2) {
          this.addToSearchHistory(query);
        }
        
        return results;
      } else {
        throw new Error(response.data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Return mock results for development
      return this.getMockSearchResults(params);
    }
  }

  // Get search suggestions based on query
  async getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];

    const cacheKey = `suggestions_${query}`;
    const cached = this.getCachedResults(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get(`/nft/suggestions?q=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        const suggestions = response.data.data.suggestions;
        this.setCachedResults(cacheKey, suggestions);
        return suggestions;
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }

    // Return mock suggestions
    const mockSuggestions = [
      { type: 'collection', value: query, label: `"${query}" in Collections`, count: 5 },
      { type: 'nft', value: query, label: `"${query}" in NFTs`, count: 12 },
      { type: 'creator', value: query, label: `"${query}" in Creators`, count: 3 }
    ];

    this.setCachedResults(cacheKey, mockSuggestions);
    return mockSuggestions;
  }

  // Get available filter options
  async getFilterOptions() {
    const cacheKey = 'filter_options';
    const cached = this.getCachedResults(cacheKey);
    if (cached) return cached;

    try {
      const response = await apiService.get('/nft/filter-options');
      
      if (response.data.success) {
        const options = response.data.data;
        this.setCachedResults(cacheKey, options);
        return options;
      }
    } catch (error) {
      console.error('Filter options error:', error);
    }

    // Return mock filter options
    const mockOptions = {
      categories: [
        { id: 'gaming', name: 'Gaming', count: 1250 },
        { id: 'pfp', name: 'Profile Pictures', count: 890 },
        { id: 'art', name: 'Art', count: 567 },
        { id: 'collectibles', name: 'Collectibles', count: 445 },
        { id: 'music', name: 'Music', count: 234 },
        { id: 'sports', name: 'Sports', count: 178 },
        { id: 'virtual-land', name: 'Virtual Land', count: 123 }
      ],
      collections: [
        { id: 'bored-apes', name: 'Bored Ape Yacht Club', verified: true, count: 45 },
        { id: 'cryptopunks', name: 'CryptoPunks', verified: true, count: 23 },
        { id: 'azuki', name: 'Azuki', verified: true, count: 67 },
        { id: 'doodles', name: 'Doodles', verified: true, count: 34 },
        { id: 'mutant-apes', name: 'Mutant Ape Yacht Club', verified: true, count: 28 }
      ],
      chains: [
        { id: '1', name: 'Ethereum', count: 1834 },
        { id: '137', name: 'Polygon', count: 567 },
        { id: '42161', name: 'Arbitrum', count: 234 },
        { id: '10', name: 'Optimism', count: 123 },
        { id: '8453', name: 'Base', count: 89 }
      ],
      rarities: [
        { id: 'legendary', name: 'Legendary', count: 45 },
        { id: 'epic', name: 'Epic', count: 123 },
        { id: 'rare', name: 'Rare', count: 234 },
        { id: 'uncommon', name: 'Uncommon', count: 567 },
        { id: 'common', name: 'Common', count: 1890 }
      ],
      priceRanges: [
        { min: 0, max: 0.1, label: 'Under 0.1 ETH', count: 456 },
        { min: 0.1, max: 0.5, label: '0.1 - 0.5 ETH', count: 789 },
        { min: 0.5, max: 1, label: '0.5 - 1 ETH', count: 345 },
        { min: 1, max: 5, label: '1 - 5 ETH', count: 234 },
        { min: 5, max: null, label: 'Over 5 ETH', count: 123 }
      ]
    };

    this.setCachedResults(cacheKey, mockOptions);
    return mockOptions;
  }

  // Get trending searches
  getTrendingSearches() {
    return [
      { query: 'gaming nft', count: 1250 },
      { query: 'pixel art', count: 890 },
      { query: 'metaverse land', count: 567 },
      { query: 'music collectibles', count: 445 },
      { query: 'rare avatars', count: 334 }
    ];
  }

  // Search history management
  addToSearchHistory(query) {
    if (!query || query.length < 2) return;

    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(item => item.query !== query);
    
    // Add to beginning
    this.searchHistory.unshift({
      query,
      timestamp: Date.now()
    });

    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20);
    
    localStorage.setItem('lendify_search_history', JSON.stringify(this.searchHistory));
  }

  getSearchHistory() {
    return this.searchHistory.filter(item => 
      Date.now() - item.timestamp < 30 * 24 * 60 * 60 * 1000 // 30 days
    );
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('lendify_search_history');
  }

  // Saved filters management
  saveFilter(name, filters) {
    const savedFilter = {
      id: Date.now().toString(),
      name,
      filters,
      timestamp: Date.now()
    };

    this.savedFilters.push(savedFilter);
    localStorage.setItem('lendify_saved_filters', JSON.stringify(this.savedFilters));
    
    return savedFilter;
  }

  getSavedFilters() {
    return this.savedFilters;
  }

  removeSavedFilter(id) {
    this.savedFilters = this.savedFilters.filter(filter => filter.id !== id);
    localStorage.setItem('lendify_saved_filters', JSON.stringify(this.savedFilters));
  }

  // Cache management
  getCachedResults(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedResults(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Mock data for development
  getMockSearchResults(params) {
    const mockNFTs = Array.from({ length: 24 }, (_, i) => ({
      id: `nft-${i + 1}`,
      name: `Sample NFT #${i + 1}`,
      collection: ['Bored Apes', 'CryptoPunks', 'Azuki', 'Doodles'][i % 4],
      category: ['gaming', 'pfp', 'art', 'collectibles'][i % 4],
      price: (Math.random() * 5 + 0.1).toFixed(3),
      currency: 'ETH',
      duration: ['1 day', '3 days', '7 days', '30 days'][i % 4],
      rating: (4 + Math.random()).toFixed(1),
      rentalsCount: Math.floor(Math.random() * 100),
      aiScore: Math.floor(Math.random() * 40 + 60),
      rarity: ['common', 'uncommon', 'rare', 'epic', 'legendary'][i % 5],
      traits: {
        background: ['Blue', 'Red', 'Green', 'Purple'][i % 4],
        eyes: ['Normal', 'Laser', 'Sleepy', 'Wink'][i % 4],
        mouth: ['Smile', 'Frown', 'Neutral', 'Open'][i % 4]
      },
      chainId: [1, 137, 42161, 10][i % 4],
      isRented: Math.random() > 0.7,
      verified: Math.random() > 0.5,
      crossChain: ['ETH', 'MATIC', 'ARB']
    }));

    return {
      nfts: mockNFTs,
      totalCount: 1000,
      page: params.page || 1,
      totalPages: Math.ceil(1000 / (params.limit || 24)),
      facets: {
        categories: [
          { id: 'gaming', count: 250 },
          { id: 'pfp', count: 200 },
          { id: 'art', count: 150 },
          { id: 'collectibles', count: 100 }
        ],
        priceRanges: [
          { min: 0, max: 0.1, count: 300 },
          { min: 0.1, max: 1, count: 400 },
          { min: 1, max: 5, count: 200 },
          { min: 5, max: null, count: 100 }
        ]
      },
      searchTime: Math.random() * 100 + 50 // mock search time in ms
    };
  }
}

export const searchService = new SearchService();
export default searchService;