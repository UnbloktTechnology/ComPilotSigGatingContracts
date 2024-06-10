import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTFacet } from "../typechain";
export async function fixtureExampleDiamond() {
  const contractName = "ExampleDiamond";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    "ExampleGatedNFTFacet",
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleGatedNFTDiamond: contractInstance as ExampleGatedNFTFacet,
  };
}
