import { deployments, ethers } from "hardhat";

import { ExampleMultipleInputs } from "../typechain";
export async function fixtureExampleMultipleInputs() {
  const contractName = "ExampleMultipleInputs";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleMultipleInputs: contractInstance as ExampleMultipleInputs,
  };
}
