import { deployments, ethers } from "hardhat";

import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";

export async function fixtureScenarioVerifier() {
  const contractName = "ScenarioVerifierFactory";
  await deployments.fixture([
    contractName,
    "CredentialAtomicQuerySigValidator",
  ]);
  const scenarioVerifier = await deployScenarioVerifier();

  return {
    scenarioVerifier: scenarioVerifier,
    validatorAddress: (
      await deployments.get("CredentialAtomicQuerySigValidator")
    ).address as Address,
  };
}
