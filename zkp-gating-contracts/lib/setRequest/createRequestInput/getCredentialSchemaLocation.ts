import {
  CredentialType,
  Environment,
} from "@nexeraprotocol/nexera-id-contracts-sdk/lib";

const json_schema = {
  ID3: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
  },
  ID3_LD: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
  },
  IDScan: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
  },
  IDScan_LD: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
  },
  ProofOfResidence: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmRWxkbToWBkNmR34WEXsKypsWMEgWD5nsYZn2FESdZm4A",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmRWxkbToWBkNmR34WEXsKypsWMEgWD5nsYZn2FESdZm4A",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmRWxkbToWBkNmR34WEXsKypsWMEgWD5nsYZn2FESdZm4A",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmRWxkbToWBkNmR34WEXsKypsWMEgWD5nsYZn2FESdZm4A",
  },
  ProofOfResidence_LD: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmSgzzZwZ8Ws6j7gYeE7Rn3k14K3Ak6qWXQonpjfLAwVAX",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmSgzzZwZ8Ws6j7gYeE7Rn3k14K3Ak6qWXQonpjfLAwVAX",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmSgzzZwZ8Ws6j7gYeE7Rn3k14K3Ak6qWXQonpjfLAwVAX",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmSgzzZwZ8Ws6j7gYeE7Rn3k14K3Ak6qWXQonpjfLAwVAX",
  },
  IDScanSelfie: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
  },
  IDScanSelfie_LD: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
  },
  IDScanPassport: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
  },
  IDScanPassport_LD: {
    prod: "https://nexera.infura-ipfs.io/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    stage:
      "https://nexera.infura-ipfs.io/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    dev: "https://nexera.infura-ipfs.io/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    local:
      "https://nexera.infura-ipfs.io/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
  },
  KYCAgeCredential: {
    prod: "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
    stage:
      "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
    dev: "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
    local:
      "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json/KYCAgeCredential-v3.json",
  },
};

export const getCredentialSchemaLocation = (props: {
  credentialType: CredentialType;
  type: "json" | "jsonld";
  env: Environment;
}) => {
  return props.credentialType == "KYCAgeCredential" && props.type === "jsonld"
    ? "https://raw.githubusercontent.com/iden3/claim-schema-vocab/main/schemas/json-ld/kyc-v3.json-ld"
    : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (json_schema[
        props.type === "json"
          ? props.credentialType
          : `${props.credentialType}_LD`
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ][props.env] as string);
};
