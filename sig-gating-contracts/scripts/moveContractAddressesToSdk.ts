import fs from "fs";

import { saveFactoryAddresses } from "./saveTsFiles";

export const moveContractAddressToSdk = (
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
    console.log("moveContractAddressToSdk failed");
    console.log(e);
  }
};

export const moveAllContractAddressesToSdk = () => {
  // Amoy
  moveContractAddressToSdk("ExampleGatedNFTMinter", "amoy");
  moveContractAddressToSdk("ExampleGatedNFTMinter", "amoy_local");
  moveContractAddressToSdk("ExampleNFTMinter", "amoy");
  moveContractAddressToSdk("NexeraIDSignerManager", "amoy");
  // Sepolia
  moveContractAddressToSdk("ExampleGatedNFTMinter", "sepolia");
  moveContractAddressToSdk("ExampleGatedNFTMinter", "sepolia_local");
  moveContractAddressToSdk("ExampleNFTMinter", "sepolia");
  moveContractAddressToSdk("NexeraIDSignerManager", "sepolia");
  // Polygon Mainnet
  moveContractAddressToSdk("ExampleGatedNFTMinter", "polygon");
  moveContractAddressToSdk("ExampleNFTMinter", "polygon");
  moveContractAddressToSdk("NexeraIDSignerManager", "polygon");
  // Base
  moveContractAddressToSdk("NexeraIDSignerManager", "base");
};
moveAllContractAddressesToSdk();
