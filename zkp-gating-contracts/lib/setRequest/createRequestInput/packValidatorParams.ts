import { encodeAbiParameters } from "viem";

import { OnChainQueryRequest } from "./getSchemaExampleQuery";

export function packValidatorParams(
  query: OnChainQueryRequest,
  allowedIssuers = []
) {
  return encodeAbiParameters(
    [
      {
        name: "CredentialAtomicQuery",
        type: "tuple",
        components: [
          { name: "schema", type: "uint256" },
          { name: "claimPathKey", type: "uint256" },
          { name: "operator", type: "uint256" },
          { name: "slotIndex", type: "uint256" },
          { name: "value", type: "uint256[]" },
          { name: "queryHash", type: "uint256" },
          { name: "allowedIssuers", type: "uint256[]" },
          { name: "circuitIds", type: "string[]" },
          { name: "skipClaimRevocationCheck", type: "bool" },
          { name: "claimPathNotExists", type: "uint256" },
        ],
      },
    ],
    [
      {
        schema: BigInt(query.schema),
        claimPathKey: BigInt(query.claimPathKey),
        operator: BigInt(query.operator),
        slotIndex: BigInt(query.slotIndex),
        value: query.value.map((v) => BigInt(v)),
        queryHash: BigInt(query.queryHash),
        allowedIssuers: allowedIssuers,
        circuitIds: query.circuitIds,
        skipClaimRevocationCheck: query.skipClaimRevocationCheck,
        claimPathNotExists: BigInt(query.claimPathNotExists),
      },
    ]
  );
}
