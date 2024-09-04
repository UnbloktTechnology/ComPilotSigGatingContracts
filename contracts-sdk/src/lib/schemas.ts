import { z } from "zod";
import type {
  Account,
  Chain,
  Client,
  PublicActions,
  RpcSchema,
  Transport,
  WalletActions,
} from "viem";
import {
  arbitrum,
  arbitrumGoerli,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseGoerli,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  moonbeam,
  moonriver,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "viem/chains";

export enum NEXERA_CHAINS {
  ETHEREUM = "1",
  GOERLI = "5",
  ARBITRUM = "42161",
  ARBITRUM_GOERLI = "421613",
  ARBITRUM_SEPOLIA = "421614",
  BNB = "56",
  BNB_TESTNET = "97",
  OPTIMISM = "10",
  OPTIMISM_GOERLI = "420",
  OPTIMISM_SEPOLIA = "11155420",
  AVALANCHE = "43114",
  AVALANCHE_FUJI = "43113",
  POLYGON = "137",
  POLYGON_AMOY = "80002",
  SEPOLIA = "11155111",
  BASE = "8453",
  BASE_GOERLI = "84531",
  BASE_SEPOLIA = "84532",
  MOONBEAM = "1284",
  MOONRIVER = "1285",
}
export const ACTIVE_CHAIN_VALUES = [
  NEXERA_CHAINS.ETHEREUM,
  NEXERA_CHAINS.SEPOLIA,
  NEXERA_CHAINS.POLYGON,
  NEXERA_CHAINS.POLYGON_AMOY,
  NEXERA_CHAINS.AVALANCHE,
  NEXERA_CHAINS.AVALANCHE_FUJI,
  NEXERA_CHAINS.ARBITRUM,
  NEXERA_CHAINS.ARBITRUM_SEPOLIA,
  NEXERA_CHAINS.BASE,
  NEXERA_CHAINS.BASE_SEPOLIA,
  NEXERA_CHAINS.MOONBEAM,
  NEXERA_CHAINS.MOONRIVER,
  NEXERA_CHAINS.OPTIMISM,
  NEXERA_CHAINS.OPTIMISM_SEPOLIA,
  NEXERA_CHAINS.BNB,
  NEXERA_CHAINS.BNB_TESTNET,
] as const;

export const ChainId = z.preprocess(
  (val) => String(val),
  z
    .enum(ACTIVE_CHAIN_VALUES)
    .describe(
      "a numeric value that identifies the chain of the address. There are many sites that retrieve information on chainIDs such as <a href='https://chainlist.org/'>https://chainlist.org</a>."
    )
);

export type ChainId = z.infer<typeof ChainId>;

export const IdToChains = {
  [NEXERA_CHAINS.ETHEREUM]: mainnet,
  [NEXERA_CHAINS.SEPOLIA]: sepolia,
  [NEXERA_CHAINS.ARBITRUM]: arbitrum,
  [NEXERA_CHAINS.ARBITRUM_GOERLI]: arbitrumGoerli,
  [NEXERA_CHAINS.ARBITRUM_SEPOLIA]: arbitrumSepolia,
  [NEXERA_CHAINS.OPTIMISM]: optimism,
  [NEXERA_CHAINS.OPTIMISM_GOERLI]: optimismGoerli,
  [NEXERA_CHAINS.OPTIMISM_SEPOLIA]: optimismSepolia,
  [NEXERA_CHAINS.AVALANCHE]: avalanche,
  [NEXERA_CHAINS.AVALANCHE_FUJI]: avalancheFuji,
  [NEXERA_CHAINS.POLYGON]: polygon,
  [NEXERA_CHAINS.POLYGON_AMOY]: polygonAmoy,
  [NEXERA_CHAINS.BASE]: base,
  [NEXERA_CHAINS.BASE_GOERLI]: baseGoerli,
  [NEXERA_CHAINS.BASE_SEPOLIA]: baseSepolia,
  [NEXERA_CHAINS.BNB]: bsc,
  [NEXERA_CHAINS.BNB_TESTNET]: bscTestnet,
  [NEXERA_CHAINS.MOONBEAM]: moonbeam,
  [NEXERA_CHAINS.MOONRIVER]: moonriver,
} as Record<ChainId, Chain>;

export const isValidAddress = (address: string) => {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
};

export const AddressSchema = z
  .string()
  .refine((value) => isValidAddress(value))
  .transform((value) => value as `0x${string}`)
  .describe(
    "String value that identifies the address of a specific user. Normally tied to an EOA that includes the Smart Wallet."
  );

// arbitrary length 0xstring
const String0x = z.custom<`0x${string}`>((val) => {
  return typeof val === "string" ? val.startsWith("0x") : false;
});
type String0x = z.infer<typeof String0x>;
export const Signature = String0x;
export type Signature = String0x;

export const FunctionCallData = String0x;
export type FunctionCallData = String0x;

export type Address = z.infer<typeof AddressSchema>;

export type EvmPrivateKey = String0x;

export type CredentialType =
  | "AMLScreeningsResults"
  | "ProofOfResidence"
  | "SelfieImage"
  | "IDImage"
  | "IDInformation"
  | "ID3" // this is for backwards compatibility
  | "IDScan" // this is for backwards compatibility
  | "IDScanSelfie" // this is for backwards compatibility
  | "IDScanPassport"; // this is for backwards compatibility

export type Environment = "local" | "dev" | "stage" | "prod" | "branch";

export type WalletClientExtended = Client<
  Transport,
  Chain,
  Account,
  RpcSchema,
  PublicActions & WalletActions<Chain, Account>
>;

// Tx Auth Data SIgnature
export const TxAuthData = z.object({
  chainID: z.number(),
  nonce: z.number(),
  blockExpiration: z.number(),
  contractAddress: AddressSchema,
  userAddress: AddressSchema,
  functionCallData: FunctionCallData,
});
export type TxAuthData = z.infer<typeof TxAuthData>;

export const TxAuthInput = z.object({
  contractAbi: z.array(z.record(z.unknown())),
  contractAddress: AddressSchema,
  functionName: z.string(),
  args: z.array(z.unknown()),
  userAddress: AddressSchema,
  // these optional inputs can be useful for local dev for example
  blockExpiration: z.number().int().optional(),
  chainID: z.number().optional(),
  nonce: z.number().optional(),
});
export type TxAuthInput = z.infer<typeof TxAuthInput>;
