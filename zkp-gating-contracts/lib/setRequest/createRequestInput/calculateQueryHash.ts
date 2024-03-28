import { prepareCircuitArrayValues } from "@0xpolygonid/js-sdk";
import { poseidon } from "@iden3/js-crypto";
import { SchemaHash } from "@iden3/js-iden3-core";

function coreSchemaFromStr(schemaIntString: string) {
  const schemaInt = BigInt(schemaIntString);
  return SchemaHash.newSchemaHashFromInt(schemaInt);
}

export function calculateQueryHash(
  values: (bigint | number | string)[],
  schema: string,
  slotIndex: number,
  operator: number,
  claimPathKey: string,
  claimPathNotExists: number
) {
  const expValue = prepareCircuitArrayValues(
    values.map((v) => BigInt(v)),
    64
  );
  const valueHash = poseidon.spongeHashX(expValue, 6);
  const schemaHash = coreSchemaFromStr(schema);
  const quaryHash = poseidon.hash([
    schemaHash.bigInt(),
    BigInt(slotIndex),
    BigInt(operator),
    BigInt(claimPathKey),
    BigInt(claimPathNotExists),
    valueHash,
  ]);
  return quaryHash;
}
