import { expect } from "chai";
import hre, { getNamedAccounts, ethers } from "hardhat";

import { ExampleGatedNFTFacet } from "../typechain";
import {
  Address,
  signTxAuthDataLib,
  signTxAuthDataLibEthers,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { fixtureExampleDiamond } from "../fixtures/fixtureExampleDiamond";

import {
  ExampleGatedNFTFacetABI,
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
//import { fixtureExampleGatedNFTMinterExternalCall } from "../fixtures/fixtureExampleGatedNFTMinterExternalCall";

describe.only(`ExampleGatedNFTFacet`, function () {
  let exampleGatedNFTDiamond: ExampleGatedNFTFacet;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ exampleGatedNFTDiamond } = await fixtureExampleDiamond());
  });
  it(`Should check that user can call the ExampleGatedNFTDiamond with a signature from the signer`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);

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
      ExampleGatedNFTFacetABI,
      "mintNFTGated",
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTDiamond.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTDiamond.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthData(txAuthData, txAuthSigner);

    const unsignedTx =
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data + abiEncodedBlockExpiration.slice(2) + signature.slice(2);

    // try to mint nft
    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTDiamond.address,
        data: txData,
      })
    )
      .to.emit(exampleGatedNFTDiamond, "NexeraIDSignatureVerified")
      .withArgs(
        chainID,
        0,
        blockExpiration,
        exampleGatedNFTDiamond.address,
        recipient,
        functionCallData as `0x${string}`
      );

    const tokenId = Number(await exampleGatedNFTDiamond.lastTokenId());
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTDiamond.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTDiamond with a signature from the signer - with Viem`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthWalletClient = await hre.viem.getWalletClient(
      txAuthSignerAddress as Address
    );

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
      ExampleGatedNFTFacetABI,
      "mintNFTGated",
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTDiamond.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTDiamond.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthDataViem(txAuthData, txAuthWalletClient);

    const unsignedTx =
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data + abiEncodedBlockExpiration.slice(2) + signature.slice(2);

    // try to mint nft
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamond.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTDiamond.interface.parseLog(log)
    );

    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTDiamond.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTDiamond with a signature from the signer - with viem lib function`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthWalletClient = await hre.viem.getWalletClient(
      txAuthSignerAddress as Address
    );
    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTFacetABI),
      contractAddress: exampleGatedNFTDiamond.address as Address,
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
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamond.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTDiamond.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTDiamond.ownerOf(tokenId);
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
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData2 =
      unsignedTx2.data +
      abiEncodedBlockExpiration2.slice(2) +
      signatureResponse2.signature.slice(2);

    // try to mint nft
    const tx2 = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamond.address,
      data: txData2,
    });

    const transactionReceipt2 = await tx2.wait();

    const eventsData2 = transactionReceipt2.logs.map((log) =>
      exampleGatedNFTDiamond.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId2 = Number(eventsData2[1].args?.tokenId);
    expect(tokenId2 === 2).to.be.true;
    const tokenOwner2 = await exampleGatedNFTDiamond.ownerOf(tokenId2);
    expect(tokenOwner2 === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData2[0].args?.userAddress === tester).to.be.true;
    expect(eventsData2[0].name === "NexeraIDSignatureVerified").to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTDiamond with a signature from the signer - with ethers lib function`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTFacetABI),
      contractAddress: exampleGatedNFTDiamond.address as Address,
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
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamond.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTDiamond.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTDiamond.ownerOf(tokenId);
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
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData2 =
      unsignedTx2.data +
      abiEncodedBlockExpiration2.slice(2) +
      signatureResponse2.signature.slice(2);

    // try to mint nft
    const tx2 = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamond.address,
      data: txData2,
    });

    const transactionReceipt2 = await tx2.wait();

    const eventsData2 = transactionReceipt2.logs.map((log) =>
      exampleGatedNFTDiamond.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId2 = Number(eventsData2[1].args?.tokenId);
    expect(tokenId2 === 2).to.be.true;
    const tokenOwner2 = await exampleGatedNFTDiamond.ownerOf(tokenId2);
    expect(tokenOwner2 === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData2[0].args?.userAddress === tester).to.be.true;
    expect(eventsData2[0].name === "NexeraIDSignatureVerified").to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTDiamond with a signature from the signer - with EOA signer instead of SignerManager`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);

    // Deploy manually another NFT minter but using EOA instead of SignerManager smart contract as signer
    const exampleGatedNFTDiamondWithEOA =
      await deployExampleGatedNFTMinterWithEOA();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTFacetABI),
      contractAddress: exampleGatedNFTDiamondWithEOA.address as Address,
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
      await exampleGatedNFTDiamondWithEOA.populateTransaction.mintNFTGated(
        recipient
      );

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamondWithEOA.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTDiamondWithEOA.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTDiamondWithEOA.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTDiamond with a signature from the signer - custom nonce and chainId`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);
    const txAuthWalletClient = await hre.viem.getWalletClient(
      txAuthSignerAddress as Address
    );
    // Build Signature
    const recipient = tester;

    // here the idea is to provide the chainId and nonce, as it would be used by devs who want to test our api with a local testnet
    const contract = getContract({
      address: exampleGatedNFTDiamond.address as Address,
      abi: ExampleGatedNFTFacetABI,
      client: { public: txAuthWalletClient },
    });
    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTFacetABI),
      contractAddress: exampleGatedNFTDiamond.address as Address,
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
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data +
      abiEncodedBlockExpiration.slice(2) +
      signatureResponse.signature.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTDiamond.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) =>
      exampleGatedNFTDiamond.interface.parseLog(log)
    );

    // Check new minted token id
    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTDiamond.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be.true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;
  });
  //   it(`Should check that user can call the ExampleGatedNFTDiamondExternalCall with a signature from the signer - with custom address for contract to be able to call it`, async () => {
  //     const { tester, txAuthSignerAddress, externalContract } =
  //       await getNamedAccounts();
  //     const testerSigner = await ethers.getSigner(tester);
  //     const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);
  //     const externalContractSigner = await ethers.getSigner(externalContract);

  //     const { exampleGatedNFTDiamondExternalCall } =
  //       await fixtureExampleGatedNFTMinterExternalCall();

  //     // Build Signature
  //     const recipient = tester;

  //     const txAuthInput = {
  //       contractAbi: Array.from(ExampleGatedNFTMinterExternalCallABI),
  //       contractAddress: exampleGatedNFTDiamondExternalCall.address as Address,
  //       functionName: "mintNFTGatedWithAddress",
  //       args: [recipient, recipient],
  //       userAddress: tester as Address,
  //     };

  //     const signatureResponse = await signTxAuthDataLibEthers(
  //       txAuthSigner as unknown as Wallet,
  //       txAuthInput
  //     );

  //     // Encoding the blockExpiration (uint256) and signature (bytes)
  //     const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
  //       ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(),
  //       32
  //     );

  //     const unsignedTx =
  //       await exampleGatedNFTDiamondExternalCall.populateTransaction.mintNFTGatedWithAddress(
  //         recipient,
  //         recipient
  //       );

  //     // Complete data
  //     const txData =
  //       unsignedTx.data +
  //       abiEncodedBlockExpiration.slice(2) +
  //       signatureResponse.signature.slice(2);

  //     // Send tx
  //     const tx = await externalContractSigner.sendTransaction({
  //       to: exampleGatedNFTDiamondExternalCall.address,
  //       data: txData,
  //     });

  //     const transactionReceipt = await tx.wait();

  //     const eventsData = transactionReceipt.logs.map((log) =>
  //       exampleGatedNFTDiamondExternalCall.interface.parseLog(log)
  //     );

  //     // Check new minted token id
  //     const tokenId = Number(eventsData[1].args?.tokenId);
  //     expect(tokenId === 1).to.be.true;
  //     const tokenOwner = await exampleGatedNFTDiamondExternalCall.ownerOf(
  //       tokenId
  //     );
  //     expect(tokenOwner === tester).to.be.true;

  //     // Also check for signagure verified emitted event
  //     expect(eventsData[0].args?.userAddress === tester).to.be.true;
  //     expect(eventsData[0].name === "NexeraIDSignatureVerified").to.be.true;
  //   });
  it(`Should check that user can call the ExampleMultipleInputs - multiple input with bytes - with a signature from the signer - with lib function`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);
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

    await tx.wait();

    const bytesVariable = await exampleMultipleInputs.getBytesVariable();
    expect(testByteString === bytesVariable).to.be.true;
  });
  it(`Should check that user can call the ExampleMultipleInputs - no input - with a signature from the signer - with lib function`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);
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
  it(`Should check that user can NOT call the ExampleGatedNFTDiamond with a wrong signature from the signer`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);

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
      ExampleGatedNFTFacetABI,
      "mintNFTGated",
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const txAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTDiamond.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTDiamond.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    // Build Wrong Values
    const wrongValues = {
      functionCallData: await generateFunctionCallData(
        ExampleGatedNFTFacetABI,
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
        txAuthSigner
      );

      const unsignedTx =
        await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(
          recipient
        );

      // Complete data
      const txData =
        unsignedTx.data +
        abiEncodedBlockExpiration.slice(2) +
        signature.slice(2);

      await expect(
        testerSigner.sendTransaction({
          to: exampleGatedNFTDiamond.address,
          data: txData,
        })
      ).to.be.revertedWith("InvalidSignature");
    }
  });
  it(`Should check that user can NOT call the ExampleMultipleInputs with a wrong signature from the signer`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);
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
      contractAddress: exampleGatedNFTDiamond.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTDiamond.txAuthDataUserNonce(tester)),
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
        txAuthSigner
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
  it(`Should check that user can NOT call the ExampleGatedNFTDiamond with an expired signature from the signer`, async () => {
    const { tester, txAuthSignerAddress } = await getNamedAccounts();
    const testerSigner = await ethers.getSigner(tester);
    const txAuthSigner = await ethers.getSigner(txAuthSignerAddress);

    // Build Signature
    const recipient = tester;
    const blockExpiration = 1; //let's try a block that is necessarily expired
    if (!txAuthSigner.provider) {
      throw new Error("missing provider on signer");
    }
    const { chainId: chainID } = await txAuthSigner.provider.getNetwork();
    // encode function data with a fake value for the signature
    const functionCallData = await generateFunctionCallData(
      ExampleGatedNFTFacetABI,
      "mintNFTGated",
      [recipient]
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    const wrongTxAuthData = {
      functionCallData: functionCallData as `0x${string}`,
      contractAddress: exampleGatedNFTDiamond.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(await exampleGatedNFTDiamond.txAuthDataUserNonce(tester)),
      blockExpiration,
    };

    const signature = await signTxAuthData(wrongTxAuthData, txAuthSigner);

    const unsignedTx =
      await exampleGatedNFTDiamond.populateTransaction.mintNFTGated(recipient);

    // Complete data
    const txData =
      unsignedTx.data + abiEncodedBlockExpiration.slice(2) + signature.slice(2);

    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTDiamond.address,
        data: txData,
      })
    ).to.be.revertedWith("BlockExpired");
  });
  it(`Should check that admin can change the signer`, async () => {
    const { tester2, deployer } = await getNamedAccounts();
    const deployerSigner = await ethers.getSigner(deployer);
    // set signer
    await exampleGatedNFTDiamond.connect(deployerSigner).setSigner(tester2);

    const newSigner = await exampleGatedNFTDiamond.txAuthDataSignerAddress();
    expect(newSigner === tester2).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const { tester2 } = await getNamedAccounts();
    const tester2Signer = await ethers.getSigner(tester2);
    // try to set signer
    await expect(
      exampleGatedNFTDiamond.connect(tester2Signer).setSigner(tester2)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    const newSigner = await exampleGatedNFTDiamond.txAuthDataSignerAddress();
    expect(newSigner !== tester2).to.be.true;
  });
});
