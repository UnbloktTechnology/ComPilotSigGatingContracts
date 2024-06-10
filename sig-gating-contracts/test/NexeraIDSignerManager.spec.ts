import { expect } from "chai";
import hre, { getNamedAccounts, ethers } from "hardhat";

import { ExampleGatedNFTMinter, NexeraIDSignerManager } from "../typechain";
import { Address } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

import { ExampleGatedNFTMinterABI } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/abis";
import { signTxAuthDataLib } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { publicActions, pad } from "viem";
import { setupThreeAccounts } from "./utils/fundAccounts";
import { fixtureExampleGatedNFTMinter } from "../fixtures/fixtureExampleGatedNFTMinter";

describe(`NexeraIDSignerManager`, function () {
  let nexeraIDSignerManager: NexeraIDSignerManager;
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ exampleGatedNFTMinter, nexeraIDSignerManager } =
      await fixtureExampleGatedNFTMinter());
  });
  it(`Should check that signerManagerControllerSigner can change the signer`, async () => {
    const { tester2, signerManagerController } = await getNamedAccounts();
    const signerManagerControllerSigner = await ethers.getSigner(
      signerManagerController
    );
    // set signer
    await nexeraIDSignerManager
      .connect(signerManagerControllerSigner)
      .setSigner(tester2);

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner === tester2).to.be.true;
  });
  it(`Should check that non-signerManagerControllerSigner can NOT change the signer`, async () => {
    const { tester2 } = await getNamedAccounts();
    const tester2Signer = await ethers.getSigner(tester2);
    // try to set signer
    await expect(
      nexeraIDSignerManager.connect(tester2Signer).setSigner(tester2)
    ).to.be.revertedWith(`Ownable: caller is not the owner`);

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner !== tester2).to.be.true;
  });
  it(`Should check that signerManagerControllerSigner can change the signer and sig auth behavior changes accordingly`, async () => {
    const { tester, signerManagerController, txAuthSignerAddress, tester2 } =
      await getNamedAccounts();
    const signerManagerControllerSigner = await ethers.getSigner(
      signerManagerController
    );
    const testerSigner = await ethers.getSigner(tester);

    const txAuthWalletClient = await hre.viem.getWalletClient(
      txAuthSignerAddress as Address
    );
    const secondSignerWalletClient = await hre.viem.getWalletClient(
      tester2 as Address
    );

    // Change signer
    await nexeraIDSignerManager
      .connect(signerManagerControllerSigner)
      .setSigner(tester2);

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner === tester2).to.be.true;

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
    };

    // Sign with new signer
    const signatureResponse = await signTxAuthDataLib(
      secondSignerWalletClient.extend(publicActions),
      txAuthInput
    );

    // Encoding the blockExpiration (uint256) and signature (bytes)
    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(),
      32
    );

    const unsignedTx =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinter.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTMinter.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signature verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;

    // Now try with old signer that should fail

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
    const tokenId2 = Number(await exampleGatedNFTMinter.lastTokenId());
    expect(tokenId2 === 1).to.be.true;

    // Change back signer
    await nexeraIDSignerManager
      .connect(signerManagerControllerSigner)
      .setSigner(txAuthSignerAddress);
  });
});
