import { expect } from "chai";
import { getNamedAccounts, network, ethers } from "hardhat";

import { ExampleGatedNFTMinterV0 } from "../../typechain";
import { Address } from "../../lib/schemas";
import { fixtureExampleGatedNFTMinterV0 } from "../../fixtures/fixtureExampleGatedNFTMinterV0";

import { ExampleGatedNFTMinterV0ABI } from "@nexeraprotocol/nexera-id-contracts-sdk/abis";
import { signTxAuthData } from "../utils/signTxAuthData";
import {
  generateFunctionCallData,
  generateMintFunctionData,
} from "../utils/generateFunctionCallData";

describe(`ExampleGatedNFTMinterV0: Compare two gating mechanisms`, function () {
  let exampleGatedNFTMinter: ExampleGatedNFTMinterV0;

  beforeEach(async () => {
    ({ exampleGatedNFTMinter } = await fixtureExampleGatedNFTMinterV0());
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - Basic`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner, txAuthSigner] = await ethers.getSigners();

    // Build Signature
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    const chainID = Number(await network.provider.send("eth_chainId"));
    const functionData = await generateMintFunctionData(tester as Address);

    const txAuthData = {
      functionCallData: functionData,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.getUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthData(txAuthData, txAuthSigner);

    // try to mint nft
    const tx = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTBasic(tester, signature, blockExpiration);

    const transactionReceipt = await tx.wait();
    const tokenId = Number(transactionReceipt.events?.[0].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - Optimized`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner, txAuthSigner] = await ethers.getSigners();

    // Build Signature
    const recipient = tester;
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    const chainID = Number(await network.provider.send("eth_chainId"));
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallData(
      ExampleGatedNFTMinterV0ABI,
      "mintNFTOpti",
      [recipient, blockExpiration, "0x1234"]
    );
    // remove 96 bytes (2 bytes fake sig + 32 bytes offset + 32 bytes length + 30 bytes suffix) for the signature
    // 32 bytes for blockExpiration
    // = 128 bytes = 256 characters
    const argsWithSelector = functionCallData.slice(0, -256);

    const txAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.getUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthData(txAuthData, txAuthSigner);

    // try to mint nft
    const tx = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTOpti(recipient, blockExpiration, signature);

    const transactionReceipt = await tx.wait();
    const tokenId = Number(transactionReceipt.events?.[0].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
});
