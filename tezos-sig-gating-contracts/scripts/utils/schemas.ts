import { z } from "zod";
// import type {
//   Account,
//   Chain,
//   Client,
//   PublicActions,
//   RpcSchema,
//   Transport,
//   WalletActions,
// } from "viem";

// export enum NEXERA_CHAINS {
//   ETHEREUM = "1",
//   GOERLI = "5",
//   POLYGON = "137",
//   AMOY = "80002",
//   AVALANCHE = "43114",
//   FUJI = "43113",
//   ARBITRUM = "42161",
//   ARBITRUM_GOERLI = "421613",
// }
// export const isValidAddress = (address: string) => {
//   const regex = /^0x[a-fA-F0-9]{40}$/;
//   return regex.test(address);
// };

// export const AddressSchema = z
//   .string()
//   .refine((value) => isValidAddress(value))
//   .transform((value) => value.toLowerCase() as `0x${string}`)
//   .describe(
//     "String value that identifies the address of a specific user. Normally tied to an EOA that includes the Smart Wallet."
//   );

/**
 * Tezos
 */
export const TezosImplicitAddress = z
  .string()
  .refine((value) => value.startsWith("tz1"), {
    message: "Tezos address (implicit account) must start with 'tz1'",
  })
  // .transform((value) => value.toLowerCase() as `tz${string}`)
  .describe("Tezos address");
export type TezosImplicitAddress = z.infer<typeof TezosImplicitAddress>;

export const TezosContractAddress = z
  .string()
  .refine((value) => value.startsWith("KT1"), {
    message: "Tezos contract address must start with 'KT1'",
  })
  // .transform((value) => value.toLowerCase() as `tz${string}`)
  .describe("Tezos address");
export type TezosContractAddress = z.infer<typeof TezosContractAddress>;

export const TezosAddress = z.union([
  TezosImplicitAddress,
  TezosContractAddress,
]);
export type TezosAddress = z.infer<typeof TezosAddress>;

export const TezosEntrypointName = z
  .string()
  .refine((value) => value.startsWith("%"), {
    message: "Tezos entrypoint name must start with '%'",
  })
  // .transform((value) => value.toLowerCase() as `tz${string}`)
  .describe("Tezos entrypoint name");
export type TezosEntrypointName = z.infer<typeof TezosEntrypointName>;

export const EdSignature = z
  .string()
  .refine((value) => value.startsWith("edsig"), {
    message: "EdSignature must start with 'edsig'",
  });
export type EdSignature = z.infer<typeof EdSignature>;

export const TezosPublicKey = z
  .string()
  .refine((value) => value.startsWith("edpk"), {
    message: "TezosPublicKey must start with 'edpk'",
  });
export type TezosPublicKey = z.infer<typeof TezosPublicKey>;

// arbitrary length 0xstring
const String0x = z.custom<`0x${string}`>((val) => {
  return typeof val === "string" ? val.startsWith("0x") : false;
});
type String0x = z.infer<typeof String0x>;

// export const Signature = String0x;
// export type Signature = String0x;

// export const FunctionCallData = String0x;
// export type FunctionCallData = String0x;

// export type Address = z.infer<typeof AddressSchema>;

// export type CredentialType =
//   | "AMLScreeningsResults"
//   | "ProofOfResidence"
//   | "SelfieImage"
//   | "IDImage"
//   | "IDInformation"
//   | "ID3" // this is for backwards compatibility
//   | "IDScan" // this is for backwards compatibility
//   | "IDScanSelfie" // this is for backwards compatibility
//   | "IDScanPassport"; // this is for backwards compatibility

// export type Environment = "local" | "dev" | "stage" | "prod" | "branch";

// export type WalletClientExtended = Client<
//   Transport,
//   Chain,
//   Account,
//   RpcSchema,
//   PublicActions & WalletActions<Chain, Account>
// >;

// Tx Auth Data SIgnature
// This is the info that is signed by Nexera ID's Back end
export const TezosTxAuthData = z.object({
  chainID: z.string(),
  userAddress: TezosAddress,
  nonce: z.number(),
  blockExpiration: z.number(),
  contractAddress: TezosContractAddress,
  functionCallName: TezosEntrypointName,
  functionCallArgs: z.string(), //z.array(z.unknown()),
  signerPublicKey: TezosPublicKey,
});
export type TezosTxAuthData = z.infer<typeof TezosTxAuthData>;

export const TezosTxAuthInput = z.object({
  chainID: z.string(),
  contractAddress: TezosContractAddress,
  functionName: TezosEntrypointName,
  args: z.string(), //z.array(z.unknown()),
  userAddress: TezosAddress,
  blockExpiration: z.number().int().optional(),
  nonce: z.number().int().optional(),
});
export type TezosTxAuthInput = z.infer<typeof TezosTxAuthInput>;

// this is what is used in the contract call
export const TezosTxCalldata = z.object({
  userAddress: TezosAddress,
  expiration: z.number(),
  contractAddress: TezosContractAddress.optional(),
  name: TezosEntrypointName,
  args: z.string(), //z.array(z.unknown()),
  publicKey: TezosPublicKey,
  signature: EdSignature,
});
export type TezosTxCalldata = z.infer<typeof TezosTxCalldata>;

// export const TxAuthInput = z.object({
//   contractAbi: z.array(z.record(z.unknown())),
//   contractAddress: AddressSchema,
//   functionName: z.string(),
//   args: z.array(z.unknown()),
//   userAddress: AddressSchema,
//   // these optional inputs can be useful for local dev for example
//   blockExpiration: z.number().int().optional(),
//   chainID: z.number().optional(),
//   nonce: z.number().optional(),
// });
// export type TxAuthInput = z.infer<typeof TxAuthInput>;
