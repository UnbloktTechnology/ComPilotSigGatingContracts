import { expect } from "chai";
import hre, { getNamedAccounts, network, ethers } from "hardhat";

import { ExampleGatedNFTMinterUpgradeable } from "../typechain";
import {
  Address,
  signTxAuthDataLibEthers,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import { fixtureExampleGatedNFTMinterUpgradeable } from "../fixtures/fixtureExampleGatedNFTMinterUpgradeable";

import { ExampleGatedNFTMinterUpgradeableABI } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/abis";
import { signTxAuthDataLib } from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";
import {
  generateFunctionCallData,
  generateFunctionCallDataViem,
} from "./utils/generateFunctionCallData";
import { signTxAuthData, signTxAuthDataViem } from "./utils/signTxAuthData";
import { publicActions } from "viem";
import { Wallet } from "ethers";
import { setupThreeAccounts } from "./utils/fundAccounts";

describe(`ExampleGatedNFTMinterUpgradeable`, function () {
  let exampleGatedNFTMinterUpgradeable: ExampleGatedNFTMinterUpgradeable;

  beforeEach(async () => {
    await setupThreeAccounts();
    ({ exampleGatedNFTMinterUpgradeable } =
      await fixtureExampleGatedNFTMinterUpgradeable());
  });
  it(`Should not be able to be intialized twice`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();

    // try to mint nft
    expect(exampleGatedNFTMinterUpgradeable.initialize(tester)).to.revertedWith(
      "Initializable: contract is already initialized"
    );
  });
  it(`Should check that user can call the ExampleGatedNFTMinterUpgradeable with a signature from the signer`, async () => {
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
      ExampleGatedNFTMinterUpgradeableABI,
      "mintNFTGated",
      [recipient]
    );

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(),
      32
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    // Remove the placeholder for the signature
    const argsWithSelector = (functionCallData +
      abiEncodedBlockExpiration.slice(2) +
      length.slice(2)) as `0x${string}`;

    const txAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinterUpgradeable.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(
        await exampleGatedNFTMinterUpgradeable.txAuthDataUserNonce(tester)
      ),
      blockExpiration,
    };

    const signature = await signTxAuthData(txAuthData, txAuthSigner);

    const lengthSig = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(), 32
    );

    const unsignedTx = await exampleGatedNFTMinterUpgradeable.populateTransaction.mintNFTGated(
      recipient
    );

    const finalSig_ = lengthSig + signature.slice(2) + '0'.repeat(62);

    // Complete data
    const txData = unsignedTx.data + abiEncodedBlockExpiration.slice(2) + length.slice(2) + finalSig_.slice(2);

    // try to mint nft
    await testerSigner.sendTransaction({
      to: exampleGatedNFTMinterUpgradeable.address,
      data: txData,
    });

    const tokenId = Number(
      await exampleGatedNFTMinterUpgradeable.lastTokenId()
    );
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinterUpgradeable.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinterUpgradeable with a signature from the signer - with Viem`, async () => {
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
      ExampleGatedNFTMinterUpgradeableABI,
      "mintNFTGated",
      [recipient]
    );

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(),
      32
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    // Remove the placeholder for the signature
    const argsWithSelector = (functionCallData +
      abiEncodedBlockExpiration.slice(2) +
      length.slice(2)) as `0x${string}`;

    const txAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinterUpgradeable.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(
        await exampleGatedNFTMinterUpgradeable.txAuthDataUserNonce(tester)
      ),
      blockExpiration,
    };

    const signature = await signTxAuthDataViem(txAuthData, txAuthWalletClient);

    const lengthSig = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(), 32
    );

    const unsignedTx = await exampleGatedNFTMinterUpgradeable.populateTransaction.mintNFTGated(
      recipient
    );

    const finalSig_ = lengthSig + signature.slice(2) + '0'.repeat(62);

    // Complete data
    const txData = unsignedTx.data + abiEncodedBlockExpiration.slice(2) + length.slice(2) + finalSig_.slice(2);

    // try to mint nft
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinterUpgradeable.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) => exampleGatedNFTMinterUpgradeable.interface.parseLog(log));

    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinterUpgradeable.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinterUpgradeable with a signature from the signer - with lib function`, async () => {
    const { tester } = await getNamedAccounts();
    const [_, testerSigner] = await ethers.getSigners();
    const [txAuthWalletClient, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterUpgradeableABI),
      contractAddress: exampleGatedNFTMinterUpgradeable.address as Address,
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
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(), 32
    );

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(), 32
    );

    const lengthSig = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(), 32
    );

    const unsignedTx = await exampleGatedNFTMinterUpgradeable.populateTransaction.mintNFTGated(
      recipient
    );

    const finalSig_ = lengthSig + signatureResponse.signature.slice(2) + '0'.repeat(62);

    // Complete data
    const txData = unsignedTx.data + abiEncodedBlockExpiration.slice(2) + length.slice(2) + finalSig_.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinterUpgradeable.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) => exampleGatedNFTMinterUpgradeable.interface.parseLog(log));

    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinterUpgradeable.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be
      .true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified")
      .to.be.true;
  });
  it(`Should check that user can call the ExampleGatedNFTMinterUpgradeable with a signature from the signer -  with custom address for contract to be able to call it`, async () => {
    const { tester } = await getNamedAccounts();
    const [txAuthSigner, testerSigner] = await ethers.getSigners();
    const [_, ___] = await hre.viem.getWalletClients();

    // Build Signature
    const recipient = tester;

    const txAuthInput = {
      contractAbi: Array.from(ExampleGatedNFTMinterUpgradeableABI),
      contractAddress: exampleGatedNFTMinterUpgradeable.address as Address,
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
      ethers.BigNumber.from(signatureResponse.blockExpiration).toHexString(), 32
    );

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(), 32
    );

    const lengthSig = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(), 32
    );

    const unsignedTx = await exampleGatedNFTMinterUpgradeable.populateTransaction.mintNFTGatedWithAddress(
      recipient,
      recipient
    );

    const finalSig_ = lengthSig + signatureResponse.signature.slice(2) + '0'.repeat(62);

    // Complete data
    const txData = unsignedTx.data + abiEncodedBlockExpiration.slice(2) + length.slice(2) + finalSig_.slice(2);

    // Send tx
    const tx = await testerSigner.sendTransaction({
      to: exampleGatedNFTMinterUpgradeable.address,
      data: txData,
    });

    const transactionReceipt = await tx.wait();

    const eventsData = transactionReceipt.logs.map((log) => exampleGatedNFTMinterUpgradeable.interface.parseLog(log));

    const tokenId = Number(eventsData[1].args?.tokenId);
    expect(tokenId === 1).to.be.true;
    const tokenOwner = await exampleGatedNFTMinterUpgradeable.ownerOf(tokenId);
    expect(tokenOwner === tester).to.be.true;

    // Also check for signagure verified emitted event
    expect(eventsData[0].args?.userAddress === tester).to.be
      .true;
    expect(eventsData[0].name === "NexeraIDSignatureVerified")
      .to.be.true;
  });
  it(`Should check that user can NOT call the ExampleGatedNFTMinterUpgradeable with a wrong signature from the signer`, async () => {
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
      ExampleGatedNFTMinterUpgradeableABI,
      "mintNFTGated",
      [recipient]
    );

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(),
      32
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    // Remove the placeholder for the signature
    const argsWithSelector = (functionCallData +
      abiEncodedBlockExpiration.slice(2) +
      length.slice(2)) as `0x${string}`;

    const txAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinterUpgradeable.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(
        await exampleGatedNFTMinterUpgradeable.txAuthDataUserNonce(tester)
      ),
      blockExpiration,
    };

    // Build Wrong Values
    const wrongValues = {
      functionCallData: (
        await generateFunctionCallData(
          ExampleGatedNFTMinterUpgradeableABI,
          "mintNFTGated",
          [txAuthSigner.address]
        )
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


      const lengthSig = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(65).toHexString(), 32
      );

      const unsignedTx = await exampleGatedNFTMinterUpgradeable.populateTransaction.mintNFTGated(
        recipient
      );

      const finalSig_ = lengthSig + signature.slice(2) + '0'.repeat(62);

      // Complete data
      const txData = unsignedTx.data + abiEncodedBlockExpiration.slice(2) + length.slice(2) + finalSig_.slice(2);

      // try to mint nft
      await expect(testerSigner.sendTransaction({
        to: exampleGatedNFTMinterUpgradeable.address,
        data: txData,
      })
      ).to.be.revertedWith("InvalidSignature");
    }
  });
  it(`Should check that user can NOT call the ExampleGatedNFTMinterUpgradeable with an expired signature from the signer`, async () => {
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
      ExampleGatedNFTMinterUpgradeableABI,
      "mintNFTGated",
      [recipient]
    );

    const length = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(96).toHexString(),
      32
    );

    const abiEncodedBlockExpiration = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(blockExpiration).toHexString(),
      32
    );

    // Remove the placeholder for the signature
    const argsWithSelector = (functionCallData +
      abiEncodedBlockExpiration.slice(2) +
      length.slice(2)) as `0x${string}`;

    const wrongTxAuthData = {
      functionCallData: argsWithSelector,
      contractAddress: exampleGatedNFTMinterUpgradeable.address as Address,
      userAddress: tester as Address,
      chainID,
      nonce: Number(
        await exampleGatedNFTMinterUpgradeable.txAuthDataUserNonce(tester)
      ),
      blockExpiration: 0,
    };

    const signature = await signTxAuthData(wrongTxAuthData, txAuthSigner);

    const lengthSig = ethers.utils.hexZeroPad(
      ethers.BigNumber.from(65).toHexString(), 32
    );

    const unsignedTx = await exampleGatedNFTMinterUpgradeable.populateTransaction.mintNFTGated(
      recipient
    );

    const finalSig_ = lengthSig + signature.slice(2) + '0'.repeat(62);

    // Complete data
    const txData = unsignedTx.data + abiEncodedBlockExpiration.slice(2) + length.slice(2) + finalSig_.slice(2);

    // try to mint nft
    await expect(
      testerSigner.sendTransaction({
        to: exampleGatedNFTMinterUpgradeable.address,
        data: txData,
      })
    ).to.be.revertedWith("InvalidSignature");
  });
  it(`Should check that admin can change the signer`, async () => {
    const [deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to mint nft
    await exampleGatedNFTMinterUpgradeable
      .connect(deployer)
      .setSigner(address3.address);

    const newSigner =
      await exampleGatedNFTMinterUpgradeable.txAuthDataSignerAddress();
    expect(newSigner === address3.address).to.be.true;
  });
  it(`Should check that non-admin can NOT change the signer`, async () => {
    const [_deployer, _testerSigner, address3] = await ethers.getSigners();
    // try to mint nft
    try {
      await exampleGatedNFTMinterUpgradeable
        .connect(address3)
        .setSigner(address3.address);
    } catch (e) {
      expect((e as Error).toString().substring(0, 112)).to.eq(
        "Error: VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'"
      );
    }

    const newSigner =
      await exampleGatedNFTMinterUpgradeable.txAuthDataSignerAddress();
    expect(newSigner !== address3.address).to.be.true;
  });
});
