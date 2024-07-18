import { TezosToolkit, PollingSubscribeProvider } from "@taquito/taquito";
import { b58cencode, encodeAddress, encodeKey, prefix } from "@taquito/utils";
import nftMinterAddress from "../../deployments/nftminter";
import {
  InternalOperationResult,
  MichelsonV1Expression,
  MichelsonV1ExpressionExtended,
} from "@taquito/rpc";
import {
  BytesLiteral,
  IntLiteral,
  MichelsonType,
  StringLiteral,
  unpackDataBytes,
} from "@taquito/michel-codec";

const RPC_ENDPOINT = "http://localhost:8732/"; //"https://rpc.ghostnet.teztnets.com/";

function processEvent(data: InternalOperationResult) {
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
    const result = {
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
    console.log("Decoded mint event", result);
  } catch (err) {
    console.log(err);
  }
}

async function main(contractAddress: string) {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);

  Tezos.setStreamProvider(
    Tezos.getFactory(PollingSubscribeProvider)({
      shouldObservableSubscriptionRetry: true,
      pollingIntervalMilliseconds: 1500,
    })
  );

  try {
    const sub = Tezos.stream.subscribeEvent({
      tag: "SignatureVerified",
      // address: contractAddress,
      excludeFailedOperations: true,
    });
    sub.on("data", processEvent);
  } catch (e) {
    console.log(e);
  }
}

main(nftMinterAddress);
