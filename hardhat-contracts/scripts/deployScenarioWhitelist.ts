import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployScenarioVerifier().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
