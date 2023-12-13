import { ethers } from "hardhat";

import {
  NexeraVerifierEntrypoint,
  NexeraVerifierEntrypoint__factory,
} from "../../types";

export async function deployNexeraVerifierEntrypoint(): Promise<NexeraVerifierEntrypoint> {
  const NexeraVerifierEntrypointFactory: NexeraVerifierEntrypoint__factory =
    await ethers.getContractFactory("NexeraVerifierEntrypoint");
  const nexeraVerifierEntrypoint: NexeraVerifierEntrypoint =
    await NexeraVerifierEntrypointFactory.deploy();

  console.log(
    "NexeraVerifierEntrypoint contract address:",
    nexeraVerifierEntrypoint.address,
  );
  return nexeraVerifierEntrypoint;
}
