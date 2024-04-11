import { HardhatUserConfig } from "hardhat/config";

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomicfoundation/hardhat-viem";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

import dotenv from "dotenv";

import namedAccounts from "./hardhat.accounts";
import { networks } from "./hardhat.networks";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: true, // this resolves the issue when running coverage:: `Stack too deep when compiling inline assembly: Variable value0 is 2 slot(s) too deep inside the stack`
        },
      },
      viaIR: true,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: `${process.env.ETHERSCAN_AMOY_API_KEY}`,
    },
  },
  networks,
  namedAccounts,
  typechain: {
    outDir: "typechain",
  },
  mocha: {
    timeout: 3000000,
  },
};
export default config;
