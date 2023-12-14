import { deployNexeraVerifierEntrypoint } from "../lib/deploy/deployNexeraVerifierEntrypoint";

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployNexeraVerifierEntrypoint().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
