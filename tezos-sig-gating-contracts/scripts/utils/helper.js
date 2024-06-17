"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.between = exports.saveContractAddress = exports.saveJson = void 0;
const fs_extra_1 = require("fs-extra");
const saveJson = (path, data) =>
  (0, fs_extra_1.outputFile)(`${process.cwd()}/${path}.json`, data);
exports.saveJson = saveJson;
const saveContractAddress = (name, address) =>
  (0, fs_extra_1.outputFile)(
    `${process.cwd()}/../deployments/${name}.ts`,
    `export default "${address}";`
  );
exports.saveContractAddress = saveContractAddress;
const between = (min, max) => Math.floor(Math.random() * (max - min) + min);
exports.between = between;
// export const getSigner = async (adminSk?: string) => {
//     const useLedger = Number(process.env.USE_LEDGER);
//     const signer = useLedger
//         ? new LedgerSigner(await TransportNodeHid.create())
//         : await InMemorySigner.fromSecretKey(adminSk);
//     return signer;
// };
