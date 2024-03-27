import { expect } from "chai";
import { ethers } from "hardhat";

import { NexeraVerifierEntrypoint, ScenarioVerifier } from "../../typechain";
import { fixtureNexeraVerifierEntrypoint } from "../../fixtures/fixtureNexeraVerifierEntrypoint";
import { deployScenarioVerifier } from "../../lib/deploy/deployScenarioVerifier";
import { setupScenario2Rules } from "../utils/setupScenario2Rules";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { get2ZKPsForUserWhitelist } from "../utils/get2ZKPsForUserWhitelist";
import { setupThreeAccounts } from "../utils/fundAccounts";

describe(`NexeraVerifierEntrypoint: test two scenarios`, function () {
  let scenarioVerifier: ScenarioVerifier;
  let nexeraVerifierEntrypoint: NexeraVerifierEntrypoint;
  let validatorAddress: Address;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ scenarioVerifier, validatorAddress, nexeraVerifierEntrypoint } =
      await fixtureNexeraVerifierEntrypoint());
  });

  it(`Should prevent non-owner from adding a scenario`, async () => {
    const [_, addr2] = await ethers.getSigners();
    let hasReverted = false;
    try {
      await nexeraVerifierEntrypoint
        .connect(addr2)
        .addScenarioVerifier(scenarioVerifier.address);
    } catch (e: unknown) {
      expect((e as Error).toString()).to.eq(
        `Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'`
      );
      hasReverted = true;
    }
    expect(hasReverted).to.be.true;
  });

  it(`Should add two scenarios to nexeraVerifierEntrypoint, whitelist them and check that entrypoint is whitelisted`, async () => {
    const scenarioVerifier1 = await deployScenarioVerifier();
    const scenarioVerifier2 = await deployScenarioVerifier();

    // Add Two Scenarios
    await nexeraVerifierEntrypoint.addScenarioVerifier(
      scenarioVerifier1.address
    );
    await nexeraVerifierEntrypoint.addScenarioVerifier(
      scenarioVerifier2.address
    );
    const scenarioVerifierAddress1 =
      await nexeraVerifierEntrypoint.getScenarioVerifierAddress(0);
    const scenarioVerifierAddress2 =
      await nexeraVerifierEntrypoint.getScenarioVerifierAddress(1);
    expect(scenarioVerifierAddress1).to.eq(scenarioVerifier1.address);
    expect(scenarioVerifierAddress2).to.eq(scenarioVerifier2.address);

    // Set up the two Scenarios with 2 Rules
    await setupScenario2Rules(scenarioVerifier1, validatorAddress);
    await setupScenario2Rules(scenarioVerifier2, validatorAddress);

    // get the two ZKPs
    const { zkpIDScanOnChain, zkpProofOfResidenceOnChain, address } =
      await get2ZKPsForUserWhitelist();

    // Check that user is not whitelisted before
    const isWhitelistedBefore =
      await nexeraVerifierEntrypoint.isAllowedForEntrypoint(address);
    expect(isWhitelistedBefore).to.be.false;

    // use allowUserForScenario one call on the first scenario
    const tx = await scenarioVerifier1.allowUserForScenario([
      zkpProofOfResidenceOnChain,
      zkpIDScanOnChain,
    ]);
    await tx.wait();

    // Check that user is not whitelisted when only one scenario is whitelisted
    const isWhitelistedInBetween =
      await nexeraVerifierEntrypoint.isAllowedForEntrypoint(address);
    expect(isWhitelistedInBetween).to.be.false;

    // use allowUserForScenario one call on the second scenario
    const tx2 = await scenarioVerifier2.allowUserForScenario([
      zkpProofOfResidenceOnChain,
      zkpIDScanOnChain,
    ]);
    await tx2.wait();

    // Check that user is whitelisted
    const isWhitelistedAfter =
      await nexeraVerifierEntrypoint.isAllowedForEntrypoint(address);
    expect(isWhitelistedAfter).to.be.true;
  });

  it(`Should allow owner to add a scenario and check if is enabled`, async () => {
    await expect(
      nexeraVerifierEntrypoint.addScenarioVerifier(scenarioVerifier.address)
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierAdded")
      .withArgs(scenarioVerifier.address);
    const isEnabled = await nexeraVerifierEntrypoint.getIsScenarioEnabled(
      scenarioVerifier.address
    );

    expect(isEnabled).to.be.true;
  });

  it(`Should allow owner to delete a scenario and check if isn't on enabled status`, async () => {
    const otherScenarioVerifier = await deployScenarioVerifier();

    await nexeraVerifierEntrypoint.addScenarioVerifier(
      otherScenarioVerifier.address
    );
    await expect(
      nexeraVerifierEntrypoint.deleteScenarioVerifier(
        otherScenarioVerifier.address
      )
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierDeleted")
      .withArgs(otherScenarioVerifier.address);

    await expect(
      nexeraVerifierEntrypoint.enableScenario(otherScenarioVerifier.address)
    ).to.be.revertedWith(
      `Nexera Verifier: Scenario Verifier Address doesn't exist`
    );
  });

  it(`Should allow owner to add an scenario and update with other address`, async () => {
    const oldScenarioVerifier = scenarioVerifier;
    const newScenarioVerifier = await deployScenarioVerifier();

    await nexeraVerifierEntrypoint.addScenarioVerifier(
      oldScenarioVerifier.address
    );
    await expect(
      nexeraVerifierEntrypoint.updateScenarioVerifier(
        oldScenarioVerifier.address,
        newScenarioVerifier.address
      )
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierUpdated")
      .withArgs(oldScenarioVerifier.address, newScenarioVerifier.address);

    await expect(
      nexeraVerifierEntrypoint.enableScenario(oldScenarioVerifier.address)
    ).to.be.revertedWith(
      `Nexera Verifier: Scenario Verifier Address doesn't exist`
    );

    const isEnabled = await nexeraVerifierEntrypoint.getIsScenarioEnabled(
      newScenarioVerifier.address
    );

    expect(isEnabled).to.be.true;
  });

  it(`Should allow owner to disable a Scenario`, async () => {
    const otherScenarioVerifier = await deployScenarioVerifier();

    await nexeraVerifierEntrypoint.addScenarioVerifier(
      otherScenarioVerifier.address
    );

    await expect(
      nexeraVerifierEntrypoint.disableScenario(otherScenarioVerifier.address)
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierDisabled")
      .withArgs(otherScenarioVerifier.address);

    const isEnabled = await nexeraVerifierEntrypoint.getIsScenarioEnabled(
      otherScenarioVerifier.address
    );

    expect(isEnabled).to.be.false;
  });

  it(`Should allow owner to disable and enable again a Scenario`, async () => {
    const otherScenarioVerifier = await deployScenarioVerifier();

    await nexeraVerifierEntrypoint.addScenarioVerifier(
      otherScenarioVerifier.address
    );

    await expect(
      nexeraVerifierEntrypoint.disableScenario(otherScenarioVerifier.address)
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierDisabled")
      .withArgs(otherScenarioVerifier.address);
    await expect(
      nexeraVerifierEntrypoint.enableScenario(otherScenarioVerifier.address)
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierEnabled")
      .withArgs(otherScenarioVerifier.address);

    const isEnabled = await nexeraVerifierEntrypoint.getIsScenarioEnabled(
      otherScenarioVerifier.address
    );

    expect(isEnabled).to.be.true;
  });
});
