import { expect } from "chai";
import { deployNFTMinterSimple } from "../fixtures/fixtureGatedNftMinterSimple";
import { deploySignerManagerMultisig } from "../fixtures/fixtureNexeraIDSignerManagerMultisig";
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
} from "../utils/schemas";
import { buildTxCallDataNoFunctionName } from "../utils/buildTxCallData";
import { computePayloadHash } from "../utils/computePayloadHash";

const RPC_ENDPOINT = "http://localhost:20000/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
import { RpcClient } from "@taquito/rpc";
const client = new RpcClient(RPC_ENDPOINT); //, 'NetXnofnLBXBoxo');

let alice_pk = "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq";
let alice = "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb";
let bob_pk = "edsk3RFfvaFaxbHx8BMtEW1rKQcPtDML3LXjNqMNLCzC3wLC1bWbAt";
let bob = "tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6";

const nexeraSigner = new InMemorySigner(bob_pk); // signer private key

describe(`GatedNftMinterSimple with SignerManagerMultisig`, function () {
  let exampleGatedNFTMinter: string | undefined;
  let nexeraSignerManager: string | undefined;
  let deployerAddress: string;
  let currentBlock: number;
  let currentChainId: string;
  let nexeraSignerPublicKey: string;
  let nexeraSignerAddress: string;

  before(async () => {
    // SET SIGNER
    deployerAddress = alice;
    Tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(alice_pk),
    });
    // Retrieve Signer public key
    nexeraSignerPublicKey = await nexeraSigner.publicKey();
    nexeraSignerAddress = await nexeraSigner.publicKeyHash();
    // Retrieve the chainID
    currentChainId = await client.getChainId();
    // DEPLOY NFTMINTER
    exampleGatedNFTMinter = await deployNFTMinterSimple(Tezos);
    // DEPLOY SignerManager
    nexeraSignerManager = await deploySignerManagerMultisig(Tezos, alice, bob);
    // Set signerManager
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    const op = await cntr.methodsObject.setSigner(nexeraSignerManager).send();
    console.log(
      `Waiting for SetSigner on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);
  });

  beforeEach(async () => {
    const block = await client.getBlockHeader();
    currentBlock = block.level;
  });

  it(`Check initial storage`, async () => {
    const cntrSignerManager = await Tezos.contract.at(
      nexeraSignerManager ? nexeraSignerManager : ""
    );
    const storage: any = await cntrSignerManager.storage();
    // Verify
    const deployerAuth = await storage.owners.get(deployerAddress);
    const pause = await storage.pause;
    const signer = await storage.signerAddress;
    expect(deployerAuth).to.be.true;
    expect(pause === false).to.be.true;
    expect(signer === bob).to.be.true;
  });

  it(`Should mint the asset #1 (signed by Bob)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "1",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallDataNoFunctionName(
      payloadToSign,
      signature.prefixSig
    );
    // CALL contract
    const op = await cntr.methodsObject.mint_gated(args).send();
    console.log(
      `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const ownerAsset0 = await storage.siggated_extension.ledger.get(0);
    const ownerAsset1 = await storage.siggated_extension.ledger.get(1);
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset1 === functionCallArgs.owner).to.be.true;
    const userNonce = await storage.nonces.get(functionCallArgs.owner);
    expect(userNonce.toNumber() === 1).to.be.true;
  });

  it(`Should add Bob as owner in multisig`, async () => {
    const cntrSignerManager = await Tezos.contract.at(
      nexeraSignerManager ? nexeraSignerManager : ""
    );
    const op = await cntrSignerManager.methodsObject.addOwner(bob).send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const bobAuth = await storage.owners.get(bob);
    expect(bobAuth).to.be.true;
  });

  it(`Should create a proposal #0 in multisig`, async () => {
    const cntrSignerManager = await Tezos.contract.at(
      nexeraSignerManager ? nexeraSignerManager : ""
    );
    const op = await cntrSignerManager.methodsObject
      .createProposal(alice)
      .send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop0 = await storage.proposals.get(0);
    expect(prop0.signer === alice).to.be.true;
    expect(storage.pause === false).to.be.true;
  });

  it(`Should validate proposal (Alice)`, async () => {
    const cntrSignerManager = await Tezos.contract.at(
      nexeraSignerManager ? nexeraSignerManager : ""
    );
    const op = await cntrSignerManager.methodsObject
      .validateProposal([0, true])
      .send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop0 = await storage.proposals.get(0);
    expect(prop0.status.pending).to.be.any;
  });

  it(`Should prevent validate twice a proposal`, async () => {
    const cntrSignerManager = await Tezos.contract.at(
      nexeraSignerManager ? nexeraSignerManager : ""
    );
    try {
      // CALL contract
      const op = await cntrSignerManager.methodsObject
        .validateProposal([0, true])
        .send();
      expect(false).to.be.true;
      await op.confirmation(2);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("AlreadyAnswered");
        } else {
          expect(false).to.be.true;
        }
      }
    }
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop0 = await storage.proposals.get(0);
    expect(prop0.status.pending).to.be.any;
  });

  it(`Should validate proposal (Bob) and execute the proposal (Alice becomes signer)`, async () => {
    Tezos.setSignerProvider(await InMemorySigner.fromSecretKey(bob_pk));
    const cntrSignerManager = await Tezos.contract.at(
      nexeraSignerManager ? nexeraSignerManager : ""
    );
    // CALL contract
    const op = await cntrSignerManager.methodsObject
      .validateProposal([0, true])
      .send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop0 = await storage.proposals.get(0);
    expect(prop0.status.pending).to.be.undefined;
    expect(prop0.status.executed).to.be.any;
  });

  it(`Should fail to mint the asset #2 (signed by Bob)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(
      exampleGatedNFTMinter ? exampleGatedNFTMinter : ""
    );
    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      token_id: "2",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: "tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF",
      nonce: 0,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    let signature = await nexeraSigner.sign(payloadHash);
    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallDataNoFunctionName(
      payloadToSign,
      signature.prefixSig
    );
    try {
      // CALL contract
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("InvalidSigner");
        } else {
          expect(false).to.be.true;
        }
      }
    }
    // VERIFY that the mint_gated failed
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const ownerAsset0 = await storage.siggated_extension.ledger.get(0);
    const ownerAsset2 = await storage.siggated_extension.ledger.get(2);
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset2).to.be.undefined;
    const userNonce = await storage.nonces.get(functionCallArgs.owner);
    expect(userNonce.toNumber() === 1).to.be.true;
  });
});
