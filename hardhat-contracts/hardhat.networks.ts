import dotenv from "dotenv";
import { NetworksUserConfig } from "hardhat/types";

dotenv.config();

const SEPOLIA_PROVIDER_URL = "https://ethereum-sepolia-rpc.publicnode.com";

export const networks: NetworksUserConfig = {
  //prod
  polygon_main_prod: {
    live: true,
    chainId: 137,
    url: `${process.env.POLYGON_MAINNET_PROVIDER_URL}`,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  mumbai_prod: {
    live: true,
    chainId: 80001,
    url: `${process.env.MUMBAI_PROVIDER_URL}`,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  sepolia_prod: {
    live: true,
    chainId: 11155111,
    url: SEPOLIA_PROVIDER_URL,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  // staging
  polygon_main_staging: {
    live: true,
    chainId: 137,
    url: `${process.env.POLYGON_MAINNET_PROVIDER_URL}`,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  mumbai_staging: {
    live: true,
    chainId: 80001,
    url: `${process.env.MUMBAI_PROVIDER_URL}`,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  sepolia_staging: {
    live: true,
    chainId: 11155111,
    url: SEPOLIA_PROVIDER_URL,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  //dev
  polygon_main_dev: {
    live: true,
    chainId: 137,
    url: `${process.env.POLYGON_MAINNET_PROVIDER_URL}`,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  mumbai_dev: {
    live: true,
    chainId: 80001,
    url: `${process.env.MUMBAI_PROVIDER_URL}`,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  sepolia_dev: {
    live: true,
    chainId: 11155111,
    url: SEPOLIA_PROVIDER_URL,
    accounts: { mnemonic: process.env.DEPLOYMENT_MNEMONIC },
  },
  // local
  hardhat: {
    live: false,
    forking: {
      url: `${process.env.MUMBAI_PROVIDER_URL}`,
      // using fixed block number is supposed to improve test performance
      blockNumber: 41591456,
    },
    // Nexera ID Test address is set up with tokens to test the Pool
    accounts: { mnemonic: process.env.TEST_MNEMONIC },
  },
};
