import {
  Address,
  NEXERA_CHAINS,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

// This function returns an address for a MultiSig if has been deployed on the input network
export const getTxSignerAddress = (chainId: string) => {
  switch (chainId) {
    case NEXERA_CHAINS.SEPOLIA:
      return TX_SIGNER_ADDRESS;
    case NEXERA_CHAINS.POLYGON_AMOY:
      return TX_SIGNER_ADDRESS;
    case NEXERA_CHAINS.POLYGON:
      return TX_SIGNER_ADDRESS;
    case NEXERA_CHAINS.BASE:
      return TX_SIGNER_ADDRESS;
    default:
      return undefined;
  }
};

// Same on all networks
export const TX_SIGNER_ADDRESS: Address =
  "0x03DF23c4dEA7B52Daf9B7920Ec6CFeDFFA691689";
