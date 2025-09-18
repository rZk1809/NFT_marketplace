import { ethers, JsonRpcProvider, Wallet, Contract, InterfaceAbi } from 'ethers';
import { config } from '../config/config';

// Import contract ABIs
import NFTRentalMarketplaceABI from '../contracts/abis/NFTRentalMarketplace.json';
import ReputationSystemABI from '../contracts/abis/ReputationSystem.json';
import NFTCollateralizedLendingABI from '../contracts/abis/NFTCollateralizedLending.json';
import FlashRentalLoanABI from '../contracts/abis/FlashRentalLoan.json';
import DynamicPricingOracleABI from '../contracts/abis/DynamicPricingOracle.json';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  currency: string;
  blockExplorerUrl: string;
  contracts: {
    nftRentalMarketplace?: string;
    reputationSystem?: string;
    nftCollateralizedLending?: string;
    flashRentalLoan?: string;
    dynamicPricingOracle?: string;
  };
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: ethers.TransactionReceipt;
  error?: string;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
}

export interface NFTInfo {
  tokenId: string;
  owner: string;
  approved: string;
  tokenURI: string;
}

export interface RentalInfo {
  listingId: number;
  nftContract: string;
  tokenId: number;
  owner: string;
  user: string;
  pricePerDay: bigint;
  collateral: bigint;
  duration: number;
  expires: number;
  isActive: boolean;
  category: string;
}

export class Web3Service {
  private providers: Map<number, JsonRpcProvider> = new Map();
  private signers: Map<number, Wallet> = new Map();
  private contracts: Map<string, Contract> = new Map();
  private chainConfigs: Map<number, ChainConfig> = new Map();

  constructor() {
    this.initializeChainConfigs();
  }

  private initializeChainConfigs(): void {
    // Ethereum Mainnet
    this.chainConfigs.set(1, {
      chainId: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: config.blockchain.ethereum.rpcUrl,
      currency: 'ETH',
      blockExplorerUrl: 'https://etherscan.io',
      contracts: {
        nftRentalMarketplace: config.contracts.ethereum.nftRentalMarketplace,
        reputationSystem: config.contracts.ethereum.reputationSystem,
        nftCollateralizedLending: config.contracts.ethereum.nftCollateralizedLending,
        flashRentalLoan: config.contracts.ethereum.flashRentalLoan,
        dynamicPricingOracle: config.contracts.ethereum.dynamicPricingOracle,
      }
    });

    // Polygon Mainnet
    this.chainConfigs.set(137, {
      chainId: 137,
      name: 'Polygon Mainnet',
      rpcUrl: config.blockchain.polygon.rpcUrl,
      currency: 'MATIC',
      blockExplorerUrl: 'https://polygonscan.com',
      contracts: {
        nftRentalMarketplace: config.contracts.polygon.nftRentalMarketplace,
        reputationSystem: config.contracts.polygon.reputationSystem,
        nftCollateralizedLending: config.contracts.polygon.nftCollateralizedLending,
        flashRentalLoan: config.contracts.polygon.flashRentalLoan,
        dynamicPricingOracle: config.contracts.polygon.dynamicPricingOracle,
      }
    });

    // Arbitrum One
    this.chainConfigs.set(42161, {
      chainId: 42161,
      name: 'Arbitrum One',
      rpcUrl: config.blockchain.arbitrum.rpcUrl,
      currency: 'ETH',
      blockExplorerUrl: 'https://arbiscan.io',
      contracts: {
        nftRentalMarketplace: config.contracts.arbitrum.nftRentalMarketplace,
        reputationSystem: config.contracts.arbitrum.reputationSystem,
        nftCollateralizedLending: config.contracts.arbitrum.nftCollateralizedLending,
        flashRentalLoan: config.contracts.arbitrum.flashRentalLoan,
        dynamicPricingOracle: config.contracts.arbitrum.dynamicPricingOracle,
      }
    });

    // Optimism
    this.chainConfigs.set(10, {
      chainId: 10,
      name: 'Optimism',
      rpcUrl: config.blockchain.optimism.rpcUrl,
      currency: 'ETH',
      blockExplorerUrl: 'https://optimistic.etherscan.io',
      contracts: {
        nftRentalMarketplace: config.contracts.optimism.nftRentalMarketplace,
        reputationSystem: config.contracts.optimism.reputationSystem,
        nftCollateralizedLending: config.contracts.optimism.nftCollateralizedLending,
        flashRentalLoan: config.contracts.optimism.flashRentalLoan,
        dynamicPricingOracle: config.contracts.optimism.dynamicPricingOracle,
      }
    });

    // Base (Coinbase L2)
    this.chainConfigs.set(8453, {
      chainId: 8453,
      name: 'Base',
      rpcUrl: config.blockchain.base.rpcUrl,
      currency: 'ETH',
      blockExplorerUrl: 'https://basescan.org',
      contracts: {
        nftRentalMarketplace: config.contracts.base.nftRentalMarketplace,
        reputationSystem: config.contracts.base.reputationSystem,
        nftCollateralizedLending: config.contracts.base.nftCollateralizedLending,
        flashRentalLoan: config.contracts.base.flashRentalLoan,
        dynamicPricingOracle: config.contracts.base.dynamicPricingOracle,
      }
    });
  }

