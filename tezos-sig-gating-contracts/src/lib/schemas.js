"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezosTxCalldata = exports.TezosTxAuthInput = exports.TezosTxAuthData = exports.TezosPublicKey = exports.EdSignature = exports.TezosEntrypointName = exports.TezosAddress = exports.TezosContractAddress = exports.TezosImplicitAddress = void 0;
const zod_1 = require("zod");
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
exports.TezosImplicitAddress = zod_1.z
    .string()
    .refine((value) => value.startsWith("tz1"), {
    message: "Tezos address (implicit account) must start with 'tz1'",
})
    // .transform((value) => value.toLowerCase() as `tz${string}`)
    .describe("Tezos address");
exports.TezosContractAddress = zod_1.z
    .string()
    .refine((value) => value.startsWith("KT1"), {
    message: "Tezos contract address must start with 'KT1'",
})
    // .transform((value) => value.toLowerCase() as `tz${string}`)
    .describe("Tezos address");
exports.TezosAddress = zod_1.z.union([
    exports.TezosImplicitAddress,
    exports.TezosContractAddress,
]);
exports.TezosEntrypointName = zod_1.z
    .string()
    .refine((value) => value.startsWith("%"), {
    message: "Tezos entrypoint name must start with '%'",
})
    // .transform((value) => value.toLowerCase() as `tz${string}`)
    .describe("Tezos entrypoint name");
exports.EdSignature = zod_1.z
    .string()
    .refine((value) => value.startsWith("edsig"), {
    message: "EdSignature must start with 'edsig'",
});
exports.TezosPublicKey = zod_1.z
    .string()
    .refine((value) => value.startsWith("edpk"), {
    message: "TezosPublicKey must start with 'edpk'",
});
// arbitrary length 0xstring
const String0x = zod_1.z.custom((val) => {
    return typeof val === "string" ? val.startsWith("0x") : false;
});
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
exports.TezosTxAuthData = zod_1.z.object({
    chainID: zod_1.z.string(),
    userAddress: exports.TezosAddress,
    nonce: zod_1.z.number(),
    blockExpiration: zod_1.z.number(),
    contractAddress: exports.TezosContractAddress,
    functionCallName: exports.TezosEntrypointName,
    functionCallArgs: zod_1.z.string(), //z.array(z.unknown()),
    signerPublicKey: exports.TezosPublicKey,
});
exports.TezosTxAuthInput = zod_1.z.object({
    chainID: zod_1.z.string(),
    contractAddress: exports.TezosContractAddress,
    functionName: exports.TezosEntrypointName,
    args: zod_1.z.string(), //z.array(z.unknown()),
    userAddress: exports.TezosAddress,
    blockExpiration: zod_1.z.number().int().optional(),
    nonce: zod_1.z.number().int().optional(),
});
// this is what is used in the contract call
exports.TezosTxCalldata = zod_1.z.object({
    userAddress: exports.TezosAddress,
    expirationBlock: zod_1.z.number(),
    contractAddress: exports.TezosContractAddress.optional(),
    functionName: exports.TezosEntrypointName.optional(),
    functionArgs: zod_1.z.string(), //z.array(z.unknown()),
    signerPublicKey: exports.TezosPublicKey,
    signature: exports.EdSignature,
});
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
