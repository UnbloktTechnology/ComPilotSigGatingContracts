import fs from "fs";

import { saveContractABI } from "./saveTsFiles";

export const moveExampleGatedNFTMinterABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/gatedExamples/ExampleGatedNFTMinter.sol/ExampleGatedNFTMinter.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("ExampleGatedNFTMinter", abi);
	//saveContractByteCode("ExampleGatedNFTMinter", unprocessedByteCode);
};
export const moveExampleNFTMinterABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/gatedExamples/ExampleNFTMinter.sol/ExampleNFTMinter.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("ExampleNFTMinter", abi);
	//saveContractByteCode("ExampleNFTMinter", unprocessedByteCode);
};
export const moveExampleGatedNFTMinterUpgradeableABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/gatedExamples/ExampleGatedNFTMinterUpgradeable.sol/ExampleGatedNFTMinterUpgradeable.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("ExampleGatedNFTMinterUpgradeable", abi);
	//saveContractByteCode("ExampleNFTMinter", unprocessedByteCode);
};

export const moveExampleMultipleInputsABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/gatedExamples/ExampleMultipleInputs.sol/ExampleMultipleInputs.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("ExampleMultipleInputs", abi);
	//saveContractByteCode("ExampleNFTMinter", unprocessedByteCode);
};

export const moveExampleGatedNFTMinterExternalCallABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/gatedExamples/ExampleGatedNFTMinterExternalCall.sol/ExampleGatedNFTMinterExternalCall.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("ExampleGatedNFTMinterExternalCall", abi);
	//saveContractByteCode("ExampleNFTMinter", unprocessedByteCode);
};
export const moveExampleGatedNFTFacetABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/gatedExamples/diamondBased/ExampleGatedNFTFacet.sol/ExampleGatedNFTFacet.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("ExampleGatedNFTFacet", abi);
	//saveContractByteCode("ExampleNFTMinter", unprocessedByteCode);
};

export const moveCompilotSignerManagerABIToSDK = () => {
	// Load the JSON file
	const jsonFile =
		"./artifacts/contracts/signerManager/CompilotSignerManager.sol/CompilotSignerManager.json"; // Replace with your JSON file's path
	const rawData = fs.readFileSync(jsonFile);
	const jsonData = JSON.parse(rawData);
	const abi = jsonData.abi;
	const unprocessedByteCode = jsonData.bytecode;
	saveContractABI("CompilotSignerManager", abi);
	//saveContractByteCode("ExampleNFTMinter", unprocessedByteCode);
};

export const moveByteCodeAndABIToSdk = () => {
	moveExampleGatedNFTMinterABIToSDK();
	moveExampleNFTMinterABIToSDK();
	moveExampleGatedNFTMinterUpgradeableABIToSDK();
	moveExampleMultipleInputsABIToSDK();
	moveExampleGatedNFTMinterExternalCallABIToSDK();
	moveExampleGatedNFTFacetABIToSDK();
	moveCompilotSignerManagerABIToSDK();
};
moveByteCodeAndABIToSdk();
