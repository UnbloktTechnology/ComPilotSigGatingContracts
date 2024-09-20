import { getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const version = "0.2.2";
const contractName = "ExampleGatedNFTMinterExternalCall";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments } = hre;
	const { deploy } = deployments;
	const { deployer, externalContract } = await getNamedAccounts();
	console.log("deployer", deployer);

	// Fetch deployed Signer Manager
	const signerManagerAddress = (await deployments.get("CompilotSignerManager"))
		.address;
	console.log("signerManagerAddress", signerManagerAddress);

	console.log(`\n--------------------------------------------------------`);
	console.log(`Deploying ${contractName}...`);
	console.log(`\n--------------------------------------------------------`);

	const deployResult = await deploy(contractName, {
		contract: contractName,
		from: deployer,
		args: [signerManagerAddress, externalContract],
		log: true,
		nonce: "pending",
		waitConfirmations: 1,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	console.log("\nDeployed " + contractName + " at " + deployResult.address);

	return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version];
func.dependencies = ["CompilotSignerManager"];