  public async initialize(): Promise<void> {
    try {
      // Initialize providers and signers for each supported chain
      for (const [chainId, chainConfig] of this.chainConfigs.entries()) {
        // Create provider
        const provider = new JsonRpcProvider(chainConfig.rpcUrl, chainId);
        this.providers.set(chainId, provider);

        // Create signer with private key
        const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
        if (privateKey) {
          const signer = new Wallet(privateKey, provider);
          this.signers.set(chainId, signer);
        }

        // Initialize contracts for this chain
        await this.initializeContractsForChain(chainId);
      }

      console.log('✅ Web3Service initialized for all supported chains');
    } catch (error) {
      console.error('❌ Failed to initialize Web3Service:', error);
      throw error;
    }
  }

  private async initializeContractsForChain(chainId: number): Promise<void> {
    const chainConfig = this.chainConfigs.get(chainId);
    const provider = this.providers.get(chainId);
    const signer = this.signers.get(chainId);

    if (!chainConfig || !provider) {
      throw new Error(`Chain ${chainId} not configured`);
    }

    try {
      // NFT Rental Marketplace
      if (chainConfig.contracts.nftRentalMarketplace) {
        const marketplaceContract = new Contract(
          chainConfig.contracts.nftRentalMarketplace,
          NFTRentalMarketplaceABI,
          signer || provider
        );
        this.contracts.set(`marketplace_${chainId}`, marketplaceContract);
      }

      // Reputation System
      if (chainConfig.contracts.reputationSystem) {
        const reputationContract = new Contract(
          chainConfig.contracts.reputationSystem,
          ReputationSystemABI,
          signer || provider
        );
        this.contracts.set(`reputation_${chainId}`, reputationContract);
      }

      // NFT Collateralized Lending
      if (chainConfig.contracts.nftCollateralizedLending) {
        const lendingContract = new Contract(
          chainConfig.contracts.nftCollateralizedLending,
          NFTCollateralizedLendingABI,
          signer || provider
        );
        this.contracts.set(`lending_${chainId}`, lendingContract);
      }

      // Flash Rental Loan
      if (chainConfig.contracts.flashRentalLoan) {
        const flashLoanContract = new Contract(
          chainConfig.contracts.flashRentalLoan,
          FlashRentalLoanABI,
          signer || provider
        );
        this.contracts.set(`flashloan_${chainId}`, flashLoanContract);
      }

      // Dynamic Pricing Oracle
      if (chainConfig.contracts.dynamicPricingOracle) {
        const oracleContract = new Contract(
          chainConfig.contracts.dynamicPricingOracle,
          DynamicPricingOracleABI,
          signer || provider
        );
        this.contracts.set(`oracle_${chainId}`, oracleContract);
      }

      console.log(`✅ Contracts initialized for chain ${chainId} (${chainConfig.name})`);
    } catch (error) {
      console.error(`❌ Failed to initialize contracts for chain ${chainId}:`, error);
      throw error;
    }
  }

  // Provider and signer getters
  public getProvider(chainId: number): JsonRpcProvider | undefined {
    return this.providers.get(chainId);
  }

  public getSigner(chainId: number): Wallet | undefined {
    return this.signers.get(chainId);
  }

