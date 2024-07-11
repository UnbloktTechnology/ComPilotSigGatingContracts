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

const RPC_ENDPOINT = "http://localhost:20000/";

function processEvent(data: InternalOperationResult) {
  console.log("PROCESS EVENT");
  console.log("data.source", data.source);

  try {
    const types = data.type as MichelsonV1ExpressionExtended;
    types.args?.at(1);
    console.log("data.type.args[1] ", types.args?.at(1));

    const payloads = data.payload as MichelsonV1Expression[];
    console.log("data.payload[1] ", payloads.at(1));

    // const decodedChainId = unpackDataBytes(
    //   payloads.at(0) as BytesLiteral,
    //   types.args?.at(0) as MichelsonType
    // );
    // console.log("decodedChainId", decodedChainId);

    const decodedUserAddress = encodePubKey(
      (payloads.at(1) as BytesLiteral).bytes
    );
    console.log("decodedUserAddress=", decodedUserAddress);

    // const key_encrypted = (payloads.at(4) as BytesLiteral).bytes;
    // console.log("key_encrypted=", key_encrypted);
    // const decodedSignerKey = encodeKey(key_encrypted);
    // console.log("decodedSignerKey=", decodedSignerKey);

    const decodedContractAddress = encodeAddress(
      (payloads.at(5) as BytesLiteral).bytes
    );
    console.log("decodedContractAddress=", decodedContractAddress);

    const src = payloads.at(7) as BytesLiteral;
    const type = `(pair address nat)`;
    const p = new Parser();
    const typeJSON = p.parseMichelineExpression(type);
    const decodedArgs = unpackDataBytes(src, typeJSON as MichelsonType);
    console.log("decodedArgs=", decodedArgs);
  } catch (err) {
    console.log(err);
  }
  console.log("data", data);
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
    console.log("listen events for ", contractAddress);
    const kk = encodeKey(
      "00d670f72efd9475b62275fae773eb5f5eb1fea4f2a0880e6d21983273bf95a0af"
    );
    console.log("kk=", kk);

    const sub = Tezos.stream.subscribeEvent({
      // tag: "SignatureVerified",
      // address: contractAddress,
      // excludeFailedOperations: true,
    });
    sub.on("data", processEvent);
  } catch (e) {
    console.log(e);
  }
}

main(nftMinterAddress);
