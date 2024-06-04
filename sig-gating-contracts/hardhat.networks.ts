import dotenv from "dotenv";
import { NetworksUserConfig } from "hardhat/types";

dotenv.config();

// Default values
const SEPOLIA_PROVIDER_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const DEFAULT_AMOY_URL = "https://rpc-amoy.polygon.technology";
const DEFAULT_POLYGON_MAINNET = "https://polygon-rpc.com";
const DEFAULT_MNEMONIC =
  "witch collapse practice feed shame open despair creek road again ice least"; // never use that one in prod

// env variables
const MAINNET_SIG_DEPLOYMENT_MNEMONIC =
  process.env.MAINNET_SIG_DEPLOYMENT_MNEMONIC || DEFAULT_MNEMONIC;
const TEST_MNEMONIC = process.env.TEST_MNEMONIC || DEFAULT_MNEMONIC;
const POLYGON_MAINNET_PROVIDER_URL =
  process.env.POLYGON_MAINNET_PROVIDER_URL || DEFAULT_POLYGON_MAINNET;
const AMOY_PROVIDER_URL = process.env.AMOY_PROVIDER_URL || DEFAULT_AMOY_URL;

export const networks: NetworksUserConfig = {
  //mainnets
  polygon_main: {
    live: true,
    chainId: 137,
    url: `${POLYGON_MAINNET_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  //testnets
  amoy: {
    live: true,
    chainId: 80002,
    url: `${AMOY_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  sepolia: {
    live: true,
    chainId: 11155111,
    url: SEPOLIA_PROVIDER_URL,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  // local
  hardhat: {
    live: false,
    forking: {
      url: `${AMOY_PROVIDER_URL}`,
      // using fixed block number is supposed to improve test performance
      blockNumber: 5499570,
    },
    // Nexera ID Test address is set up with tokens to test the Pool
    accounts: { mnemonic: TEST_MNEMONIC },
  },
};
