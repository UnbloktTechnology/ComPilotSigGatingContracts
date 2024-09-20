import dotenv from "dotenv";
import { NetworksUserConfig } from "hardhat/types";
import {
	ChainId,
	IdToChains,
	COMPILOT_CHAINS,
} from "@compilot/sig-gating-contracts-sdk/lib";

dotenv.config();

// Default values

const getRpcUrl = (chainId: ChainId) => {
	return IdToChains[chainId]?.rpcUrls.default.http[0];
};
const DEFAULT_MNEMONIC =
	"witch collapse practice feed shame open despair creek road again ice least"; // never use that one in prod

// env variables

// mnemonics
const MAINNET_SIG_DEPLOYMENT_MNEMONIC =
	process.env.MAINNET_SIG_DEPLOYMENT_MNEMONIC || DEFAULT_MNEMONIC;
const TEST_MNEMONIC = process.env.TEST_MNEMONIC || DEFAULT_MNEMONIC;

// providers

// mainnets
const POLYGON_MAINNET_PROVIDER_URL =
	process.env.POLYGON_MAINNET_PROVIDER_URL ||
	getRpcUrl(COMPILOT_CHAINS.POLYGON);
const BASE_PROVIDER_URL =
	process.env.BASE_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.BASE);
const ETHEREUM_PROVIDER_URL =
	process.env.ETHEREUM_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.ETHEREUM);
const ARBITRUM_PROVIDER_URL =
	process.env.ARBITRUM_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.ARBITRUM);
const BNB_PROVIDER_URL =
	process.env.BNB_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.BNB);
const OPTIMISM_PROVIDER_URL =
	process.env.OPTIMISM_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.OPTIMISM);
const AVALANCHE_PROVIDER_URL =
	process.env.AVALANCHE_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.AVALANCHE);

// testnets
const AMOY_PROVIDER_URL =
	process.env.AMOY_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.POLYGON_AMOY);
const SEPOLIA_PROVIDER_URL =
	process.env.SEPOLIA_PROVIDER_URL || getRpcUrl(COMPILOT_CHAINS.SEPOLIA);
const BNB_TESTNET_PROVIDER_URL =
	process.env.BNB_TESTNET_PROVIDER_URL ||
	getRpcUrl(COMPILOT_CHAINS.BNB_TESTNET);
const OPTIMISM_SEPOLIA_PROVIDER_URL =
	process.env.OPTIMISM_SEPOLIA_PROVIDER_URL ||
	getRpcUrl(COMPILOT_CHAINS.OPTIMISM_SEPOLIA);
const BASE_SEPOLIA_PROVIDER_URL =
	process.env.BASE_SEPOLIA_PROVIDER_URL ||
	getRpcUrl(COMPILOT_CHAINS.BASE_SEPOLIA);
const AVALANCHE_FUJI_PROVIDER_URL =
	process.env.AVALANCHE_FUJI_PROVIDER_URL ||
	getRpcUrl(COMPILOT_CHAINS.AVALANCHE_FUJI);
const ARBITRUM_SEPOLIA_PROVIDER_URL =
	process.env.ARBITRUM_SEPOLIA_PROVIDER_URL ||
	getRpcUrl(COMPILOT_CHAINS.ARBITRUM_SEPOLIA);

export const networks: NetworksUserConfig = {
	//mainnets
	polygon: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.POLYGON),
		url: `${POLYGON_MAINNET_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	base: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.BASE),
		url: `${BASE_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	mainnet: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.ETHEREUM),
		url: `${ETHEREUM_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	arbitrum: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.ARBITRUM),
		url: `${ARBITRUM_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	bsc: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.BNB),
		url: `${BNB_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	optimisticEthereum: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.OPTIMISM),
		url: `${OPTIMISM_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	avalanche: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.AVALANCHE),
		url: `${AVALANCHE_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	//testnets
	polygonAmoy: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.POLYGON_AMOY),
		url: `${AMOY_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	sepolia: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.SEPOLIA),
		url: SEPOLIA_PROVIDER_URL,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	baseSepolia: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.BASE_SEPOLIA),
		url: BASE_SEPOLIA_PROVIDER_URL,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	optimisticSepolia: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.OPTIMISM_SEPOLIA),
		url: OPTIMISM_SEPOLIA_PROVIDER_URL,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	avalancheFujiTestnet: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.AVALANCHE_FUJI),
		url: AVALANCHE_FUJI_PROVIDER_URL,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	bscTestnet: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.BNB_TESTNET),
		url: BNB_TESTNET_PROVIDER_URL,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	arbitrumSepolia: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.ARBITRUM_SEPOLIA),
		url: ARBITRUM_SEPOLIA_PROVIDER_URL,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	// testnets for local testing
	// because the api tx signer is different when we test locally
	polygonAmoy_local: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.POLYGON_AMOY),
		url: `${AMOY_PROVIDER_URL}`,
		accounts: { mnemonic: MAINNET_SIG_DEPLOYMENT_MNEMONIC },
	},
	sepolia_local: {
		live: true,
		chainId: Number(COMPILOT_CHAINS.SEPOLIA),
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
		// ComPilot Test address is set up with tokens to test the Pool
		accounts: { mnemonic: TEST_MNEMONIC },
	},
};
