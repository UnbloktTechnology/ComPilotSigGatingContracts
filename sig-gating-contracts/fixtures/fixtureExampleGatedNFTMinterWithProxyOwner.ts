import { deployments, ethers } from "hardhat";

import {
  ExampleGatedNFTMinter,
  NexeraIDSignerManager,
  SignerManagerProxyOwner,
} from "../typechain";
export async function fixtureExampleGatedNFTMinterWithProxyOwner() {
  const contractName = "ExampleGatedNFTMinter";
  await deployments.fixture([contractName, "SignerManagerProxyOwner"]);
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
  const signerManagerProxyOwner = await ethers.getContractAt(
    "SignerManagerProxyOwner",
    (
      await deployments.get("SignerManagerProxyOwner")
    ).address
  );

  return {
    exampleGatedNFTMinter: contractInstance as ExampleGatedNFTMinter,
    nexeraIDSignerManager: nexeraIDSignerManager as NexeraIDSignerManager,
    signerManagerProxyOwner: signerManagerProxyOwner as SignerManagerProxyOwner,
  };
}
