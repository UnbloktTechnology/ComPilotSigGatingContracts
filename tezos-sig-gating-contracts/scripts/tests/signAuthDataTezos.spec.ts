import { expect } from "chai";
import { deployNFTMinterExt } from "../fixtures/fixtureExtendedGatedNftMinter";
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

const RPC_ENDPOINT = "http://localhost:20000/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
import { RpcClient } from "@taquito/rpc";
const client = new RpcClient(RPC_ENDPOINT); //, 'NetXnofnLBXBoxo');

const createKeccakHash = require("keccak");

function keccak256(data: string) {
  return createKeccakHash("keccak256").update(data, "hex").digest("hex");
}

const nexeraSigner = new InMemorySigner(
  "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt"
); // signer private key

function computePayloadHash(payload: TezosTxAuthData) {
  const nonce_string = payload.nonce.toString();
  const expiration_string = payload.blockExpiration.toString();

  const chain_id_bytes = convert_chain_id(payload.chainID);
  const user_bytes = convert_address(payload.userAddress);
  const functioncall_contract_bytes = convert_address(payload.contractAddress);
  const functioncall_name_bytes = convert_string(payload.functionCallName);
  const functionCallArgsBytes = payload.functionCallArgs;
  const nonce_bytes = convert_nat(nonce_string);
  const expiration_bytes = convert_nat(expiration_string);
  const key_bytes = convert_key(payload.signerPublicKey);
  const payload_bytes =
    key_bytes +
    chain_id_bytes +
    user_bytes +
    nonce_bytes +
    expiration_bytes +
    functioncall_contract_bytes +
    functioncall_name_bytes +
    functionCallArgsBytes;
  const payloadHash = keccak256(payload_bytes);
  return payloadHash;
}

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
    exampleGatedNFTMinter = await deployNFTMinterExt(Tezos);
  });

  beforeEach(async () => {
    const block = await client.getBlockHeader();
    currentBlock = block.level;
  });

  it(`Check initial storage (the deployer is the admin of NftMinter and owns the asset #0)`, async () => {
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );
    const storage: any = await cntr.storage();
    // Verify
    const admin = await storage.admin;
    const asset0_owner = await storage.siggated_extension.ledger.get(0);
    const asset1_owner = await storage.siggated_extension.ledger.get(1);
    const asset2_owner = await storage.siggated_extension.ledger.get(2);
    const asset3_owner = await storage.siggated_extension.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(asset0_owner === deployerAddress).to.be.true;
    expect(asset1_owner).to.be.undefined;
    expect(asset2_owner).to.be.undefined;
    expect(asset3_owner).to.be.undefined;
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
      contractAddress: functionCallContractAddress, //ExtendedGatedNFTMinterAddress_tezos_ghostnet_dev,
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
