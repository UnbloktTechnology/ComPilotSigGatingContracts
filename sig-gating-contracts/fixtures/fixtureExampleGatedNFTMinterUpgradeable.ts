import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinterUpgradeable } from "../typechain";
export async function fixtureExampleGatedNFTMinterUpgradeable() {
  const contractName = "ExampleGatedNFTMinterUpgradeable";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  return {
    exampleGatedNFTMinterUpgradeable:
      contractInstance as ExampleGatedNFTMinterUpgradeable,
  };
}
