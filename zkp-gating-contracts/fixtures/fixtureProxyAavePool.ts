import { deployments, ethers } from "hardhat";

import {
  NexeraVerifierEntrypoint,
  ProxyAavePool,
  ScenarioVerifier,
} from "../typechain";
import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";
import { deployVerifierEntrypoint } from "../lib/deploy/deployVerifierEntrypoint";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";

export async function fixtureProxyAavePool() {
  const contractName = "ProxyAavePool";
  await deployments.fixture([
    contractName,
    "ScenarioVerifierFactory",
    "CredentialAtomicQuerySigV2Validator",
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
      await deployments.get("CredentialAtomicQuerySigV2Validator")
    ).address as Address,
  };
}
