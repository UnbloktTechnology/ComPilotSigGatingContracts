import { InMemorySigner } from "@taquito/signer";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { saveContractAddress } from "../utils/helper";
import nexeraIdSignerManagerContract from "../../compiled/NexeraIDSignerManagerMultisig.json";

const RPC_ENDPOINT = "http://localhost:20000/";

export async function deploySignerManagerMultisig(
  provider: TezosToolkit,
  owner: string,
  signer: string
) {
  let owners = new MichelsonMap();
  owners.set(owner, true);
  let proposals = new MichelsonMap();

  const initialStorage = {
    owners: owners,
    proposals: proposals,
    next_proposal_id: 0,
    threshold: 1,
    signerAddress: signer,
    pause: false,
  };

  try {
    const originated = await provider.contract.originate({
      code: nexeraIdSignerManagerContract,
      storage: initialStorage,
    });
    // console.log(
    //   `Waiting for nexeraIdSignerManagerContract ${originated.contractAddress} to be confirmed...`
    // );
    await originated.confirmation(2);
    // console.log("confirmed contract: ", originated.contractAddress);
    return originated.contractAddress;
  } catch (error: any) {
    console.log(error);
  }
}
