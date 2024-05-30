import { getNamedAccounts, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { keccak256, pad, toHex } from "viem";

const version = "0.1.0";
const contractName = "SignerManagerProxyOwner";
const testEnv = "testnet";
const mainEnv = "mainnet";

const DEFAULT_ADMIN_ROLE = pad("0x00", { size: 32 });
const PAUSER_ROLE = keccak256(toHex("PAUSER_ROLE"));

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer, txAuthSignerAddress, signerManagerController, pauser } =
    await getNamedAccounts();
  console.log("deployer", deployer);
  console.log("txAuthSignerAddress", txAuthSignerAddress);

  // Fetch deployed Signer Manager
  const signerManagerAddress = (await deployments.get("NexeraIDSignerManager"))
    .address;
  console.log("signerManagerAddress", signerManagerAddress);

  // 1. Deploy SignerManagerProxyOwner

  console.log(`\n--------------------------------------------------------`);
  console.log(`Deploying ${contractName}...`);
  console.log(`\n--------------------------------------------------------`);

  const deployResult = await deploy(contractName, {
    contract: contractName,
    from: deployer,
    args: [signerManagerAddress],
    log: true,
    nonce: "pending",
    waitConfirmations: 1,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("\nDeployed " + contractName + " at " + deployResult.address);

  //2. Transfer SIGNER_MANAGER_CONTROLLER_ROLE and PAUSER_ROLE to right addresses
  const signerManagerProxyOwner = await ethers.getContractAt(
    contractName,
    deployResult.address
  );

  console.log(
    `\nTransferring SIGNER_MANAGER_CONTROLLER_ROLE of ${contractName} to ${signerManagerController}...`
  );
  const tx = await signerManagerProxyOwner.grantRole(
    DEFAULT_ADMIN_ROLE,
    signerManagerController
  );
  await tx.wait();
  console.log(
    `SIGNER_MANAGER_CONTROLLER_ROLE of ${contractName} transferred to ${signerManagerController}`
  );

  console.log(`\nTransferring PAUSER_ROLE of ${contractName} to ${pauser}...`);
  const tx2 = await signerManagerProxyOwner.grantRole(PAUSER_ROLE, pauser);
  await tx2.wait();
  console.log(`PAUSER_ROLE of ${contractName} transferred to ${pauser}`);

  // 3. Transfer ownership of SignerManager to SignerManagerProxyOwner
  const signerManager = await ethers.getContractAt(
    "NexeraIDSignerManager",
    signerManagerAddress
  );

  console.log(
    `\nTransferring ownership of NexeraIDSignerManager to ${deployResult.address}...`
  );
  const tx3 = await signerManager.transferOwnership(deployResult.address);
  await tx3.wait();
  console.log(
    `Ownership of NexeraIDSignerManager transferred to ${deployResult.address}`
  );

  return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version, testEnv, mainEnv];
func.dependencies = ["NexeraIDSignerManager"];
