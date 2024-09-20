import { deployments, ethers } from "hardhat";

import { ExampleGatedNFTMinter, ComPilotSignerManager } from "../typechain";
export async function fixtureExampleGatedNFTMinter() {
	const contractName = "ExampleGatedNFTMinter";
	await deployments.fixture([contractName]);
	const contractInstance = await ethers.getContractAt(
		contractName,
		(await deployments.get(contractName)).address,
	);

	const compilotIDSignerManager = await ethers.getContractAt(
		"ComPilotSignerManager",
		(await deployments.get("ComPilotSignerManager")).address,
	);

	return {
		exampleGatedNFTMinter: contractInstance as ExampleGatedNFTMinter,
		compilotIDSignerManager: compilotIDSignerManager as ComPilotSignerManager,
	};
}
