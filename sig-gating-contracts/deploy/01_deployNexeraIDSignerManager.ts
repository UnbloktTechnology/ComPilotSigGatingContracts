import { getNamedAccounts, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getMultiSigAddress } from "../lib/getMultiSigAddress";

const version = "0.1.6";
const contractName = "NexeraIDSignerManager";
const testEnv = "testnet";
const mainEnv = "mainnet";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getChainId } = hre;
  const { deploy } = deployments;
  const { deployer, txAuthSignerAddress, signerManagerController } =
    await getNamedAccounts();

  // Deploy NexeraIDSignerManager
  console.log(`\n--------------------------------------------------------`);
  console.log(`Deploying ${contractName}...`);
  console.log(`\n--------------------------------------------------------`);

  // Get the chain ID
  const chainId = await getChainId();
  console.log(`Chain ID: ${chainId}`);

  // Get SIGNER_MANAGER_CONTROLLER depending on network
  const SIGNER_MANAGER_CONTROLLER =
    getMultiSigAddress(chainId) || signerManagerController;

  console.log("deployer", deployer);
  console.log("txAuthSignerAddress", txAuthSignerAddress);
  console.log("SIGNER_MANAGER_CONTROLLER", SIGNER_MANAGER_CONTROLLER);

  const deployResult = await deploy(contractName, {
    contract: contractName,
    deterministicDeployment: ethers.utils.formatBytes32String(
      (process.env.SALT || "SALT") + version
    ),
    from: deployer,
    args: [txAuthSignerAddress, SIGNER_MANAGER_CONTROLLER],
    log: true,
    nonce: "pending",
    waitConfirmations: 1,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("\nDeployed " + contractName + " at " + deployResult.address);
  console.log(`\n--------------------------------------------------------`);

  return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version, testEnv, mainEnv];
