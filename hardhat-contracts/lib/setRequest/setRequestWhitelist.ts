import { ethers } from "hardhat";

import { CredentialType } from "@nexeraprotocol/nexera-id-schemas";

import { getSchemaExampleQuery } from "./createRequestInput/getSchemaExampleQuery";

export async function setRequest(
  simpleWhitelistAddress: string,
  validatorAddress: string,
  credentialType: CredentialType,
): Promise<boolean> {
  const requestId = 1;
  const queryData = await getSchemaExampleQuery(credentialType, requestId);

  let simpleWhitelist = await ethers.getContractAt(
    "SimpleWhitelist",
    simpleWhitelistAddress,
  );

  try {
    await simpleWhitelist.setNexeraZKPRequest(requestId, {
      metadata: "",
      validator: validatorAddress,
      data: queryData,
    });
    return true;
  } catch (e) {
    console.log("error: ", e);
    return false;
  }
}
