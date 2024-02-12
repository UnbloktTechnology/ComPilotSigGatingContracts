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
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "mumbai_dev");
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "mumbai_staging");
  moveFactoryAddressToSdk("VerifierEntrypointFactory", "mumbai_prod");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "mumbai_dev");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "mumbai_staging");
  moveFactoryAddressToSdk("ScenarioVerifierFactory", "mumbai_prod");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "mumbai_dev");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "mumbai_staging");
  moveFactoryAddressToSdk("ExampleGatedNFTMinter", "mumbai_prod");
};
moveAllFactoryAddressesToSdk();
