import { getNamedAccounts, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const version = "0.1.2";
const contractName = "ExampleNFTMinter";
const withExample = "withExample";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("deployer", deployer);

  console.log(`\n--------------------------------------------------------`);
  console.log(`Deploying ${contractName}...`);
  console.log(`\n--------------------------------------------------------`);

  const deployResult = await deploy(contractName, {
    deterministicDeployment: ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(
        (process.env.SALT || "SALT") + contractName + version
      )
    ),
    contract: contractName,
    from: deployer,
    log: true,
    waitConfirmations: network.name == "hardhat" ? 1 : 10,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("\nDeployed " + contractName + " at " + deployResult.address);

  return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version, withExample];
