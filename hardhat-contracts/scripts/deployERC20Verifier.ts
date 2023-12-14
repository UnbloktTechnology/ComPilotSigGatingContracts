import { ethers } from "hardhat";

import { ERC20Verifier, ERC20Verifier__factory } from "../types";

async function deployERC20Verifier() {
  const verifierContract = "ERC20Verifier";
  const verifierName = "ERC20zkAirdrop";
  const verifierSymbol = "zkERC20";

  const spongePoseidonLib = "0x12d8C87A61dAa6DD31d8196187cFa37d1C647153";
  const poseidon6Lib = "0xb588b8f07012Dc958aa90EFc7d3CF943057F17d7";

  const ERC20Verifier: ERC20Verifier__factory =
    await ethers.getContractFactory(verifierContract);
  const erc20Verifier: ERC20Verifier = await ERC20Verifier.deploy(
    verifierName,
    verifierSymbol,
  );

  await erc20Verifier.deployed();
  console.log(verifierName, " contract address:", erc20Verifier.address);
}
deployERC20Verifier()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
