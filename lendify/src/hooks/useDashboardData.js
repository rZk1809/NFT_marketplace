import { useState, useEffect, useCallback } from 'react'
import apiService from '../services/api'

export const useDashboardData = (walletAddress) => {
  // Loading states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Data states
  const [platformStats, setPlatformStats] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [availableNFTs, setAvailableNFTs] = useState([])
  const [trendingNFTs, setTrendingNFTs] = useState([])
  const [availableRentals, setAvailableRentals] = useState([])
  const [loanRequests, setLoanRequests] = useState([])
  
  // Individual loading states for better UX
  const [statsLoading, setStatsLoading] = useState(true)
  const [nftLoading, setNftLoading] = useState(true)
  const [rentalLoading, setRentalLoading] = useState(true)
  const [loanLoading, setLoanLoading] = useState(true)

  // Fetch platform statistics
  const fetchPlatformStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const response = await apiService.getPlatformStats()
      setPlatformStats(response.data)
      setStatsLoading(false)
    } catch (err) {
      console.error('Failed to fetch platform stats:', err)
      setStatsLoading(false)
    }
  }, [])

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!walletAddress) return
    
    try {
      const response = await apiService.getUserProfile(walletAddress)
      setUserProfile(response.data.user)
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    }
  }, [walletAddress])

  // Fetch NFTs data
  const fetchNFTsData = useCallback(async () => {
    try {
      setNftLoading(true)
      const [availableResponse, trendingResponse] = await Promise.all([
        apiService.getAvailableNFTs({ limit: 12 }),
        apiService.getTrendingNFTs({ limit: 6 })
      ])
      
      setAvailableNFTs(availableResponse.data.nfts || [])
      setTrendingNFTs(trendingResponse.data || [])
      setNftLoading(false)
    } catch (err) {
      console.error('Failed to fetch NFTs data:', err)
      setNftLoading(false)
    }
  }, [])

  // Fetch rentals data
  const fetchRentalsData = useCallback(async () => {
    try {
      setRentalLoading(true)
      const response = await apiService.getAvailableRentals({ limit: 8 })
      setAvailableRentals(response.data.rentals || [])
      setRentalLoading(false)
    } catch (err) {
      console.error('Failed to fetch rentals data:', err)
      setRentalLoading(false)
    }
  }, [])

  // Fetch loans data
  const fetchLoansData = useCallback(async () => {
    try {
      setLoanLoading(true)
      const response = await apiService.getLoanRequests({ limit: 6 })
      setLoanRequests(response.data.loanRequests || [])
      setLoanLoading(false)
    } catch (err) {
      console.error('Failed to fetch loans data:', err)
      setLoanLoading(false)
    }
  }, [])

  // Search NFTs
  const searchNFTs = useCallback(async (query, options = {}) => {
    if (!query.trim()) {
      await fetchNFTsData()
      return
    }

    try {
      setNftLoading(true)
      const response = await apiService.searchNFTs(query, options)
      setAvailableNFTs(response.data.nfts || [])
      setNftLoading(false)
    } catch (err) {
      console.error('Failed to search NFTs:', err)
      setNftLoading(false)
    }
  }, [fetchNFTsData])

  // Refresh all data
  const refreshAllData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        fetchPlatformStats(),
        fetchUserProfile(),
        fetchNFTsData(),
        fetchRentalsData(),
        fetchLoansData()
      ])
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
      setLoading(false)
    }
  }, [fetchPlatformStats, fetchUserProfile, fetchNFTsData, fetchRentalsData, fetchLoansData])

  // Initial data loading
  useEffect(() => {
    refreshAllData()
  }, [refreshAllData])

  // Transform platform stats for UI
  const transformedStats = platformStats ? {
    totalUsers: platformStats.users || 0,
    totalNFTs: platformStats.nfts || 0,
    totalRentals: platformStats.totalRentals || 0,
    totalLoans: platformStats.totalLoans || 0,
    availableRentals: platformStats.availableRentals || 0,
    activeLoanRequests: platformStats.activeLendingRequests || 0,
    totalVolume: (platformStats.totalRentals || 0) + (platformStats.totalLoans || 0)
  } : null

  // Transform user stats for UI
  const transformedUserStats = userProfile ? {
    totalRentals: userProfile.reputation?.totalRentals || 0,
    reputation: userProfile.reputation?.averageRating || 0,
    earnings: userProfile.reputation?.totalEarnings || 0,
    activeLoans: 0, // Would need additional API call
    nftOwned: userProfile.reputation?.totalListings || 0,
    crossChainAssets: 0, // Would need additional data
    daoVotingPower: 0, // Would need additional data
    aiScore: Math.round((userProfile.reputation?.averageRating || 0) * 20) // Convert to 100 scale
  } : {
    totalRentals: 0,
    reputation: 0,
    earnings: 0,
    activeLoans: 0,
    nftOwned: 0,
    crossChainAssets: 0,
    daoVotingPower: 0,
    aiScore: 0
  }

  // Transform NFT data for UI compatibility
  const transformNFT = (nft) => ({
    id: nft._id,
    name: nft.metadata?.name || 'Unknown NFT',
    collection: nft.collection?.name || 'Unknown Collection',
    image: nft.metadata?.image || '',
    category: nft.metadata?.category || 'other',
    price: '0.1', // Would need rental data
    duration: '7 days', // Would need rental data
    owner: nft.owner,
    isRented: false, // Would need rental status
    rentalsCount: nft.rental?.totalRentals || 0,
    rating: nft.rental?.ratings?.average || 0,
    utility: ['Gaming', 'Display'], // Would need from metadata
    gameCompatible: ['Ethereum DApps'], // Would need from metadata
    aiScore: Math.round(nft.analytics?.trendingScore || 50),
    crossChain: ['Ethereum'], // Would need from chainId
    contractAddress: nft.contractAddress,
    tokenId: nft.tokenId,
    chainId: nft.chainId,
    floorPrice: nft.collection?.floorPrice || 0
  })

  return {
    // Data
    platformStats: transformedStats,
    userStats: transformedUserStats,
    userProfile,
    availableNFTs: availableNFTs.map(transformNFT),
    trendingNFTs: trendingNFTs.map(transformNFT),
    availableRentals,
    loanRequests,

    // Loading states
    loading,
    statsLoading,
    nftLoading,
    rentalLoading,
    loanLoading,

    // Error state
    error,

    // Actions
    refreshAllData,
    searchNFTs,
    fetchPlatformStats,
    fetchNFTsData,
    fetchRentalsData,
    fetchLoansData
  }
}