import { useState } from 'react'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Generic HTTP request helper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Platform Statistics
  async getPlatformStats() {
    return this.request('/stats')
  }

  // Authentication APIs
  async generateNonce(walletAddress) {
    return this.request('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  }

  async getUserProfile(walletAddress) {
    return this.request(`/auth/user/${walletAddress}`)
  }

  // NFT APIs
  async getAvailableNFTs(options = {}) {
    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page)
    if (options.limit) params.append('limit', options.limit)
    if (options.chainId) params.append('chainId', options.chainId)
    if (options.category) params.append('category', options.category)
    
    const query = params.toString()
    return this.request(`/nft/available${query ? `?${query}` : ''}`)
  }

  async getTrendingNFTs(options = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit)
    
    const query = params.toString()
    return this.request(`/nft/trending${query ? `?${query}` : ''}`)
  }

  async searchNFTs(searchQuery, options = {}) {
    const params = new URLSearchParams()
    params.append('q', searchQuery)
    if (options.page) params.append('page', options.page)
    if (options.limit) params.append('limit', options.limit)
    
    return this.request(`/nft/search?${params.toString()}`)
  }

  async getNFTById(nftId) {
    return this.request(`/nft/${nftId}`)
  }

  // Rental APIs
  async getAvailableRentals(options = {}) {
    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page)
    if (options.limit) params.append('limit', options.limit)
    if (options.useCase) params.append('useCase', options.useCase)
    if (options.minPrice) params.append('minPrice', options.minPrice)
    if (options.maxPrice) params.append('maxPrice', options.maxPrice)
    
    const query = params.toString()
    return this.request(`/rental/available${query ? `?${query}` : ''}`)
  }

  async getRentalById(rentalId) {
    return this.request(`/rental/${rentalId}`)
  }

  // Lending APIs
  async getLoanRequests(options = {}) {
    const params = new URLSearchParams()
    if (options.page) params.append('page', options.page)
    if (options.limit) params.append('limit', options.limit)
    if (options.currency) params.append('currency', options.currency)
    if (options.maxLTV) params.append('maxLTV', options.maxLTV)
    
    const query = params.toString()
    return this.request(`/lending/requests${query ? `?${query}` : ''}`)
  }

  async getLoanById(loanId) {
    return this.request(`/lending/${loanId}`)
  }

  // Health Check APIs
  async checkHealth() {
    return this.request('/health', { baseURL: 'http://localhost:3002' })
  }

  async checkServiceHealth(service) {
    return this.request(`/${service}/health`)
  }

  async checkDatabaseHealth() {
    return this.request('/db/test')
  }
}

// Create singleton instance
const apiService = new ApiService()

// Export both the class and instance for flexibility
export default apiService
export { ApiService }

// Utility functions for handling API responses
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  return error.message || 'An unexpected error occurred'
}

export const formatApiResponse = (response) => {
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || 'Invalid API response format')
}

// Hook-like functions for React components
export const useApiCall = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const makeCall = async (apiFunction, ...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }
  
  return { makeCall, loading, error }
}