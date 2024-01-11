import { deployments, ethers } from "hardhat";

import {
  NexeraVerifierEntrypoint,
  VerifierEntrypointFactory,
} from "../../typechain";

export async function deployVerifierEntrypoint(): Promise<NexeraVerifierEntrypoint> {
  // get factory
  const scenarioVerifierFactoryAddress = (
    await deployments.get("VerifierEntrypointFactory")
  ).address;
  let scenarioVerifierFactory = (await ethers.getContractAt(
    "VerifierEntrypointFactory",
    scenarioVerifierFactoryAddress
  )) as VerifierEntrypointFactory;

  // deploy new verifier from factory
  const tx = await scenarioVerifierFactory.createVerifierEntrypoint();
  const transactionReceipt = await tx.wait();
  const scenarioVerifierAddress = transactionReceipt.events?.[0].args?.[0];

  // instantiate from address
  const scenarioVerifier = (await ethers.getContractAt(
    "NexeraVerifierEntrypoint",
    scenarioVerifierAddress
  )) as NexeraVerifierEntrypoint;
  return scenarioVerifier;
}
