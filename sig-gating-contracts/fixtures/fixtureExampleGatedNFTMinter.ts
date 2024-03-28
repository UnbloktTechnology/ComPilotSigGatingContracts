import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinter, NexeraIDSignerManager } from "../typechain";
export async function fixtureExampleGatedNFTMinter() {
  const contractName = "ExampleGatedNFTMinter";
  await deployments.fixture([contractName]);
  const contractInstance = await ethers.getContractAt(
    contractName,
    (
      await deployments.get(contractName)
    ).address
  );

  const nexeraIDSignerManager = await ethers.getContractAt(
    "NexeraIDSignerManager",
    (
      await deployments.get("NexeraIDSignerManager")
    ).address
  );

  return {
    exampleGatedNFTMinter: contractInstance as ExampleGatedNFTMinter,
    nexeraIDSignerManager: nexeraIDSignerManager as NexeraIDSignerManager,
  };
}
