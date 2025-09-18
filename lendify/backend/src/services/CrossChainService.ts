import { EventEmitter } from 'events';
import axios from 'axios';

export interface ChainInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  logoUrl: string;
  isTestnet: boolean;
  bridges: string[];
  supportedTokens: string[];
}

export interface BridgeTransaction {
  id: string;
  fromChain: number;
  toChain: number;
  fromAddress: string;
  toAddress: string;
  tokenContract: string;
  tokenId: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'bridging' | 'completed' | 'failed';
  txHash?: string;
  bridgeTxHash?: string;
  createdAt: Date;
  completedAt?: Date;
  estimatedTime: number; // minutes
  fees: {
    gas: string;
    bridge: string;
    total: string;
  };
}

export interface CrossChainNFT {
  originalChain: number;
  currentChain: number;
  originalContract: string;
  wrappedContract?: string;
  tokenId: string;
  isBridged: boolean;
  bridgeHistory: BridgeTransaction[];
  metadata: any;
}

export interface BridgeConfig {
  name: string;
  contracts: { [chainId: number]: string };
  supportedChains: number[];
  fees: { [chainId: number]: string };
  estimatedTimes: { [route: string]: number }; // route format: "1-137"
}

export class CrossChainService extends EventEmitter {
  private supportedChains: Map<number, ChainInfo> = new Map();
  private bridgeConfigs: Map<string, BridgeConfig> = new Map();
  private bridgeTransactions: Map<string, BridgeTransaction> = new Map();
  private chainStatus: Map<number, boolean> = new Map();

  constructor() {
    super();
    this.initializeSupportedChains();
    this.initializeBridgeConfigs();
  }

  public async initialize(): Promise<void> {
    try {
      // Check chain connectivity
      await this.checkChainConnectivity();
      
      // Initialize bridge services
      await this.initializeBridgeServices();
      
      // Start monitoring services
      this.startMonitoring();
      
      console.log('✅ Cross-chain service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize cross-chain service:', error);
      throw error;
    }
  }

  private initializeSupportedChains(): void {
    // Ethereum Mainnet
    this.supportedChains.set(1, {
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/',
      blockExplorerUrl: 'https://etherscan.io',
      logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      isTestnet: false,
      bridges: ['polygon', 'arbitrum', 'optimism', 'base'],
      supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI']
    });

    // Polygon
    this.supportedChains.set(137, {
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      blockExplorerUrl: 'https://polygonscan.com',
      logoUrl: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
      isTestnet: false,
      bridges: ['ethereum', 'arbitrum', 'optimism', 'base'],
      supportedTokens: ['MATIC', 'WETH', 'USDC', 'USDT', 'DAI']
    });

    // Arbitrum One
    this.supportedChains.set(42161, {
      chainId: 42161,
      name: 'Arbitrum One',
      symbol: 'ETH',
      rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      blockExplorerUrl: 'https://arbiscan.io',
      logoUrl: 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
      isTestnet: false,
      bridges: ['ethereum', 'polygon', 'optimism', 'base'],
      supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI']
    });

    // Optimism
    this.supportedChains.set(10, {
      chainId: 10,
      name: 'Optimism',
      symbol: 'ETH',
      rpcUrl: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      blockExplorerUrl: 'https://optimistic.etherscan.io',
      logoUrl: 'https://cryptologos.cc/logos/optimism-op-logo.png',
      isTestnet: false,
      bridges: ['ethereum', 'polygon', 'arbitrum', 'base'],
      supportedTokens: ['ETH', 'USDC', 'USDT', 'DAI', 'OP']
    });

    // Base
    this.supportedChains.set(8453, {
      chainId: 8453,
      name: 'Base',
      symbol: 'ETH',
      rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
      blockExplorerUrl: 'https://basescan.org',
      logoUrl: 'https://cryptologos.cc/logos/base-base-logo.png',
      isTestnet: false,
      bridges: ['ethereum', 'polygon', 'arbitrum', 'optimism'],
      supportedTokens: ['ETH', 'USDC', 'DAI']
    });

    console.log(`✅ Initialized ${this.supportedChains.size} supported chains`);
  }

