import { getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const version = "0.2.1";
const contractName = "ExampleGatedNFTMinterUpgradeable";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments } = hre;
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	// Fetch deployed Signer Manager
	const signerManagerAddress = (await deployments.get("ComPilotSignerManager"))
		.address;
	console.log("signerManagerAddress", signerManagerAddress);

	console.log(`\n--------------------------------------------------------`);
	console.log(`Deploying ${contractName}...`);
	console.log(`\n--------------------------------------------------------`);

	const deployResult = await deploy(contractName, {
		contract: contractName,
		from: deployer,
		log: true,
		proxy: {
			owner: deployer,
			proxyContract: "OptimizedTransparentProxy",
			execute: {
				init: {
					methodName: "initialize",
					args: [signerManagerAddress],
				},
			},
		},
		//nonce: "pending",
		waitConfirmations: 1,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	console.log("\nDeployed " + contractName + " at " + deployResult.address);

	return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version];
func.dependencies = ["ComPilotSignerManager"];
