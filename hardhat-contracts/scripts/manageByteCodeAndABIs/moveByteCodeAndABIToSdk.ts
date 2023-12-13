import fs from "fs";

import linkLibrariesToByteCode from "./getLinkedByteCode";
import {
  saveCAQSVABI,
  saveCAQSVByteCode,
  saveNexeraVerifierEntrypointABI,
  saveNexeraVerifierEntrypointByteCode,
  saveScenarioABI,
  saveScenarioByteCode,
  saveVerifierSigWrapperABI,
  saveVerifierSigWrapperByteCode,
} from "./saveTsFiles";

const spongePoseidonLib = "0x12d8C87A61dAa6DD31d8196187cFa37d1C647153";
const poseidon6Lib = "0xb588b8f07012Dc958aa90EFc7d3CF943057F17d7";
const poseidonFacade = "0xD65f5Fc521C4296723c6Eb16723A8171dCC12FB0";

export const moveScenarioVerifierByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/ScenarioVerifier.sol/ScenarioVerifier.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const scenarioABI = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  const linkedReferences = jsonData.linkReferences;
  let processedByteCode = linkLibrariesToByteCode(
    {
      bytecode: unprocessedByteCode,
      linkReferences: linkedReferences,
    },
    {
      PoseidonFacade: poseidonFacade,
    },
  );
  saveScenarioABI(scenarioABI);
  saveScenarioByteCode(processedByteCode);
};

export const moveNexeraVerifierEntrypointByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/NexeraVerifierEntrypoint.sol/NexeraVerifierEntrypoint.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  const linkedReferences = jsonData.linkReferences;
  let processedByteCode = linkLibrariesToByteCode(
    {
      bytecode: unprocessedByteCode,
      linkReferences: linkedReferences,
    },
    {
      PoseidonFacade: poseidonFacade,
    },
  );
  saveNexeraVerifierEntrypointABI(abi);
  saveNexeraVerifierEntrypointByteCode(processedByteCode);
};

export const moveCAQSVByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/validators/CredentialAtomicQuerySigValidator.sol/CredentialAtomicQuerySigValidator.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  saveCAQSVABI(abi);
  saveCAQSVByteCode(unprocessedByteCode);
};

export const moveVerifierSigWrapperByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/verifiers/circuits/VerifierSigWrapper.sol/VerifierSigWrapper.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  saveVerifierSigWrapperABI(abi);
  saveVerifierSigWrapperByteCode(unprocessedByteCode);
};

export const moveByteCodeAndABIToSdk = () => {
  moveScenarioVerifierByteCodeAndABIToSDK();
  moveNexeraVerifierEntrypointByteCodeAndABIToSDK();
  moveCAQSVByteCodeAndABIToSDK();
  moveVerifierSigWrapperByteCodeAndABIToSDK();
};
moveByteCodeAndABIToSdk();
