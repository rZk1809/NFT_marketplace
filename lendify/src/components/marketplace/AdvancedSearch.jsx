import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Filter, X, Star, TrendingUp, Clock, ChevronDown } from 'lucide-react'
import searchService from '../../services/searchService.js'
import './AdvancedSearch.css'

const AdvancedSearch = ({ onSearch, initialFilters = {}, className = '' }) => {
  const [query, setQuery] = useState(initialFilters.query || '')
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    priceMin: initialFilters.priceMin || '',
    priceMax: initialFilters.priceMax || '',
    rarity: initialFilters.rarity || '',
    status: initialFilters.status || 'available',
    chainId: initialFilters.chainId || '',
    collections: initialFilters.collections || [],
    traits: initialFilters.traits || {},
    sortBy: initialFilters.sortBy || 'relevance',
    sortOrder: initialFilters.sortOrder || 'desc'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterOptions, setFilterOptions] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])
  const [savedFilters, setSavedFilters] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Load filter options and user data on mount
  useEffect(() => {
    loadFilterOptions()
    setSearchHistory(searchService.getSearchHistory())
    setSavedFilters(searchService.getSavedFilters())
  }, [])

  // Debounced search suggestions
  const getSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const results = await searchService.getSearchSuggestions(searchQuery)
      setSuggestions(results)
    } catch (error) {
      console.error('Error getting suggestions:', error)
      setSuggestions([])
    }
  }, [])

  // Handle query change with debouncing
  const handleQueryChange = (value) => {
    setQuery(value)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      getSuggestions(value)
    }, 300)
  }

  // Load available filter options
  const loadFilterOptions = async () => {
    try {
      const options = await searchService.getFilterOptions()
      setFilterOptions(options)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // Handle search execution
  const executeSearch = useCallback(async () => {
    setIsLoading(true)
    setShowSuggestions(false)
    
    try {
      const searchParams = {
        query: query.trim(),
        ...filters
      }
      
      const results = await searchService.searchNFTs(searchParams)
      onSearch(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [query, filters, onSearch])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    executeSearch()
  }

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Handle collection filter toggle
  const toggleCollection = (collectionId) => {
    setFilters(prev => ({
      ...prev,
      collections: prev.collections.includes(collectionId)
        ? prev.collections.filter(id => id !== collectionId)
        : [...prev.collections, collectionId]
    }))
  }

  // Handle trait filter changes
  const handleTraitChange = (traitType, value) => {
    setFilters(prev => ({
      ...prev,
      traits: {
        ...prev.traits,
        [traitType]: value
      }
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      priceMin: '',
      priceMax: '',
      rarity: '',
      status: 'available',
      chainId: '',
      collections: [],
      traits: {},
      sortBy: 'relevance',
      sortOrder: 'desc'
    })
  }

  // Save current filter set
  const saveCurrentFilters = () => {
    const name = prompt('Enter a name for this filter set:')
    if (name && name.trim()) {
      const savedFilter = searchService.saveFilter(name.trim(), { query, ...filters })
      setSavedFilters(prev => [...prev, savedFilter])
    }
  }

  // Load saved filter set
  const loadSavedFilter = (savedFilter) => {
    setQuery(savedFilter.filters.query || '')
    setFilters(savedFilter.filters)
    setShowFilters(false)
  }

  // Handle suggestion selection
  const selectSuggestion = (suggestion) => {
    setQuery(suggestion.value)
    setShowSuggestions(false)
    // Auto-execute search for suggestions
    setTimeout(() => executeSearch(), 100)
  }

  // Handle search history selection
  const selectFromHistory = (historyItem) => {
    setQuery(historyItem.query)
    setShowSuggestions(false)
  }

  // Active filter count
  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length
    if (typeof value === 'object') return count + Object.keys(value).length
    if (value && value !== 'available' && value !== 'relevance' && value !== 'desc') return count + 1
    return count
  }, 0)

  return (
    <div className={`advanced-search ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search NFTs, collections, creators..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="search-input"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setSuggestions([])
                }}
                className="clear-search-btn"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle-btn ${activeFilterCount > 0 ? 'has-filters' : ''}`}
          >
            <Filter size={20} />
            {activeFilterCount > 0 && (
              <span className="filter-count">{activeFilterCount}</span>
            )}
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="search-submit-btn"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (query.length > 0 || searchHistory.length > 0) && (
          <div ref={suggestionsRef} className="search-suggestions">
            {query.length > 1 && suggestions.length > 0 && (
              <div className="suggestions-section">
                <div className="suggestions-header">
                  <Search size={16} />
                  <span>Suggestions</span>
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="suggestion-item"
                  >
                    <span className="suggestion-label">{suggestion.label}</span>
                    <span className="suggestion-count">({suggestion.count})</span>
                  </button>
                ))}
              </div>
            )}
            
            {query.length === 0 && searchHistory.length > 0 && (
              <div className="suggestions-section">
                <div className="suggestions-header">
                  <Clock size={16} />
                  <span>Recent Searches</span>
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectFromHistory(item)}
                    className="suggestion-item history-item"
                  >
                    <span>{item.query}</span>
                  </button>
                ))}
              </div>
            )}
            
            {query.length === 0 && (
              <div className="suggestions-section">
                <div className="suggestions-header">
                  <TrendingUp size={16} />
                  <span>Trending</span>
                </div>
                {searchService.getTrendingSearches().slice(0, 5).map((trend, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setQuery(trend.query)
                      setShowSuggestions(false)
                    }}
                    className="suggestion-item trending-item"
                  >
                    <span>{trend.query}</span>
                    <span className="trend-count">{trend.count} searches</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Advanced Filters Panel */}
      {showFilters && filterOptions && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Advanced Filters</h3>
            <div className="filters-actions">
              <button
                type="button"
                onClick={saveCurrentFilters}
                className="save-filters-btn"
              >
                Save Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="close-filters-btn"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="filters-content">
            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="filter-group">
                <label className="filter-label">Saved Filter Sets</label>
                <div className="saved-filters">
                  {savedFilters.map(savedFilter => (
                    <button
                      key={savedFilter.id}
                      type="button"
                      onClick={() => loadSavedFilter(savedFilter)}
                      className="saved-filter-item"
                    >
                      <span>{savedFilter.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          searchService.removeSavedFilter(savedFilter.id)
                          setSavedFilters(prev => prev.filter(f => f.id !== savedFilter.id))
                        }}
                        className="remove-filter-btn"
                      >
                        <X size={14} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="filters-grid">
              {/* Category Filter */}
              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label className="filter-label">Price Range (ETH)</label>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="price-input"
                    min="0"
                    step="0.001"
                  />
                  <span className="price-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="price-input"
                    min="0"
                    step="0.001"
                  />
                </div>
                <div className="price-presets">
                  {filterOptions.priceRanges.map(range => (
                    <button
                      key={`${range.min}-${range.max}`}
                      type="button"
                      onClick={() => {
                        handleFilterChange('priceMin', range.min)
                        handleFilterChange('priceMax', range.max || '')
                      }}
                      className="price-preset-btn"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rarity Filter */}
              <div className="filter-group">
                <label className="filter-label">Rarity</label>
                <select
                  value={filters.rarity}
                  onChange={(e) => handleFilterChange('rarity', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Rarities</option>
                  {filterOptions.rarities.map(rarity => (
                    <option key={rarity.id} value={rarity.id}>
                      {rarity.name} ({rarity.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Blockchain Filter */}
              <div className="filter-group">
                <label className="filter-label">Blockchain</label>
                <select
                  value={filters.chainId}
                  onChange={(e) => handleFilterChange('chainId', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Chains</option>
                  {filterOptions.chains.map(chain => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name} ({chain.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-group">
                <label className="filter-label">Availability</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="available">Available for Rent</option>
                  <option value="rented">Currently Rented</option>
                  <option value="all">All NFTs</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="filter-group">
                <label className="filter-label">Sort By</label>
                <div className="sort-controls">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="filter-select"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                    <option value="rating">Rating</option>
                    <option value="rentals">Most Rented</option>
                    <option value="ai-score">AI Score</option>
                    <option value="created">Newest</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
                    className={`sort-order-btn ${filters.sortOrder}`}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Collections Filter */}
            {filterOptions.collections.length > 0 && (
              <div className="filter-group collections-filter">
                <label className="filter-label">Collections</label>
                <div className="collections-grid">
                  {filterOptions.collections.map(collection => (
                    <label
                      key={collection.id}
                      className={`collection-checkbox ${filters.collections.includes(collection.id) ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.collections.includes(collection.id)}
                        onChange={() => toggleCollection(collection.id)}
                      />
                      <div className="collection-info">
                        <span className="collection-name">
                          {collection.name}
                          {collection.verified && <Star size={14} className="verified-icon" />}
                        </span>
                        <span className="collection-count">({collection.count})</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedSearch