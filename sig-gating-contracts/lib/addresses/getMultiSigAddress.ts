import {
  Address,
  NEXERA_CHAINS,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

// This function returns an address for a MultiSig if has been deployed on the input network
export const getMultiSigAddress = (chainId: string) => {
  switch (chainId) {
    case NEXERA_CHAINS.SEPOLIA:
      return SAFE_ADDRESS[NEXERA_CHAINS.SEPOLIA];
    case NEXERA_CHAINS.POLYGON:
      return SAFE_ADDRESS[NEXERA_CHAINS.POLYGON];
    case NEXERA_CHAINS.BASE:
      return SAFE_ADDRESS[NEXERA_CHAINS.BASE];
    default:
      return undefined;
  }
};

// List of deployed Multisigs
export const SAFE_ADDRESS = {
  [NEXERA_CHAINS.SEPOLIA]: "0x745B6d5f858047Daf7516aa4Fc34878f4BD3b73D",
  [NEXERA_CHAINS.POLYGON]: "0x94D262160808E73626f728700d802487E8B186eD",
  [NEXERA_CHAINS.BASE]: "0xb748Cf0409bDc6f8039090EF6b09ba9722886d18",
} as { [key: string]: Address };
