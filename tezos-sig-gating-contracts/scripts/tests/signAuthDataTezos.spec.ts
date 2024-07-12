import { expect } from "chai";
import { deployNFTMinterSimple } from "../fixtures/fixtureGatedNftClaimer";
import { InMemorySigner } from "@taquito/signer";
import {
  MichelsonMap,
  TezosToolkit,
  TezosOperationError,
} from "@taquito/taquito";
import {
  convert_timestamp,
  convert_key,
  convert_nat,
  convert_string,
  convert_address,
  convert_chain_id,
  convert_mint,
} from "../utils/convert";
import {
  EdSignature,
  TezosTxAuthData,
  TezosTxCalldata,
  TezosTxAuthInput,
} from "../utils/schemas";

import { signTxAuthDataLibTezos } from "../utils/signTxAuthDataTezos";
import { computePayloadHash } from "../utils/computePayloadHash";

const RPC_ENDPOINT = "http://localhost:8732/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
import { RpcClient } from "@taquito/rpc";
const client = new RpcClient(RPC_ENDPOINT); //, 'NetXnofnLBXBoxo');

const nexeraSigner = new InMemorySigner(
  "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"
); // signer private key

describe(`Sign txAuthData`, function () {
  let exampleGatedNFTMinter: string | undefined;
  let deployerAddress: string;
  let currentBlock: number;
  let currentChainId: string;
  let nexeraSignerPublicKey: string;

  before(async () => {
    // SET SIGNER
    deployerAddress = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
    Tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(
        "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq"
      ),
    });
    // Retrieve Signer public key
    nexeraSignerPublicKey = await nexeraSigner.publicKey();
    // Retrieve the chainID
    currentChainId = await client.getChainId();
    // DEPLOY NFTMINTER
    exampleGatedNFTMinter = await deployNFTMinterSimple(Tezos);
    if (!exampleGatedNFTMinter)
      throw new Error("Deployment of NftMnter failed");
  });

  beforeEach(async () => {
    const block = await client.getBlockHeader();
    currentBlock = block.level;
  });

  it(`Check initial storage (the deployer is the admin of NftMinter and owns the asset #0)`, async () => {
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");
    const storage: any = await cntr.storage();
    // Verify
    const admin = await storage.admin;
    const ownerAsset0 = await storage.siggated_extension.ledger.get(0);
    const ownerAsset1 = await storage.siggated_extension.ledger.get(1);
    const ownerAsset2 = await storage.siggated_extension.ledger.get(2);
    const ownerAsset3 = await storage.siggated_extension.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset1).to.be.undefined;
    expect(ownerAsset2).to.be.undefined;
    expect(ownerAsset3).to.be.undefined;
  });

  it(`Signing test`, async () => {
    const functionCallContractAddress = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1",
    };
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const tezosTxAuthInput: TezosTxAuthInput = {
      chainID: currentChainId,
      contractAddress: functionCallContractAddress, //NFTMinterSimpleAddressForTezosGhostnet,
      functionName: "%mint_gated",
      args: functionCallArgsBytes,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
    };
    const { signature, blockExpiration } = await signTxAuthDataLibTezos(
      nexeraSigner,
      tezosTxAuthInput,
      Tezos
    );

    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 0,
      blockExpiration: currentBlock + 50,
      contractAddress: functionCallContractAddress,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let expectedSignature = await nexeraSigner.sign(payloadHash);
    expect(expectedSignature.prefixSig === signature).to.be.true;
  });
});
