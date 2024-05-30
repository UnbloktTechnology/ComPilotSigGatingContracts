import {
  Address,
  NEXERA_CHAINS,
} from "@nexeraprotocol/nexera-id-sig-gating-contracts-sdk/lib";

export const getMultiSigAddress = (chainId: string) => {
  switch (chainId) {
    case NEXERA_CHAINS.SEPOLIA:
      return "0x745B6d5f858047Daf7516aa4Fc34878f4BD3b73D" as Address;
    default:
      return undefined;
  }
};

export const SAFE_ADDRESS = {
  [NEXERA_CHAINS.SEPOLIA]: "0x745B6d5f858047Daf7516aa4Fc34878f4BD3b73D",
} as { [key: string]: Address };
