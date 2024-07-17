import { expect } from "chai";
import { deployNFTMinterSimple } from "../fixtures/fixtureGatedNftClaimer";
import { InMemorySigner } from "@taquito/signer";
import {
  MichelsonMap,
  PollingSubscribeProvider,
  TezosToolkit,
  TezosOperationError,
  ContractAbstraction,
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

const RPC_ENDPOINT = "http://localhost:8732/"; //"http://localhost:20000/";

const Tezos = new TezosToolkit(RPC_ENDPOINT);
import {
  InternalOperationResult,
  MichelsonV1Expression,
  MichelsonV1ExpressionExtended,
  OpKind,
  RpcClient,
} from "@taquito/rpc";
import {
  prefix,
  b58cencode,
  encodeAddress,
  encodeKey,
  encodePubKey,
} from "@taquito/utils";
import {
  BytesLiteral,
  IntLiteral,
  MichelsonType,
  Parser,
  StringLiteral,
  unpackDataBytes,
} from "@taquito/michel-codec";
const client = new RpcClient(RPC_ENDPOINT); //, 'NetXnofnLBXBoxo');

import {
  NEXERAID_SIGNER_SK,
  DEPLOYER_SK,
  DEPLOYER_PK,
  USER_1_PK,
} from "./testAddresses";

const nexeraSigner = new InMemorySigner(NEXERAID_SIGNER_SK); // signer private key

describe(`GatedNftClaimer`, function () {
  let exampleGatedNFTMinter: string | undefined;
  let deployerAddress: string;
  let currentBlock: number;
  let currentChainId: string;
  let nexeraSignerPublicKey: string;

  before(async () => {
    // SET SIGNER
    deployerAddress = DEPLOYER_PK;
    Tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(DEPLOYER_SK),
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

  function decodeMintEvent(data: InternalOperationResult) {
    try {
      // console.log(data);
      const types = data.type as MichelsonV1ExpressionExtended;
      const payloads = data.payload as MichelsonV1Expression[];
      // CHAIN ID
      const decodedChainId = b58cencode(
        (payloads.at(0) as BytesLiteral).bytes,
        prefix.Net
      );
      // USER ADDRESS
      const decodedUserAddress = encodeAddress(
        (payloads.at(1) as BytesLiteral).bytes
      );
      // NONCE
      const decodedNonce = (payloads.at(2) as IntLiteral).int;
      // EXPIRATION
      const decodedExpiration = (payloads.at(3) as IntLiteral).int;
      // SIGNER KEY
      const key_encrypted = (payloads.at(4) as BytesLiteral).bytes;
      const decodedSignerKey = encodeKey(key_encrypted);
      // CONTRACT ADDESS
      const decodedContract = encodeAddress(
        (payloads.at(5) as BytesLiteral).bytes
      );
      // FUNCTION NAME
      const decodedFunctionName = (payloads.at(6) as StringLiteral).string;
      // ARGS
      const decodedArgs = unpackDataBytes(
        payloads.at(7) as BytesLiteral,
        types.args?.at(7) as MichelsonType
      );
      const decodedArgsTyped = decodedArgs as MichelsonV1ExpressionExtended;
      const decodedFunctionArgs = {};
      const decodedFunctionArgsOwner = encodeAddress(
        (decodedArgsTyped?.args?.at(0) as BytesLiteral).bytes
      );
      const decodedFunctionArgsTokenId = (
        decodedArgsTyped?.args?.at(1) as IntLiteral
      ).int;
      // const decodedFunctionArgsTokenIdName = decodedArgsTyped?.annots?.at(1); // TODO
      return {
        chainID: decodedChainId,
        userAddress: decodedUserAddress,
        nonce: decodedNonce,
        blockExpiration: decodedExpiration,
        contractAddress: decodedContract,
        functionCallName: decodedFunctionName,
        functionCallArgs: {
          owner: decodedFunctionArgsOwner,
          token_id: decodedFunctionArgsTokenId,
        },
        signerPublicKey: decodedSignerKey,
      };
    } catch (err) {
      console.log(err);
    }
  }

  it(`Should mint the asset #1`, async () => {
    // Get contract
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");
    // Get contract storage
    const currentStorage: any = await cntr.storage();
    const nextAssetId =
      currentStorage.siggated_extension.extension.lastMinted.toNumber() + 1;

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: nextAssetId.toString(), //"1",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
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
      `Waiting for mint_gated on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // Retrieve Events produced by the transaction
    for (var opResult of op.operationResults) {
      const internalOperationResults = opResult.metadata
        .internal_operation_results as InternalOperationResult[];
      for (var internalOpResult of internalOperationResults) {
        if (
          internalOpResult.kind === OpKind.EVENT &&
          internalOpResult.tag === "SignatureVerified" &&
          internalOpResult.source === exampleGatedNFTMinter
        ) {
          const evt = decodeMintEvent(internalOpResult);
          // VERIFY
          expect(evt).to.be.any;
          if (evt) {
            expect(evt.chainID === payloadToSign.chainID).to.be.true;
            expect(evt.userAddress === payloadToSign.userAddress).to.be.true;
            expect(evt.nonce === payloadToSign.nonce.toString()).to.be.true;
            expect(
              evt.blockExpiration === payloadToSign.blockExpiration.toString()
            ).to.be.true;
            expect(evt.contractAddress === payloadToSign.contractAddress).to.be
              .true;
            expect(evt.functionCallName === payloadToSign.functionCallName).to
              .be.true;
            expect(evt.functionCallArgs.owner === functionCallArgs.owner).to.be
              .true;
            expect(evt.functionCallArgs.token_id === functionCallArgs.token_id)
              .to.be.true;
            expect(evt.signerPublicKey === payloadToSign.signerPublicKey).to.be
              .true;
            console.log("Event received and verified");
          }
        }
      }
    }

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const ownerAsset0 = await storage.siggated_extension.ledger.get(0);
    const ownerAsset1 = await storage.siggated_extension.ledger.get(
      nextAssetId
    );
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset1 === functionCallArgs.owner).to.be.true;
    const userNonce = await storage.nonces.get(functionCallArgs.owner);
    expect(userNonce.toNumber() === 1).to.be.true;
  });

  it(`Attempt to replay mint #1 should fail`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "1",
    };

    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
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
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an unmatching calldata (arguments)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "1",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const functionCallArgsBytesInvalid = convert_mint(
      functionCallArgs.owner,
      "2"
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
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
    args.functionArgs = functionCallArgsBytesInvalid;
    try {
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect expiration`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "2",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
      nonce: 1,
      blockExpiration: 1,
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
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log("op: ", op);
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("BlockExpired");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect signature`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "2",
    };
    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%mint_gated",
      functionCallArgs: functionCallArgsBytes,
      signerPublicKey: nexeraSignerPublicKey,
    };
    const payloadHash = computePayloadHash(payloadToSign);
    // Nexera signs Hash of payload
    // let signature = await nexeraSigner.sign(payloadHash);
    let signature_raw =
      "edsigtcjNvuDj6sfUL9u3Ma4Up3zfiZiPM2gzwDC3Vk1324SJzaGTbVwtdmdJ5q9UbD9qnKm9jdzytFqjSSt54oLY61XuB2mSW5";

    // Execute mint-offchain entrypoint
    const args: TezosTxCalldata = buildTxCallDataNoFunctionName(
      payloadToSign,
      signature_raw
    );
    try {
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log("op: ", op);
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        expect(err.message).to.be.equal("InvalidSignature");
      } else {
        expect(false).to.be.true;
      }
    }
  });

  it(`Should fail when providing an incorrect calldata (entrypoint)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";

    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "2",
    };

    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
      nonce: 1,
      blockExpiration: currentBlock + 10,
      contractAddress: functionCallContract,
      functionCallName: "%foobar",
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
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log("op: ", op);
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("InvalidSignature");
        } else {
          expect(false).to.be.true;
        }
      }
    }
  });

  it(`Should fail when providing an incorrect calldata (target contract)`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = "KT1HUduHHW7mLAdkefzRuMhEFjdomuDNDskk"; // wrong address
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "2",
    };

    // Provide a different calldata arguments
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    // Prepare Hash of payload
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
      nonce: 1,
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
      const op = await cntr.methodsObject.mint_gated(args).send();
      expect(false).to.be.true;
      console.log("op: ", op);
      console.log(
        `Waiting for Exec_gated_calldata on ${exampleGatedNFTMinter} to be confirmed...`
      );
      await op.confirmation(2);
      console.log("tx confirmed: ", op.hash);
    } catch (err) {
      if (err instanceof TezosOperationError) {
        if (err instanceof TezosOperationError) {
          expect(err.message).to.be.equal("InvalidSignature");
        } else {
          expect(false).to.be.true;
        }
      }
    }
  });

  it(`Should mint the asset #2`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "2",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
      nonce: 1,
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
      `Waiting for mint_gated on ${exampleGatedNFTMinter} to be confirmed...`
    );
    await op.confirmation(2);
    console.log("tx confirmed: ", op.hash);

    // VERIFY
    const storage: any = await cntr.storage();
    const admin = await storage.admin;
    const ownerAsset0 = await storage.siggated_extension.ledger.get(0);
    const ownerAsset1 = await storage.siggated_extension.ledger.get(1);
    const ownerAsset2 = await storage.siggated_extension.ledger.get(2);
    // const ownerAsset3 = await storage.ledger.get(3);
    expect(deployerAddress === admin).to.be.true;
    expect(ownerAsset0 === deployerAddress).to.be.true;
    expect(ownerAsset1 === functionCallArgs.owner).to.be.true;
    expect(ownerAsset2 === functionCallArgs.owner).to.be.true;

    const userNonce = await storage.nonces.get(functionCallArgs.owner);
    // console.log("userNonce=", userNonce);
    expect(userNonce.toNumber() === 2).to.be.true;
  });

  it(`Estimate mint the asset #3`, async () => {
    // Get contract storage
    const cntr = await Tezos.contract.at(exampleGatedNFTMinter ?? "");

    // MINT OFFCHAIN
    const functionCallContract = exampleGatedNFTMinter
      ? exampleGatedNFTMinter
      : "";
    const functionCallArgs = {
      owner: USER_1_PK,
      token_id: "3",
    };
    // Prepare Hash of payload
    const functionCallArgsBytes = convert_mint(
      functionCallArgs.owner,
      functionCallArgs.token_id
    );
    const payloadToSign: TezosTxAuthData = {
      chainID: currentChainId,
      userAddress: USER_1_PK,
      nonce: 2,
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
    let preOp1 = await cntr.methodsObject.mint_gated(args);
    let estOp1 = await Tezos.estimate.contractCall(preOp1);
    console.log("extimation exec_gated_calldata=", estOp1.totalCost);
  });
});
