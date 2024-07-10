import { expect } from "chai";
import { deployNFTMinterSimple } from "../fixtures/fixtureGatedNftClaimer";
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
let frank_pk =
  "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU";
let frank = "tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2";

const nexeraSigner = new InMemorySigner(bob_pk); // signer private key

describe(`GatedNftMinterSimple with SignerManagerMultisig`, function () {
  let exampleGatedNFTMinter: string | undefined;
  let exampleGatedNFTMinterCntrl: string | undefined;
  let deployerAddress: string;
  let currentBlock: number;
  let currentChainId: string;
  let nexeraSignerPublicKey: string;
  let nexeraSignerAddress: string;
  let lastProposalId: number;

  async function mintAsset1SignedByBob(
    exampleGatedNFTMinter: string,
    currentChainId: string,
    currentBlock: number,
    nexeraSignerPublicKey: string
  ) {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

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
  }

  async function addOwnerProposal(
    exampleGatedNFTMinterCntrl: string,
    user: string
  ) {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const currentStorage: any = await cntrSignerManager.storage();
    const nextProposalId = await currentStorage.next_proposal_id;
    const op = await cntrSignerManager.methodsObject
      .createAddOwnerProposal(user)
      .send();
    await op.confirmation(2);
    // Verify
    const storageAfter: any = await cntrSignerManager.storage();
    const prop = await storageAfter.proposals.get(nextProposalId);
    expect(prop.action?.addOwner === user).to.be.true;

    const op_validate = await cntrSignerManager.methodsObject
      .validateProposal([nextProposalId, true])
      .send();
    await op_validate.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const userAuth = await storage.owners.get(user);
    expect(userAuth).to.be.true;
    return nextProposalId;
  }

  async function setTheshold(
    exampleGatedNFTMinterCntrl: string,
    threshold: number
  ) {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const currentStorage: any = await cntrSignerManager.storage();
    const nextProposalId = await currentStorage.next_proposal_id;
    const newThreshold = threshold;
    const op = await cntrSignerManager.methodsObject
      .createSetThresholdProposal(newThreshold)
      .send();
    await op.confirmation(2);

    // Verify
    const storageAfter: any = await cntrSignerManager.storage();
    const prop = await storageAfter.proposals.get(nextProposalId);
    expect(prop.action?.setThreshold.toNumber()).to.be.eq(newThreshold);

    const op_validate = await cntrSignerManager.methodsObject
      .validateProposal([nextProposalId, true])
      .send();
    await op_validate.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const currentThreshold = await storage.threshold;
    expect(currentThreshold.toNumber() === newThreshold).to.be.true;
    return nextProposalId;
  }

  async function createChangeSignerProposal(
    exampleGatedNFTMinterCntrl: string,
    newSigner: string
  ) {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const currentStorage: any = await cntrSignerManager.storage();
    const nextProposalId = await currentStorage.next_proposal_id;

    const op = await cntrSignerManager.methodsObject
      .createNewSignerProposal(newSigner)
      .send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop = await storage.proposals.get(nextProposalId);
    expect(prop.action?.changeSigner === newSigner).to.be.true;
    expect(storage.pause === false).to.be.true;
    return nextProposalId;
  }

  async function validateProposal(
    exampleGatedNFTMinterCntrl: string,
    proposalId: string
  ) {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const op = await cntrSignerManager.methodsObject
      .validateProposal([proposalId, true])
      .send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop = await storage.proposals.get(proposalId);
    expect(prop.status.pending).to.be.any;
  }

  async function validateProposalFinal(
    exampleGatedNFTMinterCntrl: string,
    proposalId: string
  ) {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const op = await cntrSignerManager.methodsObject
      .validateProposal([proposalId, true])
      .send();
    await op.confirmation(2);
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop = await storage.proposals.get(proposalId);
    expect(prop.status.executed).to.be.any;
    expect(prop.status.pending).to.be.undefined;
  }

  async function validateProposalWithError(
    exampleGatedNFTMinterCntrl: string,
    proposalId: string,
    error: string
  ) {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    try {
      // CALL contract
      const op = await cntrSignerManager.methodsObject
        .validateProposal([proposalId, true])
        .send();
      expect(false).to.be.true;
      await op.confirmation(2);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal(error);
        } else {
          expect(false).to.be.true;
        }
      }
    }
    // Verify
    const storage: any = await cntrSignerManager.storage();
    const prop = await storage.proposals.get(proposalId);
    expect(prop.status.pending).to.be.any;
  }

  beforeEach(async () => {
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
    if (!exampleGatedNFTMinter)
      throw new Error("Deployment of NftMnter failed");

    // DEPLOY SignerManager
    exampleGatedNFTMinterCntrl = await deploySignerManagerMultisig(
      Tezos,
      alice,
      bob
    );
    if (!exampleGatedNFTMinterCntrl)
      throw new Error("Deployment of SignerMananger failed");

    // Set signerManager
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    const op = await cntr.methodsObject
      .setSigner(exampleGatedNFTMinterCntrl)
      .send();
    // console.log(
    //   `Waiting for SetSigner on ${exampleGatedNFTMinter} to be confirmed...`
    // );
    await op.confirmation(2);
    // console.log("tx confirmed: ", op.hash);

    const block = await client.getBlockHeader();
    currentBlock = block.level;
  });

  it(`Check initial storage`, async () => {
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
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
    await mintAsset1SignedByBob(
      exampleGatedNFTMinter ?? "",
      currentChainId,
      currentBlock,
      nexeraSignerPublicKey
    );
  });

  it(`Should add Frank as owner in multisig`, async () => {
    const prop_id = await addOwnerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      frank
    );
  });

  it(`Should setThreshold to 2 in multisig`, async () => {
    const prop_id = await setTheshold(exampleGatedNFTMinterCntrl ?? "", 2);
  });

  it(`Should create a proposal to ChangeSigner in multisig`, async () => {
    const changeSignerPropId = await createChangeSignerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      alice
    );
  });

  it(`Alice Should validate proposal (changeSigner)`, async () => {
    const addfrankPropId = await addOwnerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      frank
    );
    const setThesholdPropId = await setTheshold(
      exampleGatedNFTMinterCntrl ?? "",
      2
    );
    const changeSignerPropId = await createChangeSignerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      alice
    );
    await validateProposal(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId
    );
  });

  it(`Should prevent validate twice a proposal`, async () => {
    const addfrankPropId = await addOwnerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      frank
    );
    const setThesholdPropId = await setTheshold(
      exampleGatedNFTMinterCntrl ?? "",
      2
    );
    const changeSignerPropId = await createChangeSignerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      alice
    );
    await validateProposal(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId
    );
    await validateProposalWithError(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId,
      "AlreadyAnswered"
    );
  });

  it(`Should validate proposal (Alice, Frank) and execute the proposal (Alice becomes signer)`, async () => {
    const addfrankPropId = await addOwnerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      frank
    );
    const setThesholdPropId = await setTheshold(
      exampleGatedNFTMinterCntrl ?? "",
      2
    );
    const changeSignerPropId = await createChangeSignerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      alice
    );
    await validateProposal(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId
    );

    // Change user (send as frank)
    Tezos.setSignerProvider(await InMemorySigner.fromSecretKey(frank_pk));
    await validateProposalFinal(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId
    );

    // Verify alice became signer role
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const storage: any = await cntrSignerManager.storage();
    const currentSigner = storage.signerAddress;
    expect(currentSigner === alice).to.be.true;
  });

  it(`Should fail to mint the asset #2 after changeSigner (message signed by Bob)`, async () => {
    // CHANGE SIGNER
    const addfrankPropId = await addOwnerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      frank
    );
    const setThesholdPropId = await setTheshold(
      exampleGatedNFTMinterCntrl ?? "",
      2
    );
    const changeSignerPropId = await createChangeSignerProposal(
      exampleGatedNFTMinterCntrl ?? "",
      alice
    );
    await validateProposal(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId
    );
    Tezos.setSignerProvider(await InMemorySigner.fromSecretKey(frank_pk));
    await validateProposalFinal(
      exampleGatedNFTMinterCntrl ?? "",
      changeSignerPropId
    );
    // Verify alice became signer role
    const cntrSignerManager = await Tezos.contract.at(
      exampleGatedNFTMinterCntrl ?? ""
    );
    const storageAfterChangeSigner: any = await cntrSignerManager.storage();
    const currentSigner = storageAfterChangeSigner.signerAddress;
    expect(currentSigner === alice).to.be.true;

    // ATTEMPT TO MINT with message signed by old signer
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");
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
      blockExpiration: currentBlock + 120,
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
        `Waiting for mint_gated on ${exampleGatedNFTMinter} to be confirmed...`
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
    expect(userNonce).to.be.undefined;
  });
});
