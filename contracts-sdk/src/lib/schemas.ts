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

export const isValidAddress = (address: string) => {
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
};

export const AddressSchema = z
  .string()
  .refine((value) => isValidAddress(value))
  .transform((value) => value.toLowerCase() as `0x${string}`)
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

// Tx Auth Data
// This is the info that is signed by Nexera ID's Back end
export const TxAuthData = z.object({
  chainID: z.number(),
  nonce: z.number(),
  blockExpiration: z.number(),
  contractAddress: AddressSchema,
  userAddress: AddressSchema,
  functionCallData: FunctionCallData,
});
export type TxAuthData = z.infer<typeof TxAuthData>;

// This is the info the user needs to send to the api to get a signature
export const TxAuthInput = z.object({
  contractAbi: z.array(z.record(z.unknown())),
  contractAddress: AddressSchema,
  functionName: z.string(),
  args: z.array(z.unknown()),
  userAddress: AddressSchema,
  chainID: z.number(),
  // these optional inputs can be useful for local dev for example
  blockExpiration: z.number().int().optional(),
  nonce: z.number().optional(),
});
export type TxAuthInput = z.infer<typeof TxAuthInput>;
