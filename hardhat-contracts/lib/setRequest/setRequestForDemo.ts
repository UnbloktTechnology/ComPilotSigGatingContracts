import { Operators } from "@0xpolygonid/js-sdk";
import { ethers } from "hardhat";

import { deploySigValidator } from "../deploy/deployValidatorsLib";
import { generateRequestData } from "./createRequestInput/generateRequestData";

export const getIDScanRequest = async () => {
  const schemaQueryParameters = {
    credentialType: "IDScan" as "IDScan",
    operator: Operators.GT,
    value: 18,
    fieldName: "age",
  };
  const requestData = await generateRequestData(
    schemaQueryParameters.credentialType,
    schemaQueryParameters.fieldName,
    schemaQueryParameters.value,
  );
  return {
    schema: requestData.schemaHash,
    claimPathKey: requestData.schemaClaimPathKey,
    operator: schemaQueryParameters.operator, // operator
    value: [requestData.formatedValue, ...new Array(63).fill(0).map((i) => 0)], // for operators 1-3 only first value matters
  };
};

export const getProofOfResidenceScanRequest = async () => {
  const schemaQueryParameters = {
    credentialType: "ProofOfResidence" as "ProofOfResidence",
    operator: Operators.NE,
    value: "USA",
    fieldName: "country",
  };
  const requestData = await generateRequestData(
    schemaQueryParameters.credentialType,
    schemaQueryParameters.fieldName,
    schemaQueryParameters.value,
  );
  return {
    schema: requestData.schemaHash,
    claimPathKey: requestData.schemaClaimPathKey,
    operator: schemaQueryParameters.operator, // operator
    value: [requestData.formatedValue, ...new Array(63).fill(0).map((i) => 0)], // for operators 1-3 only first value matters
  };
};

export async function setRequestForDemo(
  scenarioVerifierAddress: string,
): Promise<boolean> {
  const validatorAddress = await deploySigValidator();
  const CONTRACT_NAME = "ScenarioVerifier";
  let nexeraVerifierContract = await ethers.getContractAt(
    CONTRACT_NAME,
    scenarioVerifierAddress,
  );
  try {
    const idScanRequest = await getIDScanRequest();
    await nexeraVerifierContract.setNexeraZKPRequest(
      1,
      validatorAddress,
      idScanRequest.schema,
      idScanRequest.claimPathKey,
      idScanRequest.operator,
      idScanRequest.value,
    );
    console.log("Request set for IDScan");

    const proofOfResidenceRequest = await getProofOfResidenceScanRequest();
    await nexeraVerifierContract.setNexeraZKPRequest(
      2,
      validatorAddress,
      proofOfResidenceRequest.schema,
      proofOfResidenceRequest.claimPathKey,
      proofOfResidenceRequest.operator,
      proofOfResidenceRequest.value,
    );
    console.log("Request set for Proof Of Residence");

    return true;
  } catch (e) {
    console.log("error: ", e);
    return false;
  }
}
