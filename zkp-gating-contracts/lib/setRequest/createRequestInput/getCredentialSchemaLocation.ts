import {
  CredentialType,
  Environment,
} from "@nexeraprotocol/nexera-id-contracts-sdk/lib";

const json_schema = {
  ProofOfResidence: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmVdrUzTGHhdPP7xTJe9JimHTTttL9kxYMA97xP5H73xRZ",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmVdrUzTGHhdPP7xTJe9JimHTTttL9kxYMA97xP5H73xRZ",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmVdrUzTGHhdPP7xTJe9JimHTTttL9kxYMA97xP5H73xRZ",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmVdrUzTGHhdPP7xTJe9JimHTTttL9kxYMA97xP5H73xRZ",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmVdrUzTGHhdPP7xTJe9JimHTTttL9kxYMA97xP5H73xRZ",
  },
  ProofOfResidence_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmWEa2nNHLP3bsFYDGZbpLuM42J8krpEhjsuDkT4Q19VWf",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmWEa2nNHLP3bsFYDGZbpLuM42J8krpEhjsuDkT4Q19VWf",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmWEa2nNHLP3bsFYDGZbpLuM42J8krpEhjsuDkT4Q19VWf",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmWEa2nNHLP3bsFYDGZbpLuM42J8krpEhjsuDkT4Q19VWf",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmWEa2nNHLP3bsFYDGZbpLuM42J8krpEhjsuDkT4Q19VWf",
  },
  IDInformation: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/Qme2rXYj2R8RTpxath5gawyoyRWqsajubUu6xbwh8cWhNF",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/Qme2rXYj2R8RTpxath5gawyoyRWqsajubUu6xbwh8cWhNF",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/Qme2rXYj2R8RTpxath5gawyoyRWqsajubUu6xbwh8cWhNF",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/Qme2rXYj2R8RTpxath5gawyoyRWqsajubUu6xbwh8cWhNF",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/Qme2rXYj2R8RTpxath5gawyoyRWqsajubUu6xbwh8cWhNF",
  },
  AMLScreeningsResults: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmacioN1D6w8Pz1vzYKZotMESuNKu9kq5K3XWGA4SRrPyx",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmacioN1D6w8Pz1vzYKZotMESuNKu9kq5K3XWGA4SRrPyx",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmacioN1D6w8Pz1vzYKZotMESuNKu9kq5K3XWGA4SRrPyx",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmacioN1D6w8Pz1vzYKZotMESuNKu9kq5K3XWGA4SRrPyx",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmacioN1D6w8Pz1vzYKZotMESuNKu9kq5K3XWGA4SRrPyx",
  },
  IDImage: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmcuMiPzZW494VSaWqfMPVrBr7mch4Bz8EafKz6Jm8QueD",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmcuMiPzZW494VSaWqfMPVrBr7mch4Bz8EafKz6Jm8QueD",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmcuMiPzZW494VSaWqfMPVrBr7mch4Bz8EafKz6Jm8QueD",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmcuMiPzZW494VSaWqfMPVrBr7mch4Bz8EafKz6Jm8QueD",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmcuMiPzZW494VSaWqfMPVrBr7mch4Bz8EafKz6Jm8QueD",
  },
  SelfieImage: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmNZpisgDH6BYwDMk8pwnbgD4Zc82pYTgMdmWAUscSeFWp",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmNZpisgDH6BYwDMk8pwnbgD4Zc82pYTgMdmWAUscSeFWp",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmNZpisgDH6BYwDMk8pwnbgD4Zc82pYTgMdmWAUscSeFWp",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmNZpisgDH6BYwDMk8pwnbgD4Zc82pYTgMdmWAUscSeFWp",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmNZpisgDH6BYwDMk8pwnbgD4Zc82pYTgMdmWAUscSeFWp",
  },
  IDInformation_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmUFBpPnPanYZPcRKRnGFZeyYSpXx1L3XNngowjRtQFzrD",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUFBpPnPanYZPcRKRnGFZeyYSpXx1L3XNngowjRtQFzrD",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmUFBpPnPanYZPcRKRnGFZeyYSpXx1L3XNngowjRtQFzrD",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUFBpPnPanYZPcRKRnGFZeyYSpXx1L3XNngowjRtQFzrD",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUFBpPnPanYZPcRKRnGFZeyYSpXx1L3XNngowjRtQFzrD",
  },
  AMLScreeningsResults_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/Qma96fMaDmpdJMnVsRdAeVokyU7KBqRSuY8eZJkoLFdsvJ",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/Qma96fMaDmpdJMnVsRdAeVokyU7KBqRSuY8eZJkoLFdsvJ",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/Qma96fMaDmpdJMnVsRdAeVokyU7KBqRSuY8eZJkoLFdsvJ",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/Qma96fMaDmpdJMnVsRdAeVokyU7KBqRSuY8eZJkoLFdsvJ",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/Qma96fMaDmpdJMnVsRdAeVokyU7KBqRSuY8eZJkoLFdsvJ",
  },
  IDImage_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmTYHuqTLNRyfUjncDNwd1KKw9sc7DiewTm1FJ4RPHYqcW",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmTYHuqTLNRyfUjncDNwd1KKw9sc7DiewTm1FJ4RPHYqcW",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmTYHuqTLNRyfUjncDNwd1KKw9sc7DiewTm1FJ4RPHYqcW",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmTYHuqTLNRyfUjncDNwd1KKw9sc7DiewTm1FJ4RPHYqcW",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmTYHuqTLNRyfUjncDNwd1KKw9sc7DiewTm1FJ4RPHYqcW",
  },
  SelfieImage_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmUV9bVQ433m5ejjgqodQ4kfWqMMzFCwJqcqRhzSfENEMX",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUV9bVQ433m5ejjgqodQ4kfWqMMzFCwJqcqRhzSfENEMX",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmUV9bVQ433m5ejjgqodQ4kfWqMMzFCwJqcqRhzSfENEMX",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUV9bVQ433m5ejjgqodQ4kfWqMMzFCwJqcqRhzSfENEMX",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUV9bVQ433m5ejjgqodQ4kfWqMMzFCwJqcqRhzSfENEMX",
  },
  ID3: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmSiv7jMN1mcatdnsG4kJkLPVYkT92tV3oKMWqE7dYqzwX",
  },
  IDScan: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmZHArC9SYXEvNLei7qJCQr5qapSYYhmAMmsh5r35AtcoY",
  },
  IDScanSelfie: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmQQX5t9ZHqGMY5qKrxApMjejw4bugGVae3HddrcShZaGe",
  },
  IDScanPassport: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmUej2eizQoJQXzo4fmoN6Eu3SMAbUjVXG1rE3GotRDfST",
  },
  ID3_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmSFao9JrbMKLvjuuWdUqhhkrPCUcVSaoMiPWKMUMsAx9a",
  },
  IDScan_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmaoyFJjwbkMSTwWurK4tYFxWd3CDnMLu2KustmWL8Ruks",
  },
  IDScanSelfie_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmYoDQKUHSMEZk2ZwaXWvdHbYoLXShVWxRdsu1jsXxhN6F",
  },
  IDScanPassport_LD: {
    prod: "https://quicknode.quicknode-ipfs.com/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    stage:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    dev: "https://quicknode.quicknode-ipfs.com/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    local:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
    branch:
      "https://quicknode.quicknode-ipfs.com/ipfs/QmRBfV9TboGRz42rT45mnMMK8VTtTc9r1mpLQjGfyXCgaf",
  },
};

export const getCredentialSchemaLocation = (props: {
  credentialType: CredentialType;
  type: "json" | "jsonld";
  env: Environment;
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return json_schema[
    props.type === "json" ? props.credentialType : `${props.credentialType}_LD`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  ][props.env] as string;
};
