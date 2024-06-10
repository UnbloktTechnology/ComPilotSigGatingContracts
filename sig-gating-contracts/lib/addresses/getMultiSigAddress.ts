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
    case NEXERA_CHAINS.ETHEREUM:
      return SAFE_ADDRESS[NEXERA_CHAINS.ETHEREUM];
    case NEXERA_CHAINS.ARBITRUM:
      return SAFE_ADDRESS[NEXERA_CHAINS.ARBITRUM];
    case NEXERA_CHAINS.BNB:
      return SAFE_ADDRESS[NEXERA_CHAINS.BNB];
    case NEXERA_CHAINS.OPTIMISM:
      return SAFE_ADDRESS[NEXERA_CHAINS.OPTIMISM];
    case NEXERA_CHAINS.AVALANCHE:
      return SAFE_ADDRESS[NEXERA_CHAINS.AVALANCHE];
    default:
      console.log(
        "--- WARNING --- No SAFE_ADDRESS specified for this Chain, using default Signer Manager Controller"
      );
      return undefined;
  }
};

// List of deployed Multisigs
export const SAFE_ADDRESS = {
  [NEXERA_CHAINS.SEPOLIA]: "0x745B6d5f858047Daf7516aa4Fc34878f4BD3b73D",
  [NEXERA_CHAINS.POLYGON]: "0x94D262160808E73626f728700d802487E8B186eD",
  [NEXERA_CHAINS.BASE]: "0xb748Cf0409bDc6f8039090EF6b09ba9722886d18",
  [NEXERA_CHAINS.ETHEREUM]: "0x5818DD2D71c33e6078A9dEFD78829290FD25Dab2",
  [NEXERA_CHAINS.ARBITRUM]: "0xB071EC779D41D6aa43261A9BB275269f53A4a67c",
  [NEXERA_CHAINS.OPTIMISM]: "0xD5FE72cb8195518E9E5D6cB3E5Ab5A352670f5fB",
  [NEXERA_CHAINS.BNB]: "0xB071EC779D41D6aa43261A9BB275269f53A4a67c",
  [NEXERA_CHAINS.AVALANCHE]: "0xD5FE72cb8195518E9E5D6cB3E5Ab5A352670f5fB",
} as { [key: string]: Address };
