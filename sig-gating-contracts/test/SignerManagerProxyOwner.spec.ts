import { expect } from "chai";
import hre, { getNamedAccounts, ethers } from "hardhat";

import {
  ExampleGatedNFTMinter,
  NexeraIDSignerManager,
  SignerManagerProxyOwner,
} from "../typechain";
import { Address } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

import { ExampleGatedNFTMinterABI } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/abis";
import { signTxAuthDataLib } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { keccak256, pad, publicActions, toHex } from "viem";
import { setupThreeAccounts } from "./utils/fundAccounts";
import { fixtureExampleGatedNFTMinterWithProxyOwner } from "../fixtures/fixtureExampleGatedNFTMinterWithProxyOwner";

const PAUSER_ROLE = keccak256(toHex("PAUSER_ROLE"));
const DEFAULT_ADMIN_ROLE = pad("0x00", { size: 32 });

describe(`SignerManagerProxyOwner`, function () {
  let nexeraIDSignerManager: NexeraIDSignerManager;
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;
  let signerManagerProxyOwner: SignerManagerProxyOwner;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ exampleGatedNFTMinter, signerManagerProxyOwner, nexeraIDSignerManager } =
      await fixtureExampleGatedNFTMinterWithProxyOwner());
  });
  // DEFAULT_ADMIN_ROLE/SIGNER_MANAGER_CONTROLLER management
  it(`Should check that signerManagerControllerSigner can change the signerManagerControllerSigner`, async () => {
    const { tester2, signerManagerController } = await getNamedAccounts();
    const signerManagerControllerSigner = await ethers.getSigner(
      signerManagerController
    );
    // set signer
    await signerManagerProxyOwner
      .connect(signerManagerControllerSigner)
      .grantRole(DEFAULT_ADMIN_ROLE, tester2);

    expect(await signerManagerProxyOwner.hasRole(DEFAULT_ADMIN_ROLE, tester2))
      .to.be.true;
  });
  it(`Should check that non-signerManagerControllerSigner can NOT change the signerManagerControllerSigner`, async () => {
    const { tester2 } = await getNamedAccounts();
    const tester2Signer = await ethers.getSigner(tester2);
    // try to set signer
    await expect(
      signerManagerProxyOwner
        .connect(tester2Signer)
        .grantRole(DEFAULT_ADMIN_ROLE, tester2)
    ).to.be.revertedWith(
      `AccessControl: account ${tester2.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );

    expect(await signerManagerProxyOwner.hasRole(DEFAULT_ADMIN_ROLE, tester2))
      .to.be.false;
  });
  // Pauser management
  it(`Should check that signerManagerControllerSigner can change the pauser`, async () => {
    const { tester2, signerManagerController } = await getNamedAccounts();
    const signerManagerControllerSigner = await ethers.getSigner(
      signerManagerController
    );
    // set signer
    await signerManagerProxyOwner
      .connect(signerManagerControllerSigner)
      .grantRole(PAUSER_ROLE, tester2);

    expect(await signerManagerProxyOwner.hasRole(PAUSER_ROLE, tester2)).to.be
      .true;
  });
  it(`Should check that non-signerManagerControllerSigner can NOT change the pauser`, async () => {
    const { tester2 } = await getNamedAccounts();
    const tester2Signer = await ethers.getSigner(tester2);
    // try to set signer
    await expect(
      signerManagerProxyOwner
        .connect(tester2Signer)
        .grantRole(PAUSER_ROLE, tester2)
    ).to.be.revertedWith(
      `AccessControl: account ${tester2.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );

    expect(await signerManagerProxyOwner.hasRole(PAUSER_ROLE, tester2)).to.be
      .false;
  });
  // SignerManager ownership management
  it(`Should check that signerManagerControllerSigner can change the signerManager owner`, async () => {
    const { tester2, signerManagerController } = await getNamedAccounts();
    const signerManagerControllerSigner = await ethers.getSigner(
      signerManagerController
    );
    // set signer
    await signerManagerProxyOwner
      .connect(signerManagerControllerSigner)
      .transferSignerManagerOwnership(tester2);

    expect((await nexeraIDSignerManager.owner()) == tester2).to.be.true;
  });
  it(`Should check that non-signerManagerControllerSigner can NOT change the signerManager owner`, async () => {
    const { tester2 } = await getNamedAccounts();
    const tester2Signer = await ethers.getSigner(tester2);
    // try to set signer
    await expect(
      signerManagerProxyOwner
        .connect(tester2Signer)
        .transferSignerManagerOwnership(tester2)
    ).to.be.revertedWith(
      `AccessControl: account ${tester2.toLocaleLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
    );

    expect((await nexeraIDSignerManager.owner()) == tester2).to.be.false;
  });
  it(`Should check that pauser can pause the contract and sig auth behavior changes accordingly`, async () => {
    const { tester, txAuthSignerAddress, pauser, signerManagerController } =
      await getNamedAccounts();
    const pauserSigner = await ethers.getSigner(pauser);
    const testerSigner = await ethers.getSigner(tester);
    const signerManagerControllerSigner = await ethers.getSigner(
      signerManagerController
    );

    const txAuthWalletClient = await hre.viem.getWalletClient(
      txAuthSignerAddress as Address
    );

    // Change signer
    await signerManagerProxyOwner.connect(pauserSigner).pauseSignerManager();

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner === "0x0000000000000000000000000000000000000001").to.be
      .true;

    // Now try with old signer that should fail

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
    };

    // Fetch Signature with old signer

    const signatureResponse2 = await signTxAuthDataLib(
      txAuthWalletClient.extend(publicActions),
      txAuthInput
    );

    // Encoding the blockExpiration (uint256) and signature (bytes)
    const abiEncodedBlockExpiration2 = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(signatureResponse2.blockExpiration).toHexString(),
      32
    );

    const unsignedTx2 =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData2 =
      unsignedTx2.data +
      abiEncodedBlockExpiration2.slice(2) +
      signatureResponse2.signature.slice(2);

    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTMinter.address,
        data: txData2,
      })
    ).to.be.revertedWith("InvalidSignature");

    // Check no new minted token id
    const tokenId = Number(await exampleGatedNFTMinter.lastTokenId());
    expect(tokenId === 0).to.be.true;

    // Change back signer
    await signerManagerProxyOwner
      .connect(signerManagerControllerSigner)
      .setSigner(txAuthSignerAddress);
  });
});
