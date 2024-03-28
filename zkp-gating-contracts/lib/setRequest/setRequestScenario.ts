import { ethers } from "hardhat";

import { getSchemaExampleQuery } from "./createRequestInput/getSchemaExampleQuery";
import { CredentialType } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";

export async function setRequestForScenario(
  requestId: number,
  scenarioVerifierAddress: string,
  validatorAddress: string,
  credentialType: CredentialType
): Promise<boolean> {
  const queryData = await getSchemaExampleQuery(credentialType, requestId);

  let scenarioVerifier = await ethers.getContractAt(
    "ScenarioVerifier",
    scenarioVerifierAddress
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
