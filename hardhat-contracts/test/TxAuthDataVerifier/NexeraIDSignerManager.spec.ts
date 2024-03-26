import { expect } from "chai";
import hre, { getNamedAccounts, ethers } from "hardhat";

import { ExampleGatedNFTMinter, NexeraIDSignerManager } from "../../typechain";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { fixtureExampleGatedNFTMinter } from "../../fixtures/fixtureExampleGatedNFTMinter";

import { ExampleGatedNFTMinterABI } from "@nexeraprotocol/nexera-id-contracts-sdk/abis";
import { signTxAuthDataLib } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { publicActions } from "viem";

describe(`NexeraIDSignerManager`, function () {
  let nexeraIDSignerManager: NexeraIDSignerManager;
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    ({ nexeraIDSignerManager, exampleGatedNFTMinter } =
      await fixtureExampleGatedNFTMinter());
  });
  it(`Should check that admin can change the signer`, async () => {
    const [deployer, _testerSigner, address3] = await ethers.getSigners();
    // set signer
    await nexeraIDSignerManager.connect(deployer).setSigner(address3.address);

    const newSigner = await nexeraIDSignerManager.getSignerAddress();
    expect(newSigner === address3.address).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const [_deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to set signer
    await expect(
      nexeraIDSignerManager.connect(address3).setSigner(address3.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const newSigner = await nexeraIDSignerManager.getSignerAddress();
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

    const newSigner = await nexeraIDSignerManager.getSignerAddress();
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

    // try to mint nft
    const tx = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTGated(
        recipient,
        signatureResponse.blockExpiration,
        signatureResponse.signature
      );

    const transactionReceipt = await tx.wait();

    // Check new minted token id
    const tokenId = Number(transactionReceipt.events?.[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(transactionReceipt.events?.[0].args?.userAddress === tester).to.be
      .true;
    expect(transactionReceipt.events?.[0].event === "NexeraIDSignatureVerified")
      .to.be.true;

    // Now try with old signer that should fail

    // Fetch Signature with old signer

    const signatureResponse2 = await signTxAuthDataLib(
      txAuthWalletClient.extend(publicActions),
      txAuthInput
    );
    await expect(
      exampleGatedNFTMinter
        .connect(testerSigner)
        .mintNFTGated(
          recipient,
          signatureResponse2.blockExpiration,
          signatureResponse2.signature
        )
    ).to.be.revertedWith("InvalidSignature");

    // Check no new minted token id
    const tokenId2 = Number(await exampleGatedNFTMinter.getLastTokenId());
    expect(tokenId2 === 1).to.be.true;
  });
});
