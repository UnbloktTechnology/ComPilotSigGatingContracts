import { ethers } from "hardhat";

import { CredentialType } from "@nexeraprotocol/nexera-id-schemas";

import { getSchemaExampleQuery } from "./createRequestInput/getSchemaExampleQuery";

export async function setRequestForScenario(
  requestId: number,
  scenarioVerifierAddress: string,
  validatorAddress: string,
  credentialType: CredentialType,
): Promise<boolean> {
  const queryData = await getSchemaExampleQuery(credentialType, requestId);

  let scenarioVerifier = await ethers.getContractAt(
    "ScenarioVerifier",
    scenarioVerifierAddress,
  );

  try {
    await scenarioVerifier.setNexeraZKPRequest(requestId, {
      metadata: "",
      validator: validatorAddress,
      data: queryData,
    });
    return true;
  } catch (e) {
    console.log("error: ", e);
    return false;
  }
}
