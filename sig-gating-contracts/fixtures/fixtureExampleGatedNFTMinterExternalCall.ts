import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinterExternalCall } from "../typechain";
export async function fixtureExampleGatedNFTMinterExternalCall() {
  const contractName = "ExampleGatedNFTMinterExternalCall";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleGatedNFTMinterExternalCall:
      contractInstance as ExampleGatedNFTMinterExternalCall,
  };
}
