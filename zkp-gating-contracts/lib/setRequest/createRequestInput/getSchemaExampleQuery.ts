import { CredentialType } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { calculateQueryHash } from "./calculateQueryHash";
import { generateRequestData } from "./generateRequestData";
import { packValidatorParams } from "./packValidatorParams";

const Operators = {
  NOOP: 0, // No operation, skip query verification in circuit
  EQ: 1, // equal
  LT: 2, // less than
  GT: 3, // greater than
  IN: 4, // in
  NIN: 5, // not in
  NE: 6, // not equal
};
export type OnChainQueryRequest = {
  requestId: number;
  schema: string;
  claimPathKey: string;
  operator: number; // operator
  slotIndex: number;
  value: (string | number | bigint)[]; // for operators 1-3 only first value matters
  circuitIds: string[];
  skipClaimRevocationCheck: boolean;
  claimPathNotExists: number;
  queryHash: string;
};
export const getSchemaExampleQueryParameters = (
  credentialType: CredentialType
) => {
  switch (credentialType) {
    case "IDScan":
      return {
        operator: Operators.GT, // operator
        value: 18, // for operators 1-3 only first value matters
        fieldName: "age",
      };
    case "IDInformation":
      return {
        operator: Operators.GT, // operator
        value: 18, // for operators 1-3 only first value matters
        fieldName: "personalData.age",
      };
    case "IDScanSelfie":
      return {
        operator: Operators.EQ, // operator
        value: "Antoine",
        fieldName: "name",
      };
    case "IDScanPassport":
      return {
        operator: Operators.EQ, // operator
        value: "Antoine",
        fieldName: "name",
      };
    case "ProofOfResidence":
      return {
        operator: Operators.NE, // operator
        value: "USA",
        fieldName: "country",
      };
    case "ID3":
      return {
        operator: Operators.EQ, // operator
        value: "John",
        fieldName: "personalDetails.firstName",
      };
    default:
      console.log(
        "Credential Type doesn't have schema info, defaulting to KYCAgeCredential"
      );
      return {
        operator: Operators.LT, // operator
        value: 20020101, // for operators 1-3 only first value matters
        fieldName: "birthday",
      };
  }
};

export const getSchemaExampleQuery = async (
  credentialType: CredentialType,
  requestId: number
) => {
  const schemaExampleQueryParameters =
    getSchemaExampleQueryParameters(credentialType);
  const requestData = await generateRequestData(
    credentialType,
    schemaExampleQueryParameters.fieldName,
    schemaExampleQueryParameters.value
  );
  const query: OnChainQueryRequest = {
    requestId,
    schema: requestData.schemaHash,
    claimPathKey: requestData.schemaClaimPathKey,
    operator: schemaExampleQueryParameters.operator, // operator
    slotIndex: 0,
    value: [requestData.formatedValue, ...new Array(63).fill(0).map((i) => 0)], // for operators 1-3 only first value matters
    circuitIds: ["credentialAtomicQuerySigV2OnChain"],
    skipClaimRevocationCheck: false,
    claimPathNotExists: 0,
    queryHash: "",
  };
  query.queryHash = calculateQueryHash(
    query.value,
    query.schema,
    query.slotIndex,
    query.operator,
    query.claimPathKey,
    query.claimPathNotExists
  ).toString();

  return packValidatorParams(query);
};
