import { Address } from "@nexeraprotocol/nexera-id-contracts-sdk/lib";
import { ethers, network } from "hardhat";

// async function fundTestAccount(testAccountAddress:Address, amountInEther) {
//   // Impersonate an account with a known balance
//   await network.provider.request({
//     method: "hardhat_impersonateAccount",
//     params: ["0x123...abc"], // The account address with balance
//   });

//   const signer = await ethers.getSigner("0x123...abc");

//   // Send Ether to the test account
//   const tx = await signer.sendTransaction({
//     to: testAccountAddress,
//     value: ethers.utils.parseEther(amountInEther),
//   });

//   await tx.wait();
// }
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
