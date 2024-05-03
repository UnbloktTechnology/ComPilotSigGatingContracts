import { getNamedAccounts, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const version = "0.1.4";
const contractName = "NexeraIDSignerManager";
const testEnv = "testnet";
const mainEnv = "mainnet";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer, txAuthSigner } = await getNamedAccounts();
  console.log("deployer", deployer);
  console.log("txAuthSigner", txAuthSigner);

  console.log(`\n--------------------------------------------------------`);
  console.log(`Deploying ${contractName}...`);
  console.log(`\n--------------------------------------------------------`);

  const deployResult = await deploy(contractName, {
    contract: contractName,
    deterministicDeployment: ethers.utils.formatBytes32String(
      process.env.SALT || "SALT"
    ),
    from: deployer,
    args: [txAuthSigner, deployer],
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
func.tags = [contractName, version, testEnv, mainEnv];
