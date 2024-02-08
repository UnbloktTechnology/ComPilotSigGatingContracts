import { expect } from "chai";
import { getNamedAccounts, network, ethers } from "hardhat";

import { ExampleGatedNFTMinter } from "../../typechain";
import { Address } from "../../lib/schemas";
import { fixtureExampleGatedNFTMinter } from "../../fixtures/fixtureExampleGatedNFTMinter";

import { Abi, encodeFunctionData } from "viem";
import { ExampleGatedNFTMinterABI } from "@nexeraprotocol/nexera-id-contracts-sdk/abis";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Interface } from "ethers/lib/utils";
//import exampleGatedNFTMinterInfo from "../../artifacts/contracts/gatedExamples/ExampleGatedNFTMinter.sol/ExampleGatedNFTMinter.json";

interface TxAuthData {
  functionCallData: string;
  contractAddress: Address;
  userAddress: Address;
  chainID: number;
  nonce: number;
  blockExpiration: number;
}

// Generating functionCallData with viem
async function generateFunctionCallDataViem(
  contractAbi: Abi,
  functionName: string,
  args: any[]
) {
  const functionCallData = encodeFunctionData({
    abi: contractAbi,
    functionName,
    args,
  });
  return functionCallData;
}

// Generating functionCallData with ethers
async function generateFunctionCallData(
  contractAbi: any,
  functionName: string,
  args: any[]
) {
  const contractInterface = new ethers.utils.Interface(contractAbi);
  const functionCallData = contractInterface.encodeFunctionData(
    functionName,
    args
  );
  return functionCallData;
}

// generate function data as a concat of functionName and args (for the mint function)
async function generateMintFunctionData(recipient: Address) {
  const functionDataBytes32 = ethers.utils.formatBytes32String("mintNFTBasic");

  return ethers.utils.solidityPack(
    ["bytes32", "address"],
    [functionDataBytes32, recipient]
  );
}

async function signTxAuthData(
  txAuthData: TxAuthData,
  signer: SignerWithAddress
) {
  const messageHash = ethers.utils.solidityKeccak256(
    ["bytes", "address", "address", "uint256", "uint256", "uint256"],
    [
      txAuthData.functionCallData,
      txAuthData.contractAddress,
      txAuthData.userAddress,
      txAuthData.chainID,
      txAuthData.nonce,
      txAuthData.blockExpiration,
    ]
  );
  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );
  return signature;
}

describe.only(`ExampleGatedNFTMinter`, function () {
  let exampleGatedNFTMinter: ExampleGatedNFTMinter;

  beforeEach(async () => {
    ({ exampleGatedNFTMinter } = await fixtureExampleGatedNFTMinter());
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
    await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTBasic(tester, signature, blockExpiration);
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
      ExampleGatedNFTMinterABI,
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
    await exampleGatedNFTMinter
      .connect(testerSigner)
      .mintNFTOpti(recipient, blockExpiration, signature);
  });
});
