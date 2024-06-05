import dotenv from "dotenv";
import { NetworksUserConfig } from "hardhat/types";
import {
  Address,
  NEXERA_CHAINS,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

dotenv.config();

// Default values
const SEPOLIA_PROVIDER_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const DEFAULT_AMOY_URL = "https://rpc-amoy.polygon.technology";
const DEFAULT_POLYGON_MAINNET = "https://polygon-rpc.com";
const DEFAULT_BASE = "https://base.llamarpc.com";
const DEFAULT_ETHEREUM = "https://eth.llamarpc.com";
const DEFAULT_ARBITRUM = "https://arbitrum.llamarpc.com";
const DEFAULT_BNB = "https://binance.llamarpc.com";
const DEFAULT_OPTIMISM = "https://optimism.llamarpc.com";
const DEFAULT_AVALANCHE = "https://avalanche-c-chain-rpc.publicnode.com";
const DEFAULT_MNEMONIC =
  "witch collapse practice feed shame open despair creek road again ice least"; // never use that one in prod

// env variables
const MAINNET_SIG_DEPLOYMENT_MNEMONIC =
  process.env.MAINNET_SIG_DEPLOYMENT_MNEMONIC || DEFAULT_MNEMONIC;
const TEST_MNEMONIC = process.env.TEST_MNEMONIC || DEFAULT_MNEMONIC;
const POLYGON_MAINNET_PROVIDER_URL =
  process.env.POLYGON_MAINNET_PROVIDER_URL || DEFAULT_POLYGON_MAINNET;
const BASE_PROVIDER_URL = process.env.BASE_PROVIDER_URL || DEFAULT_BASE;
const AMOY_PROVIDER_URL = process.env.AMOY_PROVIDER_URL || DEFAULT_AMOY_URL;
const ETHEREUM_PROVIDER_URL =
  process.env.ETHEREUM_PROVIDER_URL || DEFAULT_ETHEREUM;
const ARBITRUM_PROVIDER_URL =
  process.env.ARBITRUM_PROVIDER_URL || DEFAULT_ARBITRUM;
const BNB_PROVIDER_URL = process.env.BNB_PROVIDER_URL || DEFAULT_BNB;
const OPTIMISM_PROVIDER_URL =
  process.env.OPTIMISM_PROVIDER_URL || DEFAULT_OPTIMISM;
const AVALANCHE_PROVIDER_URL =
  process.env.AVALANCHE_PROVIDER_URL || DEFAULT_AVALANCHE;

export const networks: NetworksUserConfig = {
  //mainnets
  polygon_main: {
    live: true,
    chainId: Number(NEXERA_CHAINS.POLYGON),
    url: `${POLYGON_MAINNET_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  base: {
    live: true,
    chainId: Number(NEXERA_CHAINS.BASE),
    url: `${BASE_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  ethereum: {
    live: true,
    chainId: Number(NEXERA_CHAINS.ETHEREUM),
    url: `${ETHEREUM_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  arbitrum: {
    live: true,
    chainId: Number(NEXERA_CHAINS.ARBITRUM),
    url: `${ARBITRUM_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  bnb: {
    live: true,
    chainId: Number(NEXERA_CHAINS.BNB),
    url: `${BNB_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  optimism: {
    live: true,
    chainId: Number(NEXERA_CHAINS.OPTIMISM),
    url: `${OPTIMISM_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  avalanche: {
    live: true,
    chainId: Number(NEXERA_CHAINS.AVALANCHE),
    url: `${AVALANCHE_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  //testnets
  amoy: {
    live: true,
    chainId: Number(NEXERA_CHAINS.POLYGON_AMOY),
    url: `${AMOY_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  sepolia: {
    live: true,
    chainId: Number(NEXERA_CHAINS.SEPOLIA),
    url: SEPOLIA_PROVIDER_URL,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  // testnets for local testing
  // because the api tx signer is different when we test locally
  amoy_local: {
    live: true,
    chainId: Number(NEXERA_CHAINS.POLYGON_AMOY),
    url: `${AMOY_PROVIDER_URL}`,
    accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
  },
  sepolia_local: {
    live: true,
    chainId: Number(NEXERA_CHAINS.SEPOLIA),
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