  private initializeBridgeConfigs(): void {
    // LayerZero configuration
    this.bridgeConfigs.set('layerzero', {
      name: 'LayerZero',
      contracts: {
        1: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675', // Ethereum
        137: '0x3c2269811836af69497E5F486A85D7316753cf62', // Polygon
        42161: '0x3c2269811836af69497E5F486A85D7316753cf62', // Arbitrum
        10: '0x3c2269811836af69497E5F486A85D7316753cf62', // Optimism
        8453: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7' // Base
      },
      supportedChains: [1, 137, 42161, 10, 8453],
      fees: {
        1: '0.01', // ETH
        137: '10', // MATIC
        42161: '0.005', // ETH
        10: '0.005', // ETH
        8453: '0.005' // ETH
      },
      estimatedTimes: {
        '1-137': 10, // 10 minutes
        '137-1': 15,
        '1-42161': 7,
        '42161-1': 10,
        '1-10': 7,
        '10-1': 10,
        '137-42161': 20,
        '42161-137': 20
      }
    });

    // Axelar configuration
    this.bridgeConfigs.set('axelar', {
      name: 'Axelar',
      contracts: {
        1: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
        137: '0x6f015F16De9fC8791b234eF68D486d2bF203FBA8',
        42161: '0xe432150cce91c13a887f7D836923d5597adD8E31',
        10: '0xe432150cce91c13a887f7D836923d5597adD8E31',
        8453: '0xe432150cce91c13a887f7D836923d5597adD8E31'
      },
      supportedChains: [1, 137, 42161, 10, 8453],
      fees: {
        1: '0.015',
        137: '15',
        42161: '0.008',
        10: '0.008',
        8453: '0.008'
      },
      estimatedTimes: {
        '1-137': 5,
        '137-1': 8,
        '1-42161': 3,
        '42161-1': 5,
        '1-10': 3,
        '10-1': 5
      }
    });

    // Hyperlane configuration
    this.bridgeConfigs.set('hyperlane', {
      name: 'Hyperlane',
      contracts: {
        1: '0x35231d4c2D8B8ADcB5617A638A0c4548684c7C70',
        137: '0x5d934f4e2f797775e53561bB72aca21ba36B96BB',
        42161: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
        10: '0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D',
        8453: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D'
      },
      supportedChains: [1, 137, 42161, 10, 8453],
      fees: {
        1: '0.005',
        137: '5',
        42161: '0.003',
        10: '0.003',
        8453: '0.003'
      },
      estimatedTimes: {
        '1-137': 3,
        '137-1': 5,
        '1-42161': 2,
        '42161-1': 3,
        '1-10': 2,
        '10-1': 3
      }
    });

    console.log(`✅ Initialized ${this.bridgeConfigs.size} bridge configurations`);
  }

  private async checkChainConnectivity(): Promise<void> {
    for (const [chainId, chainInfo] of this.supportedChains) {
      try {
        const response = await axios.post(chainInfo.rpcUrl, {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }, { timeout: 10000 });

        this.chainStatus.set(chainId, response.status === 200 && response.data.result);
        console.log(`✅ ${chainInfo.name} connectivity: OK`);
      } catch (error) {
        this.chainStatus.set(chainId, false);
        console.warn(`⚠️ ${chainInfo.name} connectivity: FAILED`);
      }
    }
  }

