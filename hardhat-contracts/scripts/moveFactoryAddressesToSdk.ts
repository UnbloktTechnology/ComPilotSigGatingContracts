import fs from "fs";

import { saveFactoryAddresses } from "./saveTsFiles";

export const moveFactoryAddressToSdk = (
  factoryName: string,
  network: string
) => {
  // Load the JSON file
  const jsonFile = `./deployments/${network}/${factoryName}.json`; // Replace with your JSON file's path
  const rawData = fs.readFileSync(jsonFile);
  const jsonData = JSON.parse(rawData);
  const address = jsonData.address;
  saveFactoryAddresses(factoryName, network, address);
};

export const moveAllFactoryAddressesToSdk = () => {
  // Mumbai
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "mumbai_dev");
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "mumbai_staging");
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "mumbai_prod");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "mumbai_dev");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "mumbai_staging");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "mumbai_prod");
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
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "sepolia_dev");
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "sepolia_staging");
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "sepolia_prod");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "sepolia_dev");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "sepolia_staging");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "sepolia_prod");
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
