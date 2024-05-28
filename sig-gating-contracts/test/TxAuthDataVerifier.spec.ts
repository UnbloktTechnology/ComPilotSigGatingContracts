import { expect } from "chai";
import hre, { getNamedAccounts, network, ethers } from "hardhat";

import { ExampleGatedNFTMinter } from "../typechain";
import {
  Address,
  signTxAuthDataLib,
  signTxAuthDataLibEthers,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { fixtureExampleGatedNFTMinter } from "../fixtures/fixtureExampleGatedNFTMinter";

import {
  ExampleGatedNFTMinterABI,
  ExampleMultipleInputsABI,
  ExampleGatedNFTMinterExternalCallABI,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/abis";
import {
  generateFunctionCallData,
  generateFunctionCallDataViem,
} from "./utils/generateFunctionCallData";
import { signTxAuthData, signTxAuthDataViem } from "./utils/signTxAuthData";
import { getContract, publicActions } from "viem";
import { fixtureExampleNFTMinter } from "../fixtures/fixtureExampleNFTMinter";
import { fixtureExampleMultipleInputs } from "../fixtures/fixtureExampleMultipleInputs";
import { deployExampleGatedNFTMinterWithEOA } from "../lib/deploy/deployExampleGatedNFTMinter";
import { Wallet } from "ethers";
import { setupThreeAccounts } from "./utils/fundAccounts";
import { fixtureExampleGatedNFTMinterExternalCall } from "../fixtures/fixtureExampleGatedNFTMinterExternalCall";

describe(`ExampleGatedNFTMinter`, function () {
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ exampleGatedNFTMinter } = await fixtureExampleGatedNFTMinter());
  });
  it(`Should check that user can call the NON GATED ExampleNFTMinter for gas comparaison purposes`, async () => {
    const { exampleNFTMinter } = await fixtureExampleNFTMinter();
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();

    const recipient = tester;

    // try to mint nft
    await exampleNFTMinter.connect(testerSigner).mintNFT(recipient);

    const tokenId = Number(await exampleNFTMinter.lastTokenId());
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleNFTMinter.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it.only(`Should check that user can call the ExampleGatedNFTMinter with a signature from the signer`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
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
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthData(txAuthData, txAuthSigner);

    const unsignedTx =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data + abiEncodedBlockExpiration.slice(2) + signature.slice(2);

    // try to mint nft
    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTMinter.address,
        data: txData,
      })
    )
      .to.emit(exampleGatedNFTMinter, "NexeraIDSignatureVerified")
      .withArgs(
        chainID,
        0,
        blockExpiration,
        exampleGatedNFTMinter.address,
        recipient,
        functionCallData as `0x${string}`
      );

    const tokenId = Number(await exampleGatedNFTMinter.lastTokenId());
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
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthDataViem(txAuthData, txAuthWalletClient);

    const unsignedTx =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data + abiEncodedBlockExpiration.slice(2) + signature.slice(2);

    // try to mint nft
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinter.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTMinter.interface.parseLog(log)
    );

    const tokenId = Number(eventsData[1].args?.tokenId);
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

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;

    // Do it a second time to make sure nonce system works

    // Build Signature

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

    // try to mint nft
    const tx2 = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinter.address,
      data: txData2,
    });

    const transactionReceipt2 = await tx2.wait();

    const eventsData2 = transactionReceipt2.logs.map((log) =>
      exampleGatedNFTMinter.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId2 = Number(eventsData2[1].args?.tokenId);
    expect(tokenId2 === 2).to.be.true;
    const tokenOwner2 = await exampleGatedNFTMinter.ownerOf(tokenId2);
    expect(tokenOwner2 === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData2[0].args?.userAddress === tester).to.be.true;
    expect(eventsData2[0].name === "NexeraIDSignatureVerified").to.be.true;
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

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;

    // Do it a second time to make sure nonce system works

    // Build Signature

    const signatureResponse2 = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
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

    // try to mint nft
    const tx2 = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinter.address,
      data: txData2,
    });

    const transactionReceipt2 = await tx2.wait();

    const eventsData2 = transactionReceipt2.logs.map((log) =>
      exampleGatedNFTMinter.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId2 = Number(eventsData2[1].args?.tokenId);
    expect(tokenId2 === 2).to.be.true;
    const tokenOwner2 = await exampleGatedNFTMinter.ownerOf(tokenId2);
    expect(tokenOwner2 === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData2[0].args?.userAddress === tester).to.be.true;
    expect(eventsData2[0].name === "NexeraIDSignatureVerified").to.be.true;
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

    // Encoding the blockExpiration (uint256) and signature (bytes)
    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(),
      32
    );

    const unsignedTx =
      await exampleGatedNFTMinterWithEOA.populateTransaction.mintNFTGated(
        recipient
      );

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinterWithEOA.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTMinterWithEOA.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinterWithEOA.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;
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
      client: { public: txAuthWalletClient },
    });
    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterABI),
      contractAddress: exampleGatedNFTMinter.address as Address,
      functionName: "mintNFTGated",
      args: [recipient],
      userAddress: tester as Address,
      chainID: await txAuthWalletClient.getChainId(),
      nonce: Number(
        await contract.read.txAuthDataUserNonce([tester as Address])
      ),
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
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

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinterExternalCall with a signature from the signer - with custom address for contract to be able to call it`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, _testerSigner, externalContract] =
      await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();
    const { exampleGatedNFTMinterExternalCall } =
      await fixtureExampleGatedNFTMinterExternalCall();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterExternalCallABI),
      contractAddress: exampleGatedNFTMinterExternalCall.address as Address,
      functionName: "mintNFTGatedWithAddress",
      args: [recipient, recipient],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );

    // Encoding the blockExpiration (uint256) and signature (bytes)
    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(),
      32
    );

    const unsignedTx =
      await exampleGatedNFTMinterExternalCall.populateTransaction.mintNFTGatedWithAddress(
        recipient,
        recipient
      );

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await externalContract.sendTransaction({
      to: exampleGatedNFTMinterExternalCall.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTMinterExternalCall.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinterExternalCall.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;
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
    const testByteString2 = "0x2244556677";

    const txAuthInput = {
      contractAbi: Array.from(ExampleMultipleInputsABI),
      contractAddress: exampleMultipleInputs.address as Address,
      functionName: "updateVariables",
      args: [testNumber, testAddress, testByteString, testByteString2],
      userAddress: tester as Address,
    };

    const signatureResponse = await signTxAuthDataLibEthers(
      txAuthSigner as unknown as Wallet,
      txAuthInput
    );

    // Encoding the blockExpiration (uint256) and signature (bytes)
    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(),
      32
    );

    const unsignedTx =
      await exampleMultipleInputs.populateTransaction.updateVariables(
        testNumber,
        testAddress,
        testByteString,
        testByteString2
      );

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleMultipleInputs.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

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

    // Encoding the blockExpiration (uint256) and signature (bytes)
    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(),
      32
    );

    const unsignedTx =
      await exampleMultipleInputs.populateTransaction.updateVariablesNoInput();

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleMultipleInputs.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

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
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    // Build Wrong Values
    const wrongValues = {
      functionCallData: await generateFunctionCallData(
        ExampleGatedNFTMinterABI,
        "mintNFTGated",
        [txAuthSigner.address]
      ), // wrong recipient value
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

      const unsignedTx =
        await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

      // Complete data
      const txData =
        unsignedTx.data +
        abiEncodedBlockExpiration.slice(2) +
        signature.slice(2);

      await expect(
        testerSigner.sendTransaction({
          to: exampleGatedNFTMinter.address,
          data: txData,
        })
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
    const testByteString2 = "0x22445566";
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
      [testNumber, testAddress, testByteString, testByteString2]
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    // Build Wrong Values
    const wrongValues = {
      functionCallData: await generateFunctionCallData(
        ExampleMultipleInputsABI,
        "updateVariables",
        [testNumber, testAddress, testByteString, testByteString2]
      ), // wrong recipient value
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

      // Encoding the blockExpiration (uint256) and signature (bytes)
      const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(blockExpiration).toHexString(),
        32
      );

      const unsignedTx =
        await exampleMultipleInputs.populateTransaction.updateVariables(
          testNumber,
          testAddress,
          testByteString,
          testByteString2
        );

      // Complete data
      const txData =
        unsignedTx.data +
        abiEncodedBlockExpiration.slice(2) +
        signature.slice(2);

      await expect(
        testerSigner.sendTransaction({
          to: exampleMultipleInputs.address,
          data: txData,
        })
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
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const wrongTxAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTMinter.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTMinter.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthData(wrongTxAuthData, txAuthSigner);

    const unsignedTx =
      await exampleGatedNFTMinter.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data + abiEncodedBlockExpiration.slice(2) + signature.slice(2);

    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTMinter.address,
        data: txData,
      })
    ).to.be.revertedWith("BlockExpired");
  });
  it(`Should check that admin can change the signer`, async () => {
    const [deployer, _testerSigner, address3] = await ethers.getSigners();
    // set signer
    await exampleGatedNFTMinter.connect(deployer).setSigner(address3.address);

    const newSigner = await exampleGatedNFTMinter.txAuthDataSignerAddress();
    expect(newSigner === address3.address).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const [_deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to set signer
    await expect(
      exampleGatedNFTMinter.connect(address3).setSigner(address3.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const newSigner = await exampleGatedNFTMinter.txAuthDataSignerAddress();
    expect(newSigner !== address3.address).to.be.true;
  });
});
