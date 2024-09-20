import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinter, CompilotSignerManager } from "../typechain";
export async function fixtureExampleGatedNFTMinter() {
	const contractName = "ExampleGatedNFTMinter";
	await deployments.fixture([contractName]);
	const contractInstance = await ethers.getContractAt(
		contractName,
		(await deployments.get(contractName)).address,
	);

	const compilotIDSignerManager = await ethers.getContractAt(
		"CompilotSignerManager",
		(await deployments.get("CompilotSignerManager")).address,
	);

	return {
		exampleGatedNFTMinter: contractInstance as ExampleGatedNFTMinter,
		compilotIDSignerManager: compilotIDSignerManager as CompilotSignerManager,
	};
}
