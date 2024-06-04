import {
  Address,
  NEXERA_CHAINS,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

// This function returns an address for a MultiSig if has been deployed on the input network
export const getMultiSigAddress = (chainId: string) => {
  switch (chainId) {
    case NEXERA_CHAINS.SEPOLIA:
      return SAFE_ADDRESS[NEXERA_CHAINS.SEPOLIA];
    default:
      return undefined;
  }
};

// List of deployed Multisigs
export const SAFE_ADDRESS = {
  [NEXERA_CHAINS.SEPOLIA]: "0x745B6d5f858047Daf7516aa4Fc34878f4BD3b73D",
} as { [key: string]: Address };
