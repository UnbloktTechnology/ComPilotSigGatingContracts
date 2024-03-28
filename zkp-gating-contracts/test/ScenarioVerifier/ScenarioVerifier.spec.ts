import { expect } from "chai";

import { get2ZKPsForUserWhitelist } from "../utils/get2ZKPsForUserWhitelist";
import { ScenarioVerifier } from "../../typechain";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { fixtureScenarioVerifier } from "../../fixtures/fixtureScenarioVerifier";
import { getSchemaExampleQuery } from "../../lib/setRequest/createRequestInput/getSchemaExampleQuery";
import { setupScenario2Rules } from "../utils/setupScenario2Rules";
import { prepareInputs } from "../utils/prepareInputs";
import { setupThreeAccounts } from "../utils/fundAccounts";
export const SIMPLE_TSF_COST = 21000n;
const testDID =
  "did:polygonid:polygon:mumbai:2qPXXXnx37MVkfP44amJWcvcxGpLPSh7fUW6cyTDPt";

describe(`ScenarioVerifier: ProofOfResidence and IDScan`, function () {
  let scenarioVerifier: ScenarioVerifier;
  let validatorAddress: Address;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ scenarioVerifier, validatorAddress } = await fixtureScenarioVerifier());
  });

  it(`Should set requests for ProofOfResidence and IDScan`, async () => {
    // Get queries
    const queryProofOfResidence = await getSchemaExampleQuery(
      "ProofOfResidence",
      1
    );
    const queryIDScan = await getSchemaExampleQuery("IDScan", 2);

    // Set Request for Rule 1: ProofOfResidence
    await expect(
      scenarioVerifier.setNexeraZKPRequest(1, {
        metadata: "",
        validator: validatorAddress,
        data: queryProofOfResidence,
      })
    )
      .to.emit(scenarioVerifier, "ZKPRequestSet")
      .withArgs(1, queryProofOfResidence, validatorAddress, "")
      .to.emit(scenarioVerifier, "RequestRegistered")
      .withArgs(1);

    // Set Request for Rule 2: IDScan

    // Check for the first event
    await expect(
      scenarioVerifier.setNexeraZKPRequest(2, {
        metadata: "",
        validator: validatorAddress,
        data: queryIDScan,
      })
    )
      .to.emit(scenarioVerifier, "ZKPRequestSet")
      .withArgs(2, queryIDScan, validatorAddress, "")
      .to.emit(scenarioVerifier, "RequestRegistered")
      .withArgs(2);
  });

  it(`Should post zk proof for ProofOfResidence and IDScan`, async () => {
    // Set up Scenrario with 2 Rules
    await setupScenario2Rules(scenarioVerifier, validatorAddress);

    // Create Proof for ProofOfResidence and for IDScan
    const { zkpProofOfResidence, zkpIDScan, address } =
      await get2ZKPsForUserWhitelist();
    const zkpIDScanFormated = prepareInputs(zkpIDScan.proof);
    const zkpProofOfResidenceFormated = prepareInputs(
      zkpProofOfResidence.proof
    );

    // Check address is not previously whitelisted
    const isAllowedForScenarioBefore =
      await scenarioVerifier.isAllowedForScenario(address);
    expect(isAllowedForScenarioBefore).to.be.false;

    // submit proof
    await expect(
      scenarioVerifier.submitZKPResponse(
        zkpProofOfResidence.proof.id.toString(),
        zkpProofOfResidenceFormated.inputs,
        zkpProofOfResidenceFormated.pi_a,
        zkpProofOfResidenceFormated.pi_b,
        zkpProofOfResidenceFormated.pi_c
      )
    )
      .to.emit(scenarioVerifier, "AddressIdConnection")
      .withArgs(address, testDID)
      .to.emit(scenarioVerifier, "UserAllowedForRequest")
      .withArgs(address, zkpProofOfResidence.proof.id);

    // test that user is whitelisted for rule 1 but not scenario
    const isAllowedForScenarioNow = await scenarioVerifier.isAllowedForScenario(
      address
    );
    expect(isAllowedForScenarioNow).to.be.false;
    const ruleWhitelist1 = await scenarioVerifier.queryRequestWhitelist(
      1,
      address
    );
    expect(ruleWhitelist1).to.be.true;

    // Whitelisting user should not succeed before rule 2 is whitelisted
    await expect(scenarioVerifier.finalizeAllowListScenario(address))
      .to.emit(scenarioVerifier, "UserAllowedForScenario")
      .withArgs(address);
    const isAllowedForScenarioBeforeRule2 =
      await scenarioVerifier.isAllowedForScenario(address);
    expect(isAllowedForScenarioBeforeRule2).to.be.false;

    // submit proof for IDScan
    const respIDScan = await scenarioVerifier.submitZKPResponse(
      zkpIDScan.proof.id.toString(),
      zkpIDScanFormated.inputs,
      zkpIDScanFormated.pi_a,
      zkpIDScanFormated.pi_b,
      zkpIDScanFormated.pi_c
    );
    const rcpIDScan = await respIDScan.wait();
    console.log(
      `IDScan gas used : ${rcpIDScan?.gasUsed}, which is ${
        rcpIDScan && Number(rcpIDScan.gasUsed) / Number(SIMPLE_TSF_COST)
      } times the cost of a simple tsf`
    );

    // test that user is whitelisted for rule 1 and rule 2 but not scenario
    const isAllowedForScenarioNow2 =
      await scenarioVerifier.isAllowedForScenario(address);
    expect(isAllowedForScenarioNow2).to.be.false;
    const ruleWhitelist2 = await scenarioVerifier.queryRequestWhitelist(
      2,
      address
    );
    expect(ruleWhitelist2).to.be.true;

    // Whitelist user, now that both rules are confirmed
    await scenarioVerifier.finalizeAllowListScenario(address);
    const isAllowedForScenarioAfter =
      await scenarioVerifier.isAllowedForScenario(address);
    expect(isAllowedForScenarioAfter).to.be.true;
  });
  it(`Should post zk proof for ProofOfResidence and IDScan using allowUserForScenario (one call)`, async () => {
    // Set up Scenrario with 2 Rules
    await setupScenario2Rules(scenarioVerifier, validatorAddress);

    // get the two ZKPs
    const { zkpIDScanOnChain, zkpProofOfResidenceOnChain, address } =
      await get2ZKPsForUserWhitelist();

    // Check that user is not whitelisted before
    const isAllowedForScenarioBefore =
      await scenarioVerifier.isAllowedForScenario(address);
    expect(isAllowedForScenarioBefore).to.be.false;

    // use allowUserForScenario one call
    await expect(
      scenarioVerifier.allowUserForScenario([
        zkpProofOfResidenceOnChain,
        zkpIDScanOnChain,
      ])
    ).to.emit(scenarioVerifier, "SubmitedAllZKPsForUser");

    // Check that user is whitelisted
    const isAllowedForScenarioAfter =
      await scenarioVerifier.isAllowedForScenario(address);
    expect(isAllowedForScenarioAfter).to.be.true;
  });
});
