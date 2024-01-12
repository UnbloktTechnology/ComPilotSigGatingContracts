import { deployments, ethers } from "hardhat";

import { NexeraVerifierEntrypoint, ScenarioVerifier } from "../../types";
import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";
import { deployVerifierEntrypoint } from "../lib/deploy/deployVerifierEntrypoint";

export async function fixtureNexeraVerifierEntrypoint() {
  const contractName = "VerifierEntrypointFactory";
  await deployments.fixture([
    contractName,
    "ScenarioVerifierFactory",
    "CredentialAtomicQuerySigValidator",
  ]);
  const contractInstance = await deployVerifierEntrypoint();
  const scenarioVerifier = await deployScenarioVerifier();

  return {
    nexeraVerifierEntrypoint: contractInstance as NexeraVerifierEntrypoint,
    scenarioVerifier: scenarioVerifier as ScenarioVerifier,
    validatorAddress: (
      await deployments.get("CredentialAtomicQuerySigValidator")
    ).address as Address,
  };
}
