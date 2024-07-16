import { Address } from "@nexeraid/nexera-id-sig-gating-contracts-sdk/lib";
import { ethers, network } from "hardhat";

async function setAccountBalance(
  accountAddress: Address,
  balanceInEther: string
) {
  await network.provider.send("hardhat_setBalance", [
    accountAddress,
    ethers.utils.parseUnits(balanceInEther, "ether").toHexString(),
  ]);
}
export async function setupThreeAccounts() {
  const [acc1, acc2, acc3] = await ethers.getSigners();
  await setAccountBalance(acc1.address as Address, "1");
  await setAccountBalance(acc2.address as Address, "1");
  await setAccountBalance(acc3.address as Address, "1");
}
