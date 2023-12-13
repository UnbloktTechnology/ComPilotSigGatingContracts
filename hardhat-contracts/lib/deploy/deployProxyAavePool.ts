import { ethers } from "hardhat";

import { Address } from "@nexeraprotocol/nexera-id-schemas";

import { ProxyAavePool, ProxyAavePool__factory } from "../../types";

export async function deployProxyAavePool(
  nexeraVerifierAddress: Address,
): Promise<ProxyAavePool> {
  const proxyAavePoolContract = "ProxyAavePool";

  const proxyAavePoolFactory: ProxyAavePool__factory =
    await ethers.getContractFactory(proxyAavePoolContract);
  const proxyAavePool: ProxyAavePool = await proxyAavePoolFactory.deploy(
    nexeraVerifierAddress,
  );

  console.log("ProxyAavePool contract address:", proxyAavePool.address);
  return proxyAavePool;
}