  private async initializeBridgeServices(): Promise<void> {
    // Initialize bridge service connections
    for (const [bridgeName, config] of this.bridgeConfigs) {
      try {
        // Test bridge connectivity
        await this.testBridgeConnection(bridgeName, config);
        console.log(`✅ ${config.name} bridge service initialized`);
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${config.name} bridge:`, error);
      }
    }
  }

  private async testBridgeConnection(bridgeName: string, config: BridgeConfig): Promise<void> {
    // Test bridge API connectivity
    // This would depend on the specific bridge's API
    return Promise.resolve();
  }

  private startMonitoring(): void {
    // Monitor bridge transactions every 30 seconds
    setInterval(() => {
      this.monitorBridgeTransactions();
    }, 30000);

    // Check chain status every 5 minutes
    setInterval(() => {
      this.checkChainConnectivity();
    }, 300000);

    console.log('✅ Cross-chain monitoring started');
  }

  // Public API methods
  public getSupportedChains(): ChainInfo[] {
    return Array.from(this.supportedChains.values());
  }

  public getChainInfo(chainId: number): ChainInfo | undefined {
    return this.supportedChains.get(chainId);
  }

  public getAvailableBridges(fromChain: number, toChain: number): BridgeConfig[] {
    const availableBridges: BridgeConfig[] = [];

    for (const config of this.bridgeConfigs.values()) {
      if (config.supportedChains.includes(fromChain) && 
          config.supportedChains.includes(toChain)) {
        availableBridges.push(config);
      }
    }

    return availableBridges;
  }

  public async getBridgeQuote(
    fromChain: number,
    toChain: number,
    tokenContract: string,
    tokenId: string,
    bridgeName?: string
  ): Promise<{
    bridge: string;
    fees: { gas: string; bridge: string; total: string };
    estimatedTime: number;
    route: string[];
  }[]> {
    const quotes = [];
    const availableBridges = bridgeName 
      ? [this.bridgeConfigs.get(bridgeName)!].filter(Boolean)
      : this.getAvailableBridges(fromChain, toChain);

    for (const bridge of availableBridges) {
      try {
        const quote = await this.getBridgeQuoteForBridge(
          bridge,
          fromChain,
          toChain,
          tokenContract,
          tokenId
        );
        quotes.push(quote);
      } catch (error) {
        console.error(`Failed to get quote from ${bridge.name}:`, error);
      }
    }

    return quotes.sort((a, b) => parseFloat(a.fees.total) - parseFloat(b.fees.total));
  }

  private async getBridgeQuoteForBridge(
    bridge: BridgeConfig,
    fromChain: number,
    toChain: number,
    tokenContract: string,
    tokenId: string
  ): Promise<any> {
    const routeKey = `${fromChain}-${toChain}`;
    const bridgeFee = bridge.fees[fromChain] || '0';
    const gasFee = await this.estimateGasFee(fromChain, tokenContract);
    
    return {
      bridge: bridge.name,
      fees: {
        gas: gasFee,
        bridge: bridgeFee,
        total: (parseFloat(gasFee) + parseFloat(bridgeFee)).toString()
      },
      estimatedTime: bridge.estimatedTimes[routeKey] || 30,
      route: [fromChain.toString(), toChain.toString()]
    };
  }

  public async bridgeNFT(
    fromChain: number,
    toChain: number,
    tokenContract: string,
    tokenId: string,
    toAddress: string,
    bridgeName: string = 'layerzero'
  ): Promise<BridgeTransaction> {
    const bridge = this.bridgeConfigs.get(bridgeName);
    if (!bridge) {
      throw new Error(`Bridge ${bridgeName} not supported`);
    }

    if (!bridge.supportedChains.includes(fromChain) || !bridge.supportedChains.includes(toChain)) {
      throw new Error(`Bridge ${bridgeName} does not support this route`);
    }

    // Create bridge transaction record
    const transaction: BridgeTransaction = {
      id: this.generateTransactionId(),
      fromChain,
      toChain,
      fromAddress: '', // Would be provided by caller
      toAddress,
      tokenContract,
      tokenId,
      amount: '1', // NFTs are always 1
      status: 'pending',
      createdAt: new Date(),
      estimatedTime: bridge.estimatedTimes[`${fromChain}-${toChain}`] || 30,
      fees: await this.calculateBridgeFees(bridge, fromChain, toChain, tokenContract)
    };

    this.bridgeTransactions.set(transaction.id, transaction);

    try {
      // Initiate bridge transaction
      const txHash = await this.initiateBridgeTransaction(bridge, transaction);
      transaction.txHash = txHash;
      transaction.status = 'confirmed';

      this.emit('bridgeTransactionStarted', transaction);

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      this.emit('bridgeTransactionFailed', { transaction, error });
      throw error;
    }
  }

  private async initiateBridgeTransaction(
    bridge: BridgeConfig,
    transaction: BridgeTransaction
  ): Promise<string> {
    // This would implement the actual bridge transaction logic
    // For now, return a mock transaction hash
    return `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
  }

  private async calculateBridgeFees(
    bridge: BridgeConfig,
    fromChain: number,
    toChain: number,
    tokenContract: string
  ): Promise<{ gas: string; bridge: string; total: string }> {
    const bridgeFee = bridge.fees[fromChain] || '0';
    const gasFee = await this.estimateGasFee(fromChain, tokenContract);
    
    return {
      gas: gasFee,
      bridge: bridgeFee,
      total: (parseFloat(gasFee) + parseFloat(bridgeFee)).toString()
    };
  }

  private async estimateGasFee(chainId: number, tokenContract: string): Promise<string> {
    // Estimate gas fees for the bridge transaction
    const baseGasFees: { [chainId: number]: string } = {
      1: '0.01',   // Ethereum
      137: '0.001', // Polygon
      42161: '0.002', // Arbitrum
      10: '0.002',   // Optimism
      8453: '0.001'  // Base
    };

    return baseGasFees[chainId] || '0.005';
  }

  public async getBridgeTransaction(transactionId: string): Promise<BridgeTransaction | undefined> {
    return this.bridgeTransactions.get(transactionId);
  }

  public async getBridgeTransactionsByUser(userAddress: string): Promise<BridgeTransaction[]> {
    const userTransactions: BridgeTransaction[] = [];
    
    for (const transaction of this.bridgeTransactions.values()) {
      if (transaction.fromAddress.toLowerCase() === userAddress.toLowerCase() ||
          transaction.toAddress.toLowerCase() === userAddress.toLowerCase()) {
        userTransactions.push(transaction);
      }
    }

    return userTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getNFTBridgeHistory(
    tokenContract: string,
    tokenId: string
  ): Promise<BridgeTransaction[]> {
    const nftTransactions: BridgeTransaction[] = [];
    
    for (const transaction of this.bridgeTransactions.values()) {
      if (transaction.tokenContract.toLowerCase() === tokenContract.toLowerCase() &&
          transaction.tokenId === tokenId) {
        nftTransactions.push(transaction);
      }
    }

    return nftTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getCrossChainNFTInfo(
    tokenContract: string,
    tokenId: string
  ): Promise<CrossChainNFT | null> {
    const bridgeHistory = await this.getNFTBridgeHistory(tokenContract, tokenId);
    
    if (bridgeHistory.length === 0) {
      return null;
    }

    // Find the most recent completed bridge transaction to determine current chain
    const lastCompleted = bridgeHistory.find(tx => tx.status === 'completed');
    const currentChain = lastCompleted ? lastCompleted.toChain : bridgeHistory[0].fromChain;

    return {
      originalChain: bridgeHistory[bridgeHistory.length - 1].fromChain,
      currentChain,
      originalContract: tokenContract,
      wrappedContract: lastCompleted ? this.getWrappedContract(tokenContract, currentChain) : undefined,
      tokenId,
      isBridged: bridgeHistory.some(tx => tx.status === 'completed'),
      bridgeHistory,
      metadata: await this.getNFTMetadata(tokenContract, tokenId, currentChain)
    };
  }

  private getWrappedContract(originalContract: string, currentChain: number): string | undefined {
    // This would map original contracts to their wrapped versions on different chains
    // For now, return a placeholder
    return `${originalContract}_wrapped_${currentChain}`;
  }

  private async getNFTMetadata(
    tokenContract: string,
    tokenId: string,
    chainId: number
  ): Promise<any> {
    // Fetch NFT metadata from the appropriate chain
    try {
      const chainInfo = this.supportedChains.get(chainId);
      if (!chainInfo) return null;

      // This would make an actual RPC call to get token metadata
      return {
        name: `NFT #${tokenId}`,
        description: `Cross-chain NFT from contract ${tokenContract}`,
        image: '',
        attributes: []
      };
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error);
      return null;
    }
  }

  private async monitorBridgeTransactions(): Promise<void> {
    for (const [id, transaction] of this.bridgeTransactions) {
      if (transaction.status === 'confirmed' || transaction.status === 'bridging') {
        try {
          const status = await this.checkBridgeTransactionStatus(transaction);
          if (status !== transaction.status) {
            transaction.status = status as any;
            
            if (status === 'completed') {
              transaction.completedAt = new Date();
              this.emit('bridgeTransactionCompleted', transaction);
            } else if (status === 'failed') {
              this.emit('bridgeTransactionFailed', { transaction, error: 'Bridge transaction failed' });
            }
          }
        } catch (error) {
          console.error(`Error monitoring bridge transaction ${id}:`, error);
        }
      }
    }
  }

  private async checkBridgeTransactionStatus(transaction: BridgeTransaction): Promise<string> {
    // This would check the actual bridge transaction status
    // For now, simulate status progression
    const now = new Date();
    const elapsed = now.getTime() - transaction.createdAt.getTime();
    const estimatedCompletion = transaction.estimatedTime * 60 * 1000; // Convert minutes to ms

    if (elapsed > estimatedCompletion) {
      return 'completed';
    } else if (elapsed > estimatedCompletion * 0.3) {
      return 'bridging';
    } else {
      return 'confirmed';
    }
  }

  // Chain status and health monitoring
  public getChainStatus(): { [chainId: number]: boolean } {
    return Object.fromEntries(this.chainStatus);
  }

  public isChainHealthy(chainId: number): boolean {
    return this.chainStatus.get(chainId) || false;
  }

  public async getChainMetrics(chainId: number): Promise<{
    latency: number;
    blockHeight: number;
    gasPrice: string;
    isHealthy: boolean;
  } | null> {
    const chainInfo = this.supportedChains.get(chainId);
    if (!chainInfo) return null;

    try {
      const startTime = Date.now();
      
      const [blockNumber, gasPrice] = await Promise.all([
        this.getBlockNumber(chainInfo.rpcUrl),
        this.getGasPrice(chainInfo.rpcUrl)
      ]);

      const latency = Date.now() - startTime;

      return {
        latency,
        blockHeight: parseInt(blockNumber, 16),
        gasPrice,
        isHealthy: this.chainStatus.get(chainId) || false
      };
    } catch (error) {
      console.error(`Failed to get metrics for chain ${chainId}:`, error);
      return null;
    }
  }

  private async getBlockNumber(rpcUrl: string): Promise<string> {
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    });
    return response.data.result;
  }

  private async getGasPrice(rpcUrl: string): Promise<string> {
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1
    });
    return response.data.result;
  }

  // Utility methods
  private generateTransactionId(): string {
    return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public async validateBridgeRoute(fromChain: number, toChain: number): Promise<boolean> {
    if (fromChain === toChain) return false;
    
    const fromChainInfo = this.supportedChains.get(fromChain);
    const toChainInfo = this.supportedChains.get(toChain);
    
    return !!(fromChainInfo && toChainInfo && 
              this.chainStatus.get(fromChain) && 
              this.chainStatus.get(toChain));
  }

  public getBridgeStatistics(): {
    totalTransactions: number;
    completedTransactions: number;
    activeTransactions: number;
    failedTransactions: number;
    totalVolume: string;
    averageTime: number;
  } {
    const transactions = Array.from(this.bridgeTransactions.values());
    
    return {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(tx => tx.status === 'completed').length,
      activeTransactions: transactions.filter(tx => ['pending', 'confirmed', 'bridging'].includes(tx.status)).length,
      failedTransactions: transactions.filter(tx => tx.status === 'failed').length,
      totalVolume: transactions.filter(tx => tx.status === 'completed').length.toString(),
      averageTime: this.calculateAverageBridgeTime(transactions)
    };
  }

  private calculateAverageBridgeTime(transactions: BridgeTransaction[]): number {
    const completedTxs = transactions.filter(tx => tx.status === 'completed' && tx.completedAt);
    
    if (completedTxs.length === 0) return 0;
    
    const totalTime = completedTxs.reduce((sum, tx) => {
      const duration = tx.completedAt!.getTime() - tx.createdAt.getTime();
      return sum + duration;
    }, 0);
    
    return totalTime / completedTxs.length / (1000 * 60); // Convert to minutes
  }

  // Event handlers for external integration
  public onBridgeTransactionUpdate(callback: (transaction: BridgeTransaction) => void): void {
    this.on('bridgeTransactionStarted', callback);
    this.on('bridgeTransactionCompleted', callback);
    this.on('bridgeTransactionFailed', (data) => callback(data.transaction));
  }

  public getBridgeConfigs(): { [name: string]: BridgeConfig } {
    return Object.fromEntries(this.bridgeConfigs);
  }

  public async estimateBridgeTime(fromChain: number, toChain: number, bridgeName?: string): Promise<number> {
    const route = `${fromChain}-${toChain}`;
    
    if (bridgeName) {
      const bridge = this.bridgeConfigs.get(bridgeName);
      return bridge?.estimatedTimes[route] || 30;
    }
    
    // Return the fastest available bridge time
    const availableBridges = this.getAvailableBridges(fromChain, toChain);
    const times = availableBridges.map(bridge => bridge.estimatedTimes[route] || 30);
    
    return times.length > 0 ? Math.min(...times) : 30;
  }
}