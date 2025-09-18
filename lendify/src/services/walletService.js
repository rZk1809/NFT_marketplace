import { ethers } from 'ethers';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';

// Wallet provider types
export const WalletType = {
  METAMASK: 'metamask',
  WALLETCONNECT: 'walletconnect',
  COINBASE: 'coinbase',
  TRUST: 'trust',
  PHANTOM: 'phantom',
  INJECTED: 'injected'
};

class WalletService {
  constructor() {
    this.currentWallet = null;
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.walletConnectProvider = null;
    this.coinbaseWallet = null;
    
    // Initialize Coinbase Wallet
    this.initializeCoinbaseWallet();
  }

  initializeCoinbaseWallet() {
    try {
      this.coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'Lendify',
        appLogoUrl: 'https://lendify.com/logo.png',
        darkMode: false
      });
    } catch (error) {
      console.warn('Failed to initialize Coinbase Wallet:', error);
    }
  }

  // Detect available wallets
  detectAvailableWallets() {
    const wallets = [];

    // MetaMask
    if (window.ethereum && window.ethereum.isMetaMask) {
      wallets.push({
        type: WalletType.METAMASK,
        name: 'MetaMask',
        icon: '🦊',
        installed: true,
        provider: window.ethereum
      });
    }

    // Trust Wallet
    if (window.ethereum && window.ethereum.isTrust) {
      wallets.push({
        type: WalletType.TRUST,
        name: 'Trust Wallet',
        icon: '🛡️',
        installed: true,
        provider: window.ethereum
      });
    }

    // Phantom (if available)
    if (window.solana && window.solana.isPhantom) {
      wallets.push({
        type: WalletType.PHANTOM,
        name: 'Phantom',
        icon: '👻',
        installed: true,
        provider: window.solana
      });
    }

    // WalletConnect
    wallets.push({
      type: WalletType.WALLETCONNECT,
      name: 'WalletConnect',
      icon: '🔗',
      installed: true, // Always available as it connects to other wallets
      provider: null // Dynamically created
    });

    // Coinbase Wallet
    if (this.coinbaseWallet) {
      wallets.push({
        type: WalletType.COINBASE,
        name: 'Coinbase Wallet',
        icon: '🔵',
        installed: true,
        provider: this.coinbaseWallet.makeWeb3Provider()
      });
    }

    // Generic injected wallet
    if (window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isTrust) {
      wallets.push({
        type: WalletType.INJECTED,
        name: 'Injected Wallet',
        icon: '💳',
        installed: true,
        provider: window.ethereum
      });
    }

    return wallets;
  }

  // Connect to specific wallet
  async connectWallet(walletType) {
    try {
      console.log(`Attempting to connect to ${walletType}...`);

      switch (walletType) {
        case WalletType.METAMASK:
          return await this.connectMetaMask();
        case WalletType.WALLETCONNECT:
          return await this.connectWalletConnect();
        case WalletType.COINBASE:
          return await this.connectCoinbaseWallet();
        case WalletType.TRUST:
          return await this.connectTrustWallet();
        case WalletType.INJECTED:
          return await this.connectInjectedWallet();
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }
    } catch (error) {
      console.error(`Error connecting to ${walletType}:`, error);
      throw error;
    }
  }

  // MetaMask connection
  async connectMetaMask() {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found in MetaMask');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.address = accounts[0];
    this.currentWallet = WalletType.METAMASK;
    
    // Get network info
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);

    await this.setupEventListeners(window.ethereum);
    
    return {
      address: this.address,
      chainId: this.chainId,
      walletType: this.currentWallet
    };
  }

  // WalletConnect connection
  async connectWalletConnect() {
    try {
      // Dynamic import to avoid bundle size issues
      const WalletConnect = (await import('@walletconnect/web3-provider')).default;
      
      const provider = new WalletConnect({
        infuraId: process.env.REACT_APP_INFURA_ID,
        rpc: {
          1: process.env.REACT_APP_MAINNET_RPC_URL,
          5: process.env.REACT_APP_GOERLI_RPC_URL,
          137: process.env.REACT_APP_POLYGON_RPC_URL,
        },
        chainId: 1,
        bridge: 'https://bridge.walletconnect.org',
        qrcode: true,
        qrcodeModalOptions: {
          mobileLinks: [
            'rainbow',
            'metamask',
            'argent',
            'trust',
            'imtoken',
            'pillar'
          ]
        }
      });

      await provider.enable();

      this.walletConnectProvider = provider;
      this.provider = new ethers.Web3Provider(provider);
      this.signer = this.provider.getSigner();
      this.address = provider.accounts[0];
      this.chainId = provider.chainId;
      this.currentWallet = WalletType.WALLETCONNECT;

      await this.setupEventListeners(provider);
      
      return {
        address: this.address,
        chainId: this.chainId,
        walletType: this.currentWallet
      };
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      throw new Error('Failed to connect with WalletConnect. Please try again.');
    }
  }

  // Coinbase Wallet connection
  async connectCoinbaseWallet() {
    if (!this.coinbaseWallet) {
      throw new Error('Coinbase Wallet SDK not initialized');
    }

    try {
      const provider = this.coinbaseWallet.makeWeb3Provider();
      
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found in Coinbase Wallet');
      }

      this.provider = new ethers.Web3Provider(provider);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      this.currentWallet = WalletType.COINBASE;
      
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);

      await this.setupEventListeners(provider);
      
      return {
        address: this.address,
        chainId: this.chainId,
        walletType: this.currentWallet
      };
    } catch (error) {
      console.error('Coinbase Wallet connection failed:', error);
      throw new Error('Failed to connect with Coinbase Wallet. Please try again.');
    }
  }

  // Trust Wallet connection
  async connectTrustWallet() {
    if (!window.ethereum || !window.ethereum.isTrust) {
      throw new Error('Trust Wallet is not installed. Please install Trust Wallet and try again.');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found in Trust Wallet');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.address = accounts[0];
    this.currentWallet = WalletType.TRUST;
    
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);

    await this.setupEventListeners(window.ethereum);
    
    return {
      address: this.address,
      chainId: this.chainId,
      walletType: this.currentWallet
    };
  }

  // Generic injected wallet connection
  async connectInjectedWallet() {
    if (!window.ethereum) {
      throw new Error('No Web3 wallet found. Please install a Web3 wallet and try again.');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.address = accounts[0];
    this.currentWallet = WalletType.INJECTED;
    
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);

    await this.setupEventListeners(window.ethereum);
    
    return {
      address: this.address,
      chainId: this.chainId,
      walletType: this.currentWallet
    };
  }

  // Setup event listeners for wallet changes
  async setupEventListeners(provider) {
    if (provider.on) {
      provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
          window.location.reload();
        } else {
          this.address = accounts[0];
          window.dispatchEvent(new CustomEvent('walletAccountChanged', {
            detail: { address: this.address }
          }));
        }
      });

      provider.on('chainChanged', (chainId) => {
        this.chainId = Number(chainId);
        window.dispatchEvent(new CustomEvent('walletChainChanged', {
          detail: { chainId: this.chainId }
        }));
        window.location.reload(); // Recommended by MetaMask
      });

      provider.on('disconnect', () => {
        this.disconnect();
        window.dispatchEvent(new CustomEvent('walletDisconnected'));
      });
    }
  }

  // Disconnect wallet
  async disconnect() {
    try {
      if (this.walletConnectProvider) {
        await this.walletConnectProvider.disconnect();
        this.walletConnectProvider = null;
      }

      this.currentWallet = null;
      this.provider = null;
      this.signer = null;
      this.address = null;
      this.chainId = null;

      // Clear local storage
      localStorage.removeItem('walletConnect');
      localStorage.removeItem('walletType');
      localStorage.removeItem('walletAddress');
      
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }

  // Get current wallet info
  getWalletInfo() {
    return {
      address: this.address,
      chainId: this.chainId,
      walletType: this.currentWallet,
      isConnected: !!this.address,
      provider: this.provider,
      signer: this.signer
    };
  }

  // Format address for display
  formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Switch network
  async switchNetwork(chainId) {
    const hexChainId = `0x${chainId.toString(16)}`;
    
    try {
      if (this.currentWallet === WalletType.WALLETCONNECT) {
        // WalletConnect doesn't support network switching via the interface
        throw new Error('Please switch network in your wallet app');
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      
      this.chainId = chainId;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await this.addNetwork(chainId);
      } else {
        throw switchError;
      }
    }
  }

  // Add network to wallet
  async addNetwork(chainId) {
    const networks = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://eth-mainnet.alchemyapi.io/v2/your-api-key'],
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        blockExplorerUrls: ['https://etherscan.io'],
      },
      137: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        blockExplorerUrls: ['https://polygonscan.com'],
      }
    };

    const networkParams = networks[chainId];
    if (!networkParams) {
      throw new Error(`Network ${chainId} not supported`);
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkParams],
    });
  }

  // Check if wallet is connected on app load
  async checkConnection() {
    const savedWalletType = localStorage.getItem('walletType');
    
    if (!savedWalletType) return false;

    try {
      return await this.connectWallet(savedWalletType);
    } catch (error) {
      console.error('Error restoring wallet connection:', error);
      localStorage.removeItem('walletType');
      return false;
    }
  }

  // Save wallet connection state
  saveConnection() {
    if (this.currentWallet && this.address) {
      localStorage.setItem('walletType', this.currentWallet);
      localStorage.setItem('walletAddress', this.address);
    }
  }
}

// Create and export singleton instance
export const walletService = new WalletService();
export default walletService;