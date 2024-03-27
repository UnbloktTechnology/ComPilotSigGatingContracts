const DESIRED_VALIDITY_DURATION = 5 * 60; //5 minutes

const blockTimes: Record<string, number> = {
  "1": 12, // Ethereum Mainnet
  "5": 12, // Goerli Testnet
  "11155111": 12, // Sepolia Testnet
  "42161": 0.26, // Arbitrum One
  "421613": 0.26, // Arbitrum Goerli Testnet
  "421614": 0.26, // Arbitrum Sepolia Testnet
  "10": 2, // Optimism
  "420": 2, // Optimism Goerli Testnet
  "11155420": 2, // Optimism Sepolia Testnet
  "43114": 3, // Avalanche C-Chain Mainnet
  "43113": 3, // Avalanche Fuji Testnet
  "137": 2, // Polygon Mainnet
  "80001": 2, // Polygon Mumbai Testnet
  "8453": 2, // Base
  "84531": 2, // Base Goerli
  "84532": 2, // Base Sepolia
  "1284": 12, // Moonbeam
  "1285": 12, // Moonriver
};

export function getSignatureValidityBlockDuration(chainId: number) {
  if (blockTimes[chainId.toString()]) {
    return Math.floor(
      DESIRED_VALIDITY_DURATION / blockTimes[chainId.toString()]
    );
  } else {
    return 25;
  }
}
