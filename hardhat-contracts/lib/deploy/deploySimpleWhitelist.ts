import { ethers } from "hardhat";

import { SimpleWhitelist, SimpleWhitelist__factory } from "../../types";

export async function deploySimpleWhitelist(): Promise<SimpleWhitelist> {
  const verifierContract = "SimpleWhitelist";

  const SimpleWhitelist: SimpleWhitelist__factory =
    await ethers.getContractFactory(verifierContract);
  const simpleWhitelist: SimpleWhitelist = await SimpleWhitelist.deploy();

  console.log("SimpleWhitelist contract address:", simpleWhitelist.address);
  return simpleWhitelist;
}
