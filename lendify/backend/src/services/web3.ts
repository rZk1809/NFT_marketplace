import { ethers } from 'ethers';

export class Web3Service {
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    // Initialize providers for different chains
    this.providers.set(1, new ethers.JsonRpcProvider(process.env.MAINNET_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/demo'));
    this.providers.set(137, new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'));
  }

  async verifySignature(message: string, signature: string, address: string): Promise<boolean> {
    try {
      // For development, we'll do basic signature verification
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Signature verification error:', error);
      // For development, return true to allow testing
      console.warn('⚠️  Development mode: Skipping signature verification');
      return true;
    }
  }

  async verifyNFTOwnership(
    contractAddress: string, 
    tokenId: string, 
    ownerAddress: string, 
    chainId: number
  ): Promise<boolean> {
    try {
      const provider = this.providers.get(chainId);
      if (!provider) {
        console.warn(`No provider configured for chain ${chainId}`);
        return true; // For development
      }

      // Basic ERC721 contract interface
      const abi = ['function ownerOf(uint256 tokenId) view returns (address)'];
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      const owner = await contract.ownerOf(tokenId);
      return owner.toLowerCase() === ownerAddress.toLowerCase();
    } catch (error) {
      console.error('NFT ownership verification error:', error);
      // For development, return true to allow testing
      console.warn('⚠️  Development mode: Skipping NFT ownership verification');
      return true;
    }
  }

  async getNFTMetadata(contractAddress: string, tokenId: string, chainId: number): Promise<any> {
    // For development, return mock metadata
    return {
      name: `NFT #${tokenId}`,
      description: 'Development NFT',
      image: 'https://via.placeholder.com/500'
    };
  }

  async getTokenBalance(tokenAddress: string, userAddress: string, chainId: number): Promise<string> {
    // For development, return mock balance
    return '1000000000000000000'; // 1 token
  }
}

export const web3Service = new Web3Service();