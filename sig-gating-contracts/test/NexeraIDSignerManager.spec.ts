import { expect } from "chai";
import hre, { getNamedAccounts, ethers } from "hardhat";

import { ExampleGatedNFTMinter, NexeraIDSignerManager } from "../typechain";
import { Address } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { fixtureExampleGatedNFTMinter } from "../fixtures/fixtureExampleGatedNFTMinter";

import { ExampleGatedNFTMinterABI } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/abis";
import { signTxAuthDataLib } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { publicActions } from "viem";
import { setupThreeAccounts } from "./utils/fundAccounts";

describe(`NexeraIDSignerManager`, function () {
  let nexeraIDSignerManager: NexeraIDSignerManager;
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ nexeraIDSignerManager, exampleGatedNFTMinter } =
      await fixtureExampleGatedNFTMinter());
  });
  it(`Should check that admin can change the signer`, async () => {
    const [deployer, _testerSigner, address3] = await ethers.getSigners();
    // set signer
    await nexeraIDSignerManager.connect(deployer).setSigner(address3.address);

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner === address3.address).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const [_deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to set signer
    await expect(
      nexeraIDSignerManager.connect(address3).setSigner(address3.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner !== address3.address).to.be.true;
  });
  it(`Should check that signerManager admin can change the signer and sig auth behavior changes accordingly`, async () => {
    const { tester } = await getNamedAccounts();
    const [deployer, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, _, secondSignerWalletClient] =
      await hre.viem.getWalletClients();

    const secondSignerAddress = secondSignerWalletClient.account.address;

    // Change signer
    await nexeraIDSignerManager
      .connect(deployer)
      .setSigner(secondSignerAddress);

    const newSigner = await nexeraIDSignerManager.signerAddress();
    expect(newSigner.toLocaleLowerCase() === secondSignerAddress).to.be.true;

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

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(),
      32
    );

    const lengthSig = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(),
      32
    );

    const unsignedTx =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    const finalSig_ =
      lengthSig + signatureResponse.signature.slice(2) + "0".repeat(62);

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      length.slice(2) +
      finalSig_.slice(2);

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

    const length2 = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(),
      32
    );

    const lengthSig2 = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(),
      32
    );

    const unsignedTx2 =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    const finalSig2 =
      lengthSig2 + signatureResponse2.signature.slice(2) + "0".repeat(62);

    // Complete data
    const txData2 =
      unsignedTx2.data +
      abiEncodedBlockExpiration2.slice(2) +
      length2.slice(2) +
      finalSig2.slice(2);

    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTMinter.address,
        data: txData2,
      })
    ).to.be.revertedWith("InvalidSignature");

    // Check no new minted token id
    const tokenId2 = Number(await exampleGatedNFTMinter.lastTokenId());
    expect(tokenId2 === 1).to.be.true;
  });
});
