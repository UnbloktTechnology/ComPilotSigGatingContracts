import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinter } from "../typechain";
export async function fixtureExampleGatedNFTMinter() {
  const contractName = "ExampleGatedNFTMinter";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleGatedNFTMinter: contractInstance as ExampleGatedNFTMinter,
  };
}