  public getContract(contractType: string, chainId: number): Contract | undefined {
    return this.contracts.get(`${contractType}_${chainId}`);
  }

  public getSupportedChains(): ChainConfig[] {
    return Array.from(this.chainConfigs.values());
  }

  public getChainConfig(chainId: number): ChainConfig | undefined {
    return this.chainConfigs.get(chainId);
  }

  // NFT Information
  public async getNFTInfo(nftContract: string, tokenId: string, chainId: number): Promise<NFTInfo> {
    const provider = this.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    const contract = new Contract(nftContract, [
      "function ownerOf(uint256 tokenId) view returns (address)",
      "function getApproved(uint256 tokenId) view returns (address)",
      "function tokenURI(uint256 tokenId) view returns (string)",
    ], provider);

    try {
      const [owner, approved, tokenURI] = await Promise.all([
        contract.ownerOf(tokenId),
        contract.getApproved(tokenId),
        contract.tokenURI(tokenId)
      ]);

      return {
        tokenId,
        owner,
        approved,
        tokenURI
      };
    } catch (error) {
      console.error(`Error getting NFT info for ${nftContract}:${tokenId}:`, error);
      throw error;
    }
  }

  // Rental Operations
  public async listNFTForRent(
    nftContract: string,
    tokenId: number,
    pricePerDay: string,
    collateral: string,
    duration: number,
    category: string,
    chainId: number
  ): Promise<TransactionResult> {
    const contract = this.getContract('marketplace', chainId);
    const signer = this.getSigner(chainId);

    if (!contract || !signer) {
      throw new Error(`Contract or signer not found for chain ${chainId}`);
    }

    try {
      const tx = await contract.listNFTForRent(
        nftContract,
        tokenId,
        ethers.parseEther(pricePerDay),
        ethers.parseEther(collateral),
        duration,
        category
      );

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  public async rentNFT(
    listingId: number,
    chainId: number,
    paymentAmount: string
  ): Promise<TransactionResult> {
    const contract = this.getContract('marketplace', chainId);
    const signer = this.getSigner(chainId);

    if (!contract || !signer) {
      throw new Error(`Contract or signer not found for chain ${chainId}`);
    }

    try {
      const tx = await contract.rentNFT(listingId, {
        value: ethers.parseEther(paymentAmount)
      });

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  public async getRentalInfo(listingId: number, chainId: number): Promise<RentalInfo | null> {
    const contract = this.getContract('marketplace', chainId);

    if (!contract) {
      throw new Error(`Marketplace contract not found for chain ${chainId}`);
    }

    try {
      const rental = await contract.getRental(listingId);
      
      return {
        listingId,
        nftContract: rental.nftContract,
        tokenId: Number(rental.tokenId),
        owner: rental.owner,
        user: rental.user,
        pricePerDay: rental.pricePerDay,
        collateral: rental.collateral,
        duration: Number(rental.duration),
        expires: Number(rental.expires),
        isActive: rental.isActive,
        category: rental.category
      };
    } catch (error) {
      console.error(`Error getting rental info for listing ${listingId}:`, error);
      return null;
    }
  }

  // Lending Operations
  public async requestLoan(
    nftContract: string,
    tokenId: number,
    loanAmount: string,
    duration: number,
    chainId: number
  ): Promise<TransactionResult> {
    const contract = this.getContract('lending', chainId);
    const signer = this.getSigner(chainId);

    if (!contract || !signer) {
      throw new Error(`Lending contract or signer not found for chain ${chainId}`);
    }

    try {
      const tx = await contract.requestLoan(
        nftContract,
        tokenId,
        ethers.parseEther(loanAmount),
        duration
      );

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  public async fundLoan(
    loanId: number,
    chainId: number,
    fundAmount: string
  ): Promise<TransactionResult> {
    const contract = this.getContract('lending', chainId);
    const signer = this.getSigner(chainId);

    if (!contract || !signer) {
      throw new Error(`Lending contract or signer not found for chain ${chainId}`);
    }

    try {
      const tx = await contract.fundLoan(loanId, {
        value: ethers.parseEther(fundAmount)
      });

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  // Flash Loan Operations
  public async executeFlashRental(
    nftContract: string,
    tokenId: number,
    rentalDuration: number,
    data: string,
    chainId: number
  ): Promise<TransactionResult> {
    const contract = this.getContract('flashloan', chainId);
    const signer = this.getSigner(chainId);

    if (!contract || !signer) {
      throw new Error(`Flash loan contract or signer not found for chain ${chainId}`);
    }

    try {
      const tx = await contract.executeFlashRental(
        nftContract,
        tokenId,
        rentalDuration,
        data
      );

      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: receipt.effectiveGasPrice
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  // Reputation Operations
  public async getUserReputation(userAddress: string, chainId: number): Promise<any> {
    const contract = this.getContract('reputation', chainId);

    if (!contract) {
      throw new Error(`Reputation contract not found for chain ${chainId}`);
    }

    try {
      const tokenId = await contract.userToTokenId(userAddress);
      if (tokenId === 0n) {
        return null; // User doesn't have a reputation NFT yet
      }

      const reputation = await contract.getReputation(tokenId);
      const level = await contract.getReputationLevel(tokenId);

      return {
        tokenId: tokenId.toString(),
        totalRentals: reputation.totalRentals.toString(),
        successfulRentals: reputation.successfulRentals.toString(),
        totalEarnings: ethers.formatEther(reputation.totalEarnings),
        disputes: reputation.disputes.toString(),
        averageRating: Number(reputation.averageRating) / 100, // Convert from basis points
        level
      };
    } catch (error) {
      console.error(`Error getting user reputation for ${userAddress}:`, error);
      throw error;
    }
  }

  // Oracle Operations
  public async getDynamicPrice(
    nftContract: string,
    tokenId: number,
    chainId: number
  ): Promise<string | null> {
    const contract = this.getContract('oracle', chainId);

    if (!contract) {
      throw new Error(`Oracle contract not found for chain ${chainId}`);
    }

    try {
      const priceData = await contract.getPriceData(nftContract, tokenId);
      return ethers.formatEther(priceData.currentPrice);
    } catch (error) {
      console.error(`Error getting dynamic price for ${nftContract}:${tokenId}:`, error);
      return null;
    }
  }

  // Transaction utilities
  public async estimateGas(
    contract: Contract,
    methodName: string,
    params: any[]
  ): Promise<bigint> {
    try {
      return await contract[methodName].estimateGas(...params);
    } catch (error) {
      console.error(`Gas estimation failed for ${methodName}:`, error);
      throw error;
    }
  }

  public async waitForTransaction(
    txHash: string,
    chainId: number,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt | null> {
    const provider = this.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    try {
      return await provider.waitForTransaction(txHash, confirmations);
    } catch (error) {
      console.error(`Failed to wait for transaction ${txHash}:`, error);
      throw error;
    }
  }

  // Event filtering and monitoring
  public async getContractEvents(
    contractType: string,
    chainId: number,
    eventName: string,
    fromBlock: number = -10000,
    toBlock: number = 'latest' as any
  ): Promise<any[]> {
    const contract = this.getContract(contractType, chainId);

    if (!contract) {
      throw new Error(`${contractType} contract not found for chain ${chainId}`);
    }

    try {
      const filter = contract.filters[eventName]();
      return await contract.queryFilter(filter, fromBlock, toBlock);
    } catch (error) {
      console.error(`Error getting events for ${contractType}.${eventName}:`, error);
      throw error;
    }
  }

  // Block and network information
  public async getBlockNumber(chainId: number): Promise<number> {
    const provider = this.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    return await provider.getBlockNumber();
  }

  public async getBalance(address: string, chainId: number): Promise<string> {
    const provider = this.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  public async getGasPrice(chainId: number): Promise<string> {
    const provider = this.getProvider(chainId);
    if (!provider) {
      throw new Error(`Provider not found for chain ${chainId}`);
    }

    const gasPrice = await provider.getFeeData();
    return ethers.formatUnits(gasPrice.gasPrice || 0n, 'gwei');
  }

  // Health check
  public async healthCheck(): Promise<{ [chainId: number]: boolean }> {
    const results: { [chainId: number]: boolean } = {};

    for (const chainId of this.providers.keys()) {
      try {
        const provider = this.getProvider(chainId);
        if (provider) {
          await provider.getBlockNumber();
          results[chainId] = true;
        } else {
          results[chainId] = false;
        }
      } catch (error) {
        results[chainId] = false;
      }
    }

    return results;
  }
}