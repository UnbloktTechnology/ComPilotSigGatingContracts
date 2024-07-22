import {
  Address,
  ChainId,
} from "@nexeraid/sig-gating-contracts-sdk/lib";

// This function returns the txSignerAddress
export const getTxSignerAddress = (chainId: string) => {
  // if chainId is parsed successfully return TX_SIGNER_ADDRESS,
  // the signing address we use on all evm chains
  // otherwise, it means the chainId is likely a local testnet
  // and undefined should be returned, so that the deployment script
  // understands to use local tx signer address
  const parsedChainId = ChainId.safeParse(chainId);
  if (parsedChainId.success) {
    return TX_SIGNER_ADDRESS;
  } else {
    console.log(
      "--- WARNING --- No TX_SIGNER_ADDRESS specified for this Chain, using default one"
    );
    return undefined;
  }
};

// Same on all networks
export const TX_SIGNER_ADDRESS: Address =
  "0x03DF23c4dEA7B52Daf9B7920Ec6CFeDFFA691689";
