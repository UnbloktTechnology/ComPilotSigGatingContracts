import { expect } from "chai";
import hre, { getNamedAccounts, network, ethers } from "hardhat";

import { ExampleGatedNFTMinter } from "../../typechain";
import {
  Address,
  signTxAuthDataLib,
  signTxAuthDataLibEthers,
} from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { fixtureExampleGatedNFTMinter } from "../../fixtures/fixtureExampleGatedNFTMinter";

import {
  ExampleGatedNFTMinterABI,
  ExampleMultipleInputsABI,
} from "@nexeraprotocol/nexera-id-contracts-sdk/abis";
import {
  generateFunctionCallData,
  generateFunctionCallDataViem,
} from "../utils/generateFunctionCallData";
import { signTxAuthData, signTxAuthDataViem } from "../utils/signTxAuthData";
import { getContract, publicActions } from "viem";
import { fixtureExampleNFTMinter } from "../../fixtures/fixtureExampleNFTMinter";
import { fixtureExampleMultipleInputs } from "../../fixtures/fixtureExampleMultipleInputs";
import { deployExampleGatedNFTMinterWithEOA } from "../../lib/deploy/deployExampleGatedNFTMinter";
import { Wallet } from "ethers";

describe(`ExampleGatedNFTMinter`, function () {
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    ({ exampleGatedNFTMinter } = await fixtureExampleGatedNFTMinter());
  });
  it(`Should check that user can call the NON GATED ExampleNFTMinter for gas comparaison purposes`, async () => {
    const { exampleNFTMinter } = await fixtureExampleNFTMinter();
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

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
    //let provider = new ethers.providers.JsonRpcProvider();
    if (!txAuthSigner.provider) {
      throw new Error("missing provider on signer");
    }
    const { chainId: chainID } = await txAuthSigner.provider.getNetwork();
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
    if (!testerSigner.provider) {
      throw new Error("missing provider on signer");
    }
    const { chainId: chainID } = await testerSigner.provider.getNetwork();
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
    const tokenId = Number(transactionReceipt.events?.[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - with viem lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
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

    // Do it a second time to make sure nonce system works

    // Build Signature

    const signatureResponse2 = await signTxAuthDataLib(
      txAuthWalletClient.extend(publicActions),
      txAuthInput
    );

    // try to mint nft
    const tx2 = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTGated(
        recipient,
        signatureResponse2.blockExpiration,
        signatureResponse2.signature
      );

    const transactionReceipt2 = await tx2.wait();

    // Check new minted token id
    const tokenId2 = Number(transactionReceipt2.events?.[1].args?.tokenId);
    expect(tokenId2 === 2).to.be.true;
    const tokenOwner2 = await exampleGatedNFTMinter.ownerOf(tokenId2);
    expect(tokenOwner2 === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(transactionReceipt2.events?.[0].args?.userAddress === tester).to.be
      .true;
    expect(
      transactionReceipt2.events?.[0].event === "NexeraIDSignatureVerified"
    ).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - with ethers lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
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

    // Do it a second time to make sure nonce system works

    // Build Signature

    const signatureResponse2 = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );

    // try to mint nft
    const tx2 = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTGated(
        recipient,
        signatureResponse2.blockExpiration,
        signatureResponse2.signature
      );

    const transactionReceipt2 = await tx2.wait();

    // Check new minted token id
    const tokenId2 = Number(transactionReceipt2.events?.[1].args?.tokenId);
    expect(tokenId2 === 2).to.be.true;
    const tokenOwner2 = await exampleGatedNFTMinter.ownerOf(tokenId2);
    expect(tokenOwner2 === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(transactionReceipt2.events?.[0].args?.userAddress === tester).to.be
      .true;
    expect(
      transactionReceipt2.events?.[0].event === "NexeraIDSignatureVerified"
    ).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - with EOA signer instead of SignerManager`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();

    // Deploy manually another NFT minter but using EOA instead of SignerManager smart contract as signer
    const exampleGatedNFTMinterWithEOA =
      await deployExampleGatedNFTMinterWithEOA();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinterWithEOA.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );

    // try to mint nft
    const tx = await exampleGatedNFTMinterWithEOA
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
    const tokenOwner = await exampleGatedNFTMinterWithEOA.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(transactionReceipt.events?.[0].args?.userAddress === tester).to.be
      .true;
    expect(transactionReceipt.events?.[0].event === "NexeraIDSignatureVerified")
      .to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - custom nonce and chainId`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    // here the idea is to provide the chainId and nonce, as it would be used by devs who want to test our api with a local testnet
    const contract = getContract({
      address: exampleGatedNFTMinter.address as Address,
      abi: ExampleGatedNFTMinterABI,
      publicClient: txAuthWalletClient,
    });
    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
      chainID: await txAuthWalletClient.getChainId(),
      nonce: Number(await contract.read.getUserNonce([tester as Address])),
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
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
  });
  it(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer - with custom address for contract to be able to call it`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGatedWithAddress",
      args: [recipient, recipient],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );

    // try to mint nft
    const tx = await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTGatedWithAddress(
        recipient,
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
  });
  it(`Should check that user can call the ExampleMultipleInputs - multiple input with bytes - with a signature from the signer - with lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();
    const { exampleMultipleInputs } = await fixtureExampleMultipleInputs();

    // Build Signature
    const testNumber = 2;
    const testAddress = tester;
    const testByteString = "0x224455";

    const txAuthInput = {
      contractAbi: Array.from(ExampleMultipleInputsABI),
      contractAddress: exampleMultipleInputs.address as Address,
      functionName: "updateVariables",
      args: [testNumber, testAddress, testByteString],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );
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
  it(`Should check that user can call the ExampleMultipleInputs - no input - with a signature from the signer - with lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();
    const { exampleMultipleInputs } = await fixtureExampleMultipleInputs();

    // Build Signature

    const txAuthInput = {
      contractAbi: Array.from(ExampleMultipleInputsABI),
      contractAddress: exampleMultipleInputs.address as Address,
      functionName: "updateVariablesNoInput",
      args: [],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );
    console.log("signatureResponse.signature", signatureResponse.signature);

    // try to mint nft
    await exampleMultipleInputs
      .connect(testerSigner)
      .updateVariablesNoInput(
        signatureResponse.blockExpiration,
        signatureResponse.signature
      );

    const intVar = await exampleMultipleInputs.getIntVariable();
    expect(1 == Number(intVar)).to.be.true;
  });
  it(`Should check that user can NOT call the ExampleGatedNFTMinter with a wrong signature from the signer`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

    // Build Signature
    const recipient = tester;
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    if (!txAuthSigner.provider) {
      throw new Error("missing provider on signer");
    }
    const { chainId: chainID } = await txAuthSigner.provider.getNetwork();
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
      const signature = await signTxAuthData(
        //@ts-ignore
        { ...txAuthData, [wrongValueKey]: wrongValues[wrongValueKey] },
        txAuthSigner as unknown as Wallet
      );

      await expect(
        exampleGatedNFTMinter
          .connect(testerSigner)
          .mintNFTGated(recipient, blockExpiration, signature)
      ).to.be.revertedWith("InvalidSignature");
    }
  });
  it(`Should check that user can NOT call the ExampleMultipleInputs with a wrong signature from the signer`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const { exampleMultipleInputs } = await fixtureExampleMultipleInputs();

    // Build Signature
    const testNumber = 2;
    const testAddress = tester;
    const testByteString = "0x224455";
    const block = await ethers.provider.getBlock("latest");
    const blockExpiration = block.number + 50;
    if (!txAuthSigner.provider) {
      throw new Error("missing provider on signer");
    }
    const { chainId: chainID } = await txAuthSigner.provider.getNetwork();
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallData(
      ExampleMultipleInputsABI,
      "updateVariables",
      [testNumber, testAddress, testByteString, blockExpiration, "0x1234"]
    );

    // remove 96 bytes (2 bytes fake sig + 32 bytes offset + 32 bytes length + 30 bytes suffix) for the signature
    // 32 bytes for blockExpiration
    // = 128 bytes = 256 characters
    const argsWithSelector = functionCallData.slice(0, -128);

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
          ExampleMultipleInputsABI,
          "updateVariables",
          [testNumber, testAddress, testByteString, blockExpiration, "0x1234"]
        )
      ).slice(0, -128), // wrong recipient value
      contractAddress: tester as Address,
      userAddress: txAuthSigner.address as Address,
      chainID: 666,
      nonce: 666,
    };

    for (const wrongValueKey of Object.keys(wrongValues)) {
      const signature = await signTxAuthData(
        //@ts-ignore
        { ...txAuthData, [wrongValueKey]: wrongValues[wrongValueKey] },
        txAuthSigner as unknown as Wallet
      );

      await expect(
        exampleMultipleInputs
          .connect(testerSigner)
          .updateVariables(
            testNumber,
            testAddress,
            testByteString,
            blockExpiration,
            signature
          )
      ).to.be.revertedWith("InvalidSignature");
    }
  });
  it(`Should check that user can NOT call the ExampleGatedNFTMinter with an expired signature from the signer`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

    // Build Signature
    const recipient = tester;
    const blockExpiration = 1; //let's try a block that is necessarily expired
    if (!txAuthSigner.provider) {
      throw new Error("missing provider on signer");
    }
    const { chainId: chainID } = await txAuthSigner.provider.getNetwork();
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
      blockExpiration,
    };
    const signature = await signTxAuthData(wrongTxAuthData, txAuthSigner);

    await expect(
      exampleGatedNFTMinter
        .connect(testerSigner)
        .mintNFTGated(recipient, blockExpiration, signature)
    ).to.be.revertedWith("BlockExpired");
  });
  it(`Should check that admin can change the signer`, async () => {
    const [deployer, _testerSigner, address3] = await ethers.getSigners();
    // set signer
    await exampleGatedNFTMinter.connect(deployer).setSigner(address3.address);

    const newSigner = await exampleGatedNFTMinter.getSignerAddress();
    expect(newSigner === address3.address).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const [_deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to set signer
    await expect(
      exampleGatedNFTMinter.connect(address3).setSigner(address3.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const newSigner = await exampleGatedNFTMinter.getSignerAddress();
    expect(newSigner !== address3.address).to.be.true;
  });
});
