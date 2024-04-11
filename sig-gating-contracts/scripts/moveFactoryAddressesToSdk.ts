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

export const moveAllFactoryAddressesToSdk = () => {
  // Amoy
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "amoy_dev");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "amoy_staging");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "amoy_prod");
  moveFactoryAddressToSdk("ExampleNFTMinter", "amoy_dev");
  moveFactoryAddressToSdk("ExampleNFTMinter", "amoy_staging");
  moveFactoryAddressToSdk("ExampleNFTMinter", "amoy_prod");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "amoy_dev");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "amoy_staging");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "amoy_prod");
  // Mumbai
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "mumbai_dev");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "mumbai_staging");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "mumbai_prod");
  moveFactoryAddressToSdk("ExampleNFTMinter", "mumbai_dev");
  moveFactoryAddressToSdk("ExampleNFTMinter", "mumbai_staging");
  moveFactoryAddressToSdk("ExampleNFTMinter", "mumbai_prod");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "mumbai_dev");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "mumbai_staging");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "mumbai_prod");
  // Sepolia
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "sepolia_dev");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "sepolia_staging");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "sepolia_prod");
  moveFactoryAddressToSdk("ExampleNFTMinter", "sepolia_dev");
  moveFactoryAddressToSdk("ExampleNFTMinter", "sepolia_staging");
  moveFactoryAddressToSdk("ExampleNFTMinter", "sepolia_prod");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "sepolia_dev");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "sepolia_staging");
  moveFactoryAddressToSdk("NexeraIDSignerManager", "sepolia_prod");
};
moveAllFactoryAddressesToSdk();
