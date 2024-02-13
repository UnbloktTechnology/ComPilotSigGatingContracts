import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { setRequestForScenario } from "../../lib/setRequest/setRequestScenario";
import { ScenarioVerifier } from "../../typechain";

export const setupScenario2Rules = async (
  scenarioVerifier: ScenarioVerifier,
  validatorAddress: Address
) => {
  // Set Request for Rule 1: ProofOfResidence
  await setRequestForScenario(
    1,
    scenarioVerifier.address,
    validatorAddress,
    "ProofOfResidence"
  );
  // Set Request for Rule 2: IDScan
  await setRequestForScenario(
    2,
    scenarioVerifier.address,
    validatorAddress,
    "IDScan"
  );
};
