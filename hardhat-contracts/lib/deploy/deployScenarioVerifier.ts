import { deployments, ethers } from "hardhat";

import { ScenarioVerifier, ScenarioVerifierFactory } from "../../typechain";

export async function deployScenarioVerifier(): Promise<ScenarioVerifier> {
  // get factory
  const scenarioVerifierFactoryAddress = (
    await deployments.get("ScenarioVerifierFactory")
  ).address;
  let scenarioVerifierFactory = (await ethers.getContractAt(
    "ScenarioVerifierFactory",
    scenarioVerifierFactoryAddress
  )) as ScenarioVerifierFactory;

  // deploy new verifier from factory
  const tx = await scenarioVerifierFactory.createScenarioVerifier();
  const transactionReceipt = await tx.wait();
  const scenarioVerifierAddress = transactionReceipt.events?.[0].args?.[0];

  // instantiate from address
  const scenarioVerifier = (await ethers.getContractAt(
    "ScenarioVerifier",
    scenarioVerifierAddress
  )) as ScenarioVerifier;
  return scenarioVerifier;
}
