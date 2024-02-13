import { expect } from "chai";
import { ethers } from "hardhat";

import {
  NexeraVerifierEntrypoint,
  ProxyAavePool,
  ScenarioVerifier,
} from "../../typechain";
import { get2ZKPsForUserWhitelist } from "../utils/get2ZKPsForUserWhitelist";
import { setupScenario2Rules } from "../utils/setupScenario2Rules";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { fixtureProxyAavePool } from "../../fixtures/fixtureProxyAavePool";
import { getUserAddress } from "../utils/getUserAddress";

const aavePoolAddress = "0xcC6114B983E4Ed2737E9BD3961c9924e6216c704";
const testWETHAddress = "0xc199807AF4fEDB02EE567Ed0FeB814A077de4802";

describe(`ProxyAavePool`, function () {
  let scenarioVerifier: ScenarioVerifier;
  let entrypointVerifier: NexeraVerifierEntrypoint;
  let proxyAavePool: ProxyAavePool;
  let validatorAddress: Address;

  beforeEach(async () => {
    ({
      scenarioVerifier,
      validatorAddress,
      nexeraVerifierEntrypoint: entrypointVerifier,
      proxyAavePool,
    } = await fixtureProxyAavePool());
  });
  it(`Should check that user can call supply on un-proxied pool`, async () => {
    // get user signer and address
    const address = await getUserAddress();

    // Get contracts
    const pool = await ethers.getContractAt("IPool", aavePoolAddress);
    const weth = await ethers.getContractAt("ERC20", testWETHAddress);

    // approve and supply
    const totalCollateralBaseBefore = (
      await pool.getUserAccountData(address)
    )[0];
    await weth.approve(aavePoolAddress, 1000);
    await pool.supply(testWETHAddress, 1000, address, 0);
    // Collateral base should have increased
    expect(
      Number((await pool.getUserAccountData(address))[0]) >
        Number(totalCollateralBaseBefore)
    ).to.be.true;
  });
  it(`Should check that user cannot call the ProxyAavePool if not whitelisted`, async () => {
    // get user signer and address
    const address = await getUserAddress();

    // Get contracts
    const weth = await ethers.getContractAt("ERC20", testWETHAddress);

    // approve and supply should fail
    await weth.approve(proxyAavePool.address, 1000);
    expect(
      proxyAavePool.supply(testWETHAddress, 1000, address)
    ).to.be.revertedWith("User is not whitelisted");
  });
  it(`Should be able to supply to the proxy pool after being whitelisted`, async () => {
    // Set up Scenrario with 2 Rules
    await setupScenario2Rules(scenarioVerifier, validatorAddress);

    // get the two ZKPs
    const { zkpIDScanOnChain, zkpProofOfResidenceOnChain, address } =
      await get2ZKPsForUserWhitelist();

    // use allowUserForScenario one call
    await scenarioVerifier.allowUserForScenario([
      zkpProofOfResidenceOnChain,
      zkpIDScanOnChain,
    ]);

    // Check that user is whitelisted
    const isWhitelistedAfter = await scenarioVerifier.isAllowedForScenario(
      address
    );
    expect(isWhitelistedAfter).to.be.true;
    const isWhitelistedAfterEntrypoint =
      await entrypointVerifier.isAllowedForEntrypoint(address);
    expect(isWhitelistedAfterEntrypoint).to.be.true;

    // Approve weth to pool directly (delegatecall pattern)
    const weth = await ethers.getContractAt("ERC20", testWETHAddress);
    await weth.approve(aavePoolAddress, 1);

    const pool = await ethers.getContractAt("IPool", aavePoolAddress);
    const totalCollateralBaseBefore = (
      await pool.getUserAccountData(address)
    )[0];

    // Check that user can supply to Pool
    await proxyAavePool.supply(testWETHAddress, 1000, address);

    // Collateral base should have increased
    expect(
      Number((await pool.getUserAccountData(address))[0]) >
        Number(totalCollateralBaseBefore)
    ).to.be.true;
  });
});
