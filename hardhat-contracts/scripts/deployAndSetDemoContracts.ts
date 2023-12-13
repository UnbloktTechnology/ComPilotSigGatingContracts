import { Address } from "@nexeraprotocol/nexera-id-schemas";

import { deployProxyAavePool } from "../lib/deploy/deployProxyAavePool";
import { deployScenarioVerifier } from "../lib/deploy/deployScenarioVerifier";
import { setRequestForDemo } from "../lib/setRequest/setRequestForDemo";
import { ScenarioVerifier } from "../types";

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployScenarioVerifier()
  .then(async (ScenarioVerifier: ScenarioVerifier) => {
    deployProxyAavePool(ScenarioVerifier.address as Address).then(() => {
      setRequestForDemo(ScenarioVerifier.address);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
