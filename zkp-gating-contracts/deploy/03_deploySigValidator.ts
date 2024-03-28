import { getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ONCHAIN_VERIFICATION_CONTRACTS } from "../lib/contractAddresses";

const version = "0.1.0";
const contractName = "CredentialAtomicQuerySigV2Validator";
const testEnv = "testnet";
const mainEnv = "mainnet";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const networkName = hre.network.name;

  const VerifierSigWrapper = await deployments.get("VerifierSigWrapper");

  console.log(`\n--------------------------------------------------------`);
  console.log(`Deploying ${contractName}...`);
  console.log(
    VerifierSigWrapper.address,
    ONCHAIN_VERIFICATION_CONTRACTS[
      networkName.includes("polygon_main") ? "137" : "80001"
    ].STATE_ADDRESS
  );
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
          args: [
            VerifierSigWrapper.address,
            ONCHAIN_VERIFICATION_CONTRACTS[
              networkName.includes("polygon_main") ? "137" : "80001"
            ].STATE_ADDRESS,
          ],
        },
      },
    },
    // Will be enabled when refactored into a factory
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
func.tags = [contractName, version, testEnv, mainEnv];
func.dependencies = ["VerifierSigWrapper"];
