import { ethers, getNamedAccounts } from "hardhat";
export const deployExampleGatedNFTMinterWithEOA = async () => {
  // Get the ContractFactory and Signers here
  const [deployer] = await ethers.getSigners();
  const { txAuthSigner } = await getNamedAccounts();

  console.log("Deploying contract with the account:", deployer.address);

  // Make sure to replace 'ExampleGatedNFTMinter' with the actual contract name
  const ExampleGatedNFTMinter = await ethers.getContractFactory(
    "ExampleGatedNFTMinter"
  );

  // Deploy the contract
  const exampleGatedNFTMinter = await ExampleGatedNFTMinter.deploy(
    txAuthSigner
  );

  await exampleGatedNFTMinter.deployed();

  console.log(
    "ExampleGatedNFTMinter deployed to:",
    exampleGatedNFTMinter.address
  );

  // The contract instance is now available
  return exampleGatedNFTMinter;
};
