export enum NEXERA_CHAINS {
  ETHEREUM = "1",
  GOERLI = "5",
  POLYGON = "137",
  MUMBAI = "80001",
  AVALANCHE = "43114",
  FUJI = "43113",
  ARBITRUM = "42161",
  ARBITRUM_GOERLI = "421613",
}
export type Address = `0x${string}`;

export type CredentialType =
  | "KYCAgeCredential"
  | "ID3"
  | "IDScan"
  | "IDScanPassport"
  | "IDScanSelfie"
  | "ProofOfResidence";

export type Environment = "local" | "dev" | "stage" | "prod" | "branch";
