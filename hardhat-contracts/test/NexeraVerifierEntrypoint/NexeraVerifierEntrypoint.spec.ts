import { expect } from "chai";
import { ethers } from "hardhat";

import { deployNexeraVerifierEntrypoint } from "../../lib/deploy/deployNexeraVerifierEntrypoint";
import { deployScenarioVerifier } from "../../lib/deploy/deployScenarioVerifier";
import { NexeraVerifierEntrypoint, ScenarioVerifier } from "../../types";

describe(`NexeraVerifierEntrypoint: test two scenarios`, function () {
  let scenarioVerifier: ScenarioVerifier;
  let nexeraVerifierEntrypoint: NexeraVerifierEntrypoint;

  beforeEach(async () => {
    nexeraVerifierEntrypoint = await deployNexeraVerifierEntrypoint();
    scenarioVerifier = await deployScenarioVerifier();
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

  it(`Should allow owner to add a scenario and check if is enabled`, async () => {
    await expect(
      nexeraVerifierEntrypoint.addScenarioVerifier(scenarioVerifier.address)
    )
      .to.emit(nexeraVerifierEntrypoint, "ScenarioVerifierAdded")
      .withArgs(scenarioVerifier.address);
    const isEnabled = await nexeraVerifierEntrypoint.isScenarioEnabled(
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
    const oldScenarioVerifier = await deployScenarioVerifier();
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

    const isEnabled = await nexeraVerifierEntrypoint.isScenarioEnabled(
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

    const isEnabled = await nexeraVerifierEntrypoint.isScenarioEnabled(
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

    const isEnabled = await nexeraVerifierEntrypoint.isScenarioEnabled(
      otherScenarioVerifier.address
    );

    expect(isEnabled).to.be.true;
  });
});
