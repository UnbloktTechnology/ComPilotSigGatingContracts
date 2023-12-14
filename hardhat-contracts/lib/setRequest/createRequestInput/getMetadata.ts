//TODO: metadata is important in order to allow the proof request to be embedded inside a QR code
// not required for now

// import { v4 as uuidv4 } from "uuid";

// import { Address } from "@nexeraprotocol/nexera-id-schemas";

// export const getMetadata = (requestId: number, verifierAddress: Address) => {
//   const uuid = uuidv4();
//   return {
//     id: uuid,
//     typ: "application/iden3comm-plain-json",
//     type: "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
//     thid: uuid,
//     body: {
//       reason: "airdrop participation",
//       transaction_data: {
//         contract_address: verifierAddress,
//         method_id: "b68967e2",
//         chain_id: 80001,
//         network: "polygon-mumbai",
//       },
//       scope: [
//         {
//           id: requestId,
//           circuitId: "credentialAtomicQuerySigV2OnChain",
//           query: {
//             allowedIssuers: ["*"],
//             //TODO
//             context: "schemaUrl",
//             credentialSubject: {
//                 //TODO
//               birthday: {
//                 //TODO
//                 $lt: "query.value[0]",
//               },
//             },
//             //TODO
//             type:'KYCAgeCredential',
//           },
//         },
//       ],
//     },
//   };
// };
