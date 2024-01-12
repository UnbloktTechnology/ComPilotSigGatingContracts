import { deployments, ethers } from "hardhat";

import {
  NexeraVerifierEntrypoint,
  ProxyAavePool,
  ScenarioVerifier,
} from "../typechain";
import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";
import { deployVerifierEntrypoint } from "../lib/deploy/deployVerifierEntrypoint";
import { Address } from "../lib/schemas";

export async function fixtureProxyAavePool() {
  const contractName = "ProxyAavePool";
  await deployments.fixture([
    contractName,
    "ScenarioVerifierFactory",
    "CredentialAtomicQuerySigValidator",
  ]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );
  const nexeraVerifierEntrypoint = await deployVerifierEntrypoint();
  const scenarioVerifier = await deployScenarioVerifier();

  return {
    proxyAavePool: contractInstance as ProxyAavePool,
    nexeraVerifierEntrypoint:
      nexeraVerifierEntrypoint as NexeraVerifierEntrypoint,
    scenarioVerifier: scenarioVerifier as ScenarioVerifier,
    validatorAddress: (
      await deployments.get("CredentialAtomicQuerySigValidator")
    ).address as Address,
  };
}
