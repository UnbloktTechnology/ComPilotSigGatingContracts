import { deployments, ethers } from "hardhat";

import { ExampleNFTMinter } from "../typechain";
export async function fixtureExampleNFTMinter() {
  const contractName = "ExampleNFTMinter";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleNFTMinter: contractInstance as ExampleNFTMinter,
  };
}
