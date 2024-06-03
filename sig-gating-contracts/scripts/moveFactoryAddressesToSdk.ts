import fs from "fs";

import { saveFactoryAddresses } from "./saveTsFiles";

export const moveFactoryAddressToSdk = (
  factoryName: string,
  network: string
) => {
  try {
    // Load the JSON file
    const jsonFile = `./deployments/${network}/${factoryName}.json`; // Replace with your JSON file's path
    const rawData = fs.readFileSync(jsonFile);
    const jsonData = JSON.parse(rawData);
    const address = jsonData.address;
    saveFactoryAddresses(factoryName, network, address);
  } catch (e) {
    console.log("moveFactoryAddressToSdk failed");
    console.log(e);
  }
};

export const moveAllContractAddressesToSdk = () => {
  // Amoy
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "amoy");
  moveFactoryAddressToSdk("ExampleNFTMinter", "amoy");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "amoy");
  // Sepolia
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "sepolia");
  moveFactoryAddressToSdk("ExampleNFTMinter", "sepolia");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "sepolia");
};
moveAllContractAddressesToSdk();
