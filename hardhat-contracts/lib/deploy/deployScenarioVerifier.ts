import { ethers } from "hardhat";

import { ScenarioVerifier, ScenarioVerifier__factory } from "../../types";

export async function deployScenarioVerifier(): Promise<ScenarioVerifier> {
  const verifierContract = "ScenarioVerifier";

  const ScenarioVerifierFactory: ScenarioVerifier__factory =
    await ethers.getContractFactory(verifierContract);
  const scenarioVerifier: ScenarioVerifier =
    await ScenarioVerifierFactory.deploy();

  console.log("ScenarioVerifier contract address:", scenarioVerifier.address);
  return scenarioVerifier;
}
