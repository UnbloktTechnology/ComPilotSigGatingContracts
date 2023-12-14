import { HardhatUserConfig, task } from "hardhat/config";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";

import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const DEFAULT_MUMBAI_URL = "https://polygon-mumbai-bor.publicnode.com";
const MUMBAI_PROVIDER_URL =
  process.env.MUMBAI_PROVIDER_URL || DEFAULT_MUMBAI_URL;

const config: HardhatUserConfig = {
  solidity: "0.8.16",
  etherscan: {
    apiKey: {
      polygonMumbai: `${process.env.ETHERSCAN_MUMBAI_API_KEY}`,
    },
  },
  networks: {
    mumbai: {
      chainId: 80001,
      url: `${MUMBAI_PROVIDER_URL}`,
      accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY}`],
    },
    hardhat: {
      forking: {
        url: `${MUMBAI_PROVIDER_URL}`,
        // using fixed block number is supposed to improve test performance
        blockNumber: 41591456,
      },
      // Nexera ID Test address is set up with tokens to test the Pool
      accounts: [
        {
          privateKey: `0x${process.env.MUMBAI_PRIVATE_KEY}`,
          balance: ethers.utils.parseEther("2000000").toString(),
        },
        {
          privateKey: `0x${process.env.MUMBAI_PRIVATE_KEY2}`,
          balance: ethers.utils.parseEther("2000000").toString(),
        },
      ],
    },
  },
  typechain: {
    outDir: "types",
  },
  mocha: {
    timeout: 3000000,
  },
};
export default config;
