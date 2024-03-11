import { expect } from "chai";
import hre, { getNamedAccounts, network, ethers } from "hardhat";

import { ExampleGatedNFTMinter } from "../../typechain";
import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { fixtureExampleGatedNFTMinter } from "../../fixtures/fixtureExampleGatedNFTMinter";

import {
  ExampleGatedNFTMinterABI,
  ExampleMultipleInputsABI,
} from "@nexeraprotocol/nexera-id-contracts-sdk/abis";
import { signTxAuthDataLib } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import {
  generateFunctionCallData,
  generateFunctionCallDataViem,
} from "../utils/generateFunctionCallData";
import { signTxAuthData, signTxAuthDataViem } from "../utils/signTxAuthData";
import { publicActions } from "viem";
import { fixtureExampleNFTMinter } from "../../fixtures/fixtureExampleNFTMinter";
import { fixtureExampleMultipleInputs } from "../../fixtures/fixtureExampleMultipleInputs";

describe(`ExampleGatedNFTMinter`, function () {
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    ({ exampleGatedNFTMinter } = await fixtureExampleGatedNFTMinter());
  });
  it(`Should check that user can call the NON GATED ExampleNFTMinter for gas comparaison purposes`, async () => {
    const { exampleNFTMinter } = await fixtureExampleNFTMinter();
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();

    const recipient = tester;

    // try to mint nft
    await exampleNFTMinter.connect(testerSigner).mintNFT(recipient);

    const tokenId = Number(await exampleNFTMinter.getLastTokenId());
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

    // Build Signature
    const recipient = tester;
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    const chainID = Number(await network.provider.send("eth_chainId"));
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallData(
      ExampleGatedNFTMinterABI,
      "mintNFTGated",
      [recipient, blockExpiration, "0x1234"]
    );
    // remove 64 bytes (32 bytes for the length and 32 bytes for the fake signature itself)
    // = 128 characters
    const argsWithSelector = functionCallData.slice(0, -128) as `0x${string}`;

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
    await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTGated(recipient, blockExpiration, signature);

    const tokenId = Number(await exampleGatedNFTMinter.getLastTokenId());
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - with Viem`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    const chainID = Number(await network.provider.send("eth_chainId"));
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallDataViem(
      ExampleGatedNFTMinterABI,
      "mintNFTGated",
      [recipient, blockExpiration, "0x1234"]
    );
    // remove 64 bytes (32 bytes for the length and 32 bytes for the fake signature itself)
    // = 128 characters
    const argsWithSelector = functionCallData.slice(0, -128) as `0x${string}`;

    const txAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.getUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthDataViem(txAuthData, txAuthWalletClient);

    // try to mint nft
    const tx = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTGated(recipient, blockExpiration, signature);

    const transactionReceipt = await tx.wait();
    const tokenId = Number(transactionReceipt.events?.[0].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - with lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: ExampleGatedNFTMinterABI,
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLib(
      txAuthWalletClient.extend(publicActions),
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
    const tokenId = Number(transactionReceipt.events?.[0].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleMultipleInputs with a signature from the signer - with lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, ___] = await hre.viem.getWalletClients();
    const { exampleMultipleInputs } = await fixtureExampleMultipleInputs();

    // Build Signature
    const testNumber = 2;
    const testAddress = tester;
    const testByteString = "0x224455";

    const txAuthInput = {
      contractAbi: ExampleMultipleInputsABI,
      contractAddress: exampleMultipleInputs.address as Address,
      functionName: "updateVariables",
      args: [testNumber, testAddress, testByteString],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLib(
      txAuthWalletClient.extend(publicActions),
      txAuthInput
    );
    console.log("signatureResponse.signature", signatureResponse.signature);

    // try to mint nft
    await exampleMultipleInputs
      .connect(testerSigner)
      .updateVariables(
        testNumber,
        testAddress,
        testByteString,
        signatureResponse.blockExpiration,
        signatureResponse.signature
      );

    const bytesVariable = await exampleMultipleInputs.getBytesVariable();
    expect(testByteString === bytesVariable).to.be.true;
  });
  it(`Should check that user can NOT call the ExampleGatedNFTMinter with a wrong signature from the signer`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

    // Build Signature
    const recipient = tester;
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    const chainID = Number(await network.provider.send("eth_chainId"));
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallData(
      ExampleGatedNFTMinterABI,
      "mintNFTGated",
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

    // Build Wrong Values
    const wrongValues = {
      functionCallData: (
        await generateFunctionCallData(
          ExampleGatedNFTMinterABI,
          "mintNFTGated",
          [txAuthSigner.address, blockExpiration, "0x1234"]
        )
      ).slice(0, -256), // wrong recipient value
      contractAddress: tester as Address,
      userAddress: txAuthSigner.address as Address,
      chainID: 666,
      nonce: 666,
    };

    for (const wrongValueKey of Object.keys(wrongValues)) {
      let hasReverted = false;
      try {
        const signature = await signTxAuthData(
          //@ts-ignore
          { ...txAuthData, [wrongValueKey]: wrongValues[wrongValueKey] },
          txAuthSigner
        );

        // try to mint nft
        await exampleGatedNFTMinter
          .connect(testerSigner)
          .mintNFTGated(recipient, blockExpiration, signature);
      } catch (e: unknown) {
        expect((e as Error).toString()).to.eq(
          `TransactionExecutionError: VM Exception while processing transaction: revert with unrecognized return data or custom error`
        );
        hasReverted = true;
      }
      expect(hasReverted).to.be.true;
    }
  });
  it(`Should check that user can NOT call the ExampleGatedNFTMinter with an expired signature from the signer`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

    // Build Signature
    const recipient = tester;
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    const chainID = Number(await network.provider.send("eth_chainId"));
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallData(
      ExampleGatedNFTMinterABI,
      "mintNFTGated",
      [recipient, blockExpiration, "0x1234"]
    );

    // remove 96 bytes (2 bytes fake sig + 32 bytes offset + 32 bytes length + 30 bytes suffix) for the signature
    // 32 bytes for blockExpiration
    // = 128 bytes = 256 characters
    const argsWithSelector = functionCallData.slice(0, -256) as `0x${string}`;

    const wrongTxAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.getUserNonce(tester)),
      blockExpiration: 0,
    };

    let hasReverted = false;
    try {
      const signature = await signTxAuthData(wrongTxAuthData, txAuthSigner);

      // try to mint nft
      await exampleGatedNFTMinter
        .connect(testerSigner)
        .mintNFTGated(recipient, blockExpiration, signature);
    } catch (e: unknown) {
      expect((e as Error).toString()).to.eq(
        `TransactionExecutionError: VM Exception while processing transaction: revert with unrecognized return data or custom error`
      );
      hasReverted = true;
    }
    expect(hasReverted).to.be.true;
  });
  it(`Should check that admin can change the signer`, async () => {
    const [deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to mint nft
    await exampleGatedNFTMinter.connect(deployer).setSigner(address3.address);

    const newSigner = await exampleGatedNFTMinter.getSignerAddress();
    expect(newSigner === address3.address).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const [_deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to mint nft
    try {
      await exampleGatedNFTMinter.connect(address3).setSigner(address3.address);
    } catch (e) {
      expect((e as Error).toString().substring(0, 112)).to.eq(
        "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
      );
    }

    const newSigner = await exampleGatedNFTMinter.getSignerAddress();
    expect(newSigner !== address3.address).to.be.true;
  });
});
