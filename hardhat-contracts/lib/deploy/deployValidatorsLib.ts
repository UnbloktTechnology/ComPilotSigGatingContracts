import { ethers, upgrades } from "hardhat";

export async function deploySigValidator() {
  //const stateAddress = "0x624ce98D2d27b20b8f8d521723Df8fC4db71D79D"; // current iden3 state smart contract on main
  const stateAddress = "0x134b1be34911e39a8397ec6289782989729807a4"; // current iden3 state smart contract on mumbai

  const verifierContractWrapperName = "VerifierSigWrapper";
  const validatorContractName = "CredentialAtomicQuerySigValidator";
  const VerifierSigWrapper = await ethers.getContractFactory(
    verifierContractWrapperName,
  );
  const verifierWrapper = await VerifierSigWrapper.deploy();

  await verifierWrapper.deployed();
  console.log(
    verifierContractWrapperName,
    " deployed to:",
    verifierWrapper.address,
  );

  const credentialAtomicQueryValidatorFactory = await ethers.getContractFactory(
    validatorContractName,
  );

  const credentialAtomicQueryValidatorProxy = await upgrades.deployProxy(
    credentialAtomicQueryValidatorFactory,
    [verifierWrapper.address, stateAddress], // current state address on mumbai
  );

  await credentialAtomicQueryValidatorProxy.deployed();
  console.log(
    validatorContractName,
    " deployed to:",
    credentialAtomicQueryValidatorProxy.address,
  );

  return credentialAtomicQueryValidatorProxy.address;
}
