import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinterV0 } from "../typechain";
export async function fixtureExampleGatedNFTMinterV0() {
  const contractName = "ExampleGatedNFTMinterV0";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleGatedNFTMinter: contractInstance as ExampleGatedNFTMinterV0,
  };
}
