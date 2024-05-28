import { ethers, getNamedAccounts } from "hardhat";

// deployExampleGatedNFTMinterWithEOA.
export const deployExampleGatedNFTMinterWithEOA = async () => {
  // Get the ContractFactory and Signers here
  const { txAuthSignerAddress, deployer } = await getNamedAccounts();

  console.log("Deploying contract with the account:", deployer);

  // Make sure to replace 'ExampleGatedNFTMinter' with the actual contract name
  const ExampleGatedNFTMinter = await ethers.getContractFactory(
    "ExampleGatedNFTMinter"
  );

  // Deploy the contract
  const exampleGatedNFTMinter = await ExampleGatedNFTMinter.deploy(
    txAuthSignerAddress
  );

  await exampleGatedNFTMinter.deployed();

  console.log(
    "ExampleGatedNFTMinter deployed to:",
    exampleGatedNFTMinter.address
  );

  // The contract instance is now available
  return exampleGatedNFTMinter;
};
