import { getNamedAccounts, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getMultiSigAddress } from "../lib/addresses/getMultiSigAddress";
import { getTxSignerAddress } from "../lib/addresses/getTxSignerAddress";

const version = "0.1.13";
const contractName = "CompilotSignerManager";
const withExample = "withExample";
const onlySignerManager = "onlySignerManager";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
	const { deployments, getChainId, network } = hre;
	const { deploy } = deployments;
	const { deployer, txAuthSignerAddress, signerManagerController } =
		await getNamedAccounts();

	// 1. Deploy CompilotSignerManager
	console.log(`\n--------------------------------------------------------`);
	console.log(`Deploying ${contractName}...`);
	console.log(`\n--------------------------------------------------------`);

	// Get the chain ID
	const chainId = await getChainId();
	console.log(`Chain ID: ${chainId}`);

	// Get SIGNER_MANAGER_CONTROLLER depending on network
	const SIGNER_MANAGER_CONTROLLER =
		getMultiSigAddress(chainId) || signerManagerController;

	// Get TX_SIGNER_ADDRESS depending on network
	// for _local networks, use txAuthSignerAddress
	const TX_SIGNER_ADDRESS =
		network.name == "polygonAmoy_local" || network.name == "sepolia_local"
			? txAuthSignerAddress
			: getTxSignerAddress(chainId) || txAuthSignerAddress;

	console.log("Network name:", network.name);
	console.log("Network chain ID:", network.config.chainId);

	console.log("deployer", deployer);
	console.log("TX_SIGNER_ADDRESS", TX_SIGNER_ADDRESS);
	console.log("SIGNER_MANAGER_CONTROLLER", SIGNER_MANAGER_CONTROLLER);

	// Note: because of deterministic deployments, we first use the deployer in the constructor
	// because it is the same for all networks and after deployment we set the SIGNER_MANAGER_CONTROLLER
	// which is different on every network
	const deployResult = await deploy(contractName, {
		contract: contractName,
		deterministicDeployment: ethers.utils.formatBytes32String(
			(process.env.SALT || "SALT") + version,
		),
		from: deployer,
		args: [TX_SIGNER_ADDRESS, deployer],
		log: true,
		nonce: "pending",
		waitConfirmations: network.name == "hardhat" ? 1 : 6,
		autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
	});

	console.log("\nDeployed " + contractName + " at " + deployResult.address);

	//2. Transfer ownership to right SIGNER_MANAGER_CONTROLLER
	const signerManager = await ethers.getContractAt(
		contractName,
		deployResult.address,
	);
	// check if it is not already the owner
	const owner = await signerManager.owner();
	if (owner !== SIGNER_MANAGER_CONTROLLER) {
		console.log(
			`\nTransferring ownership of ${contractName} to ${SIGNER_MANAGER_CONTROLLER}...`,
		);
		const deployerSigner = await ethers.getSigner(deployer);
		const tx = await signerManager
			.connect(deployerSigner)
			.transferOwnership(SIGNER_MANAGER_CONTROLLER);
		await tx.wait();
		console.log(
			`ownership of ${contractName} transferred to ${SIGNER_MANAGER_CONTROLLER}`,
		);
	} else {
		console.log(
			`${SIGNER_MANAGER_CONTROLLER} is already the owner of ${contractName}`,
		);
	}
	console.log(`\n--------------------------------------------------------`);

	return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version, withExample, onlySignerManager];
