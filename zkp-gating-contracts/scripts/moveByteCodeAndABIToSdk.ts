import fs from "fs";

import linkLibrariesToByteCode from "./getLinkedByteCode";
import { saveContractABI, saveContractByteCode } from "./saveTsFiles";

const poseidonFacade = "0xD65f5Fc521C4296723c6Eb16723A8171dCC12FB0";

export const moveScenarioVerifierByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/zkpVerifiers/ScenarioVerifier.sol/ScenarioVerifier.json"; // Replace with your JSON file's path
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
    }
  );
  saveContractABI("ScenarioVerifier", scenarioABI);
  saveContractByteCode("ScenarioVerifier", unprocessedByteCode);
};

export const moveNexeraVerifierEntrypointByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/zkpVerifiers/NexeraVerifierEntrypoint.sol/NexeraVerifierEntrypoint.json"; // Replace with your JSON file's path
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
    }
  );
  saveContractABI("NexeraVerifierEntrypoint", abi);
  saveContractByteCode("NexeraVerifierEntrypoint", unprocessedByteCode);
};

export const moveCAQSVByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/validators/CredentialAtomicQuerySigV2Validator.sol/CredentialAtomicQuerySigV2Validator.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  saveContractABI("CredentialAtomicQuerySigV2Validator", abi);
  saveContractByteCode(
    "CredentialAtomicQuerySigV2Validator",
    unprocessedByteCode
  );
};

export const moveVerifierSigWrapperByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/@iden3/contracts/lib/VerifierSigWrapper.sol/VerifierSigWrapper.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  saveContractABI("VerifierSigWrapper", abi);
  saveContractByteCode("VerifierSigWrapper", unprocessedByteCode);
};

export const moveVerifierEntrypointFactoryByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/zkpVerifiers/VerifierEntrypointFactory.sol/VerifierEntrypointFactory.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  saveContractABI("VerifierEntrypointFactory", abi);
  saveContractByteCode("VerifierEntrypointFactory", unprocessedByteCode);
};
export const moveScenarioVerifierFactoryByteCodeAndABIToSDK = () => {
  // Load the JSON file
  const jsonFile =
    "./artifacts/contracts/zkpVerifiers/ScenarioVerifierFactory.sol/ScenarioVerifierFactory.json"; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const abi = jsonData.abi;
  const unprocessedByteCode = jsonData.bytecode;
  saveContractABI("ScenarioVerifierFactory", abi);
  saveContractByteCode("ScenarioVerifierFactory", unprocessedByteCode);
};

export const moveByteCodeAndABIToSdk = () => {
  moveScenarioVerifierByteCodeAndABIToSDK();
  moveNexeraVerifierEntrypointByteCodeAndABIToSDK();
  moveCAQSVByteCodeAndABIToSDK();
  moveVerifierSigWrapperByteCodeAndABIToSDK();
  moveVerifierEntrypointFactoryByteCodeAndABIToSDK();
  moveScenarioVerifierFactoryByteCodeAndABIToSDK();
};
moveByteCodeAndABIToSdk();
