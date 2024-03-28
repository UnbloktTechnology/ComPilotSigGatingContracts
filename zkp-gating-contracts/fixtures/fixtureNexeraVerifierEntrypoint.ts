import { deployments } from "hardhat";

import { NexeraVerifierEntrypoint, ScenarioVerifier } from "../typechain";
import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";
import { deployVerifierEntrypoint } from "../lib/deploy/deployVerifierEntrypoint";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";

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
