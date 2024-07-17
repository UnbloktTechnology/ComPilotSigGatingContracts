import { InMemorySigner } from "@taquito/signer";
import { TezosToolkit, PollingSubscribeProvider } from "@taquito/taquito";
import {
  bytesToString,
  char2Bytes,
  encodeAddress,
  encodeKey,
  encodePubKey,
} from "@taquito/utils";
import { NFTClaimerAddressForTezosGhostnet } from "../../src/addresses/NFTClaimerAddressForTezosGhostnet";
import nftMinterAddress from "../../deployments/nftminter";
import {
  InternalOperationResult,
  MichelsonV1Expression,
  MichelsonV1ExpressionExtended,
} from "@taquito/rpc";
import {
  convert_address,
  unconvert_bytes,
  unconvert_chain_id,
  unconvert_mint,
} from "../utils/convert";
import {
  BytesLiteral,
  MichelsonType,
  Parser,
  unpackDataBytes,
} from "@taquito/michel-codec";
import { assert } from "chai";

const RPC_ENDPOINT = "https://rpc.ghostnet.teztnets.com/"; //"http://localhost:8732/";

function processEvent(data: InternalOperationResult) {
  console.log("PROCESS EVENT");
  console.log("data", data);

  try {
    const types = data.type as MichelsonV1ExpressionExtended;
    const payloads = data.payload as MichelsonV1Expression[];

    // // CHAIN ID
    // // const decodedChainId = unpackDataBytes(
    // //   payloads.at(0) as BytesLiteral,
    // //   types.args?.at(0) as MichelsonType
    // // );
    // // console.log("decodedChainId", decodedChainId);
    // // USER ADDRESS
    // const decodedUserAddress = encodePubKey(
    //   (payloads.at(1) as BytesLiteral).bytes
    // );
    // console.log("decodedUserAddress=", decodedUserAddress);

    // // SIGNER KEY
    // // const key_encrypted = (payloads.at(4) as BytesLiteral).bytes;
    // // console.log("key_encrypted=", key_encrypted);
    // // const decodedSignerKey = encodeKey(key_encrypted);
    // // console.log("decodedSignerKey=", decodedSignerKey);

    // // CONTRACT ADDESS
    // const decodedContractAddress = encodeAddress(
    //   (payloads.at(5) as BytesLiteral).bytes
    // );
    // console.log("decodedContractAddress=", decodedContractAddress);
    // // ARGS
    // const src = payloads.at(7) as BytesLiteral;
    // const type = `(pair address nat)`;
    // const p = new Parser();
    // const typeJSON = p.parseMichelineExpression(type);
    // // const decodedArgs = unpackDataBytes(src, typeJSON as MichelsonType);
    // const decodedArgs = unpackDataBytes(
    //   src,
    //   types.args?.at(7) as MichelsonType
    // );

    // console.log("decodedArgs=", decodedArgs);
  } catch (err) {
    console.log(err);
  }
}

async function main(contractAddress: string) {
  const Tezos = new TezosToolkit(RPC_ENDPOINT);
  console.log(
    "frank public key",
    await (
      await InMemorySigner.fromSecretKey(
        "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"
      )
    ).publicKey()
  );

  Tezos.setStreamProvider(
    Tezos.getFactory(PollingSubscribeProvider)({
      shouldObservableSubscriptionRetry: true,
      pollingIntervalMilliseconds: 1500,
    })
  );

  try {
    console.log("listen events for ", contractAddress); // KT1KNhkV7c7bCdFvCXM6LNxbgzSnRxEoXP8Y

    const sub = Tezos.stream.subscribeEvent({
      // tag: "SignatureVerified",
      // address: "KT1KNhkV7c7bCdFvCXM6LNxbgzSnRxEoXP8Y",
      excludeFailedOperations: true,
    });
    sub.on("data", processEvent);
  } catch (e) {
    console.log(e);
  }
}

main(nftMinterAddress);
