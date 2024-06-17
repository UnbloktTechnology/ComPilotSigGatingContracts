import { outputFile } from "fs-extra";
import { InMemorySigner } from "@taquito/signer";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { LedgerSigner } from "@taquito/ledger-signer";

export const saveJson = (path: string, data: string) =>
  outputFile(`${process.cwd()}/${path}.json`, data);

export const saveContractAddress = (name: string, address: string) =>
    outputFile(
        `${process.cwd()}/deployments/${name}.ts`,
        `export default "${address}";`
    );

export const between = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

// export const getSigner = async (adminSk?: string) => {
//     const useLedger = Number(process.env.USE_LEDGER);

//     const signer = useLedger
//         ? new LedgerSigner(await TransportNodeHid.create())
//         : await InMemorySigner.fromSecretKey(adminSk);

//     return signer;
// };
