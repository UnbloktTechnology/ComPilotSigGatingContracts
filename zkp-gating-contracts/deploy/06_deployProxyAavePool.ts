import { getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const version = "0.1.0";
const contractName = "ProxyAavePool";
const testEnv = "testnet";

// Add custom entrypoint address here
// const customEntrypointAddress: string | undefined = "0x3f03a2C2F8e345B3894c3D871c97Fb5ae5b26Dd7"
const customEntrypointAddress: string | undefined = undefined;

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const verifierEntrypointAddress =
    customEntrypointAddress ||
    (await deployments.get("NexeraVerifierEntrypoint")).address;

  console.log(`\n--------------------------------------------------------`);
  console.log(
    `Deploying ${contractName}... with entrypoint address ${verifierEntrypointAddress}`
  );
  console.log(`\n--------------------------------------------------------`);

  const deployResult = await deploy(contractName, {
    contract: contractName,
    from: deployer,
    args: [verifierEntrypointAddress],
    log: true,
    skipIfAlreadyDeployed: false,
    nonce: "pending",
    waitConfirmations: 1,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("\nDeployed " + contractName + " at " + deployResult.address);

  return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version, testEnv];
func.dependencies = ["VerifierEntrypointFactory"];
