import { ethers, getNamedAccounts } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { filterAndCut } from "../lib/deploy/diamond/diamond_utils";

const version = "0.1.0";
const contractName = "ExampleDiamond";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments } = hre;
  const { deploy } = deployments;
  const { deployer, txAuthSignerAddress } = await getNamedAccounts();
  console.log("deployer", deployer);

  // 1. Deploy Diamond

  console.log(`\n--------------------------------------------------------`);
  console.log(`Deploying ${contractName}...`);
  console.log(`\n--------------------------------------------------------`);

  const deployResult = await deploy(contractName, {
    contract: contractName,
    from: deployer,
    log: true,
    nonce: "pending",
    waitConfirmations: 1,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  console.log("\nDeployed " + contractName + " at " + deployResult.address);

  // 2. Get Facet
  const exampleGatedNFTFacetAddress = (
    await deployments.get("ExampleGatedNFTFacet")
  ).address;
  const exampleGatedNFTFacet = await ethers.getContractAt(
    "ExampleGatedNFTFacet",
    exampleGatedNFTFacetAddress
  );

  // 3. filter and cut
  const exampleDiamond = await ethers.getContractAt(
    contractName,
    deployResult.address
  );
  const deployerSigner = await ethers.getSigner(deployer);
  await filterAndCut(exampleDiamond, deployerSigner, [exampleGatedNFTFacet]);

  // 4. init facet
  const exampleGatedNFTFacetInDiamond = await ethers.getContractAt(
    "ExampleGatedNFTFacet",
    deployResult.address
  );
  await exampleGatedNFTFacetInDiamond.initializeExampleGatedNFTFacet(
    txAuthSignerAddress
  );

  return true;
};

export default func;
func.id = contractName + version;
func.tags = [contractName, version];
func.dependencies = ["ExampleGatedNFTFacet"];
