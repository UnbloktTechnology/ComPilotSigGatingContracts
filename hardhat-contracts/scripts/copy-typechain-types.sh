mkdir -p ../contracts-sdk/src/typechain &&
mkdir -p ../contracts-sdk/src/typechain/factories &&
cp -r ../hardhat-contracts/typechain/ExampleGatedNFTMinter.d.ts ../contracts-sdk/src/typechain/ExampleGatedNFTMinter.d.ts &&
cp -r ../hardhat-contracts/typechain/NexeraVerifierEntrypoint.d.ts ../contracts-sdk/src/typechain/NexeraVerifierEntrypoint.d.ts &&
cp -r ../hardhat-contracts/typechain/VerifierEntrypointFactory.d.ts ../contracts-sdk/src/typechain/VerifierEntrypointFactory.d.ts &&
cp -r ../hardhat-contracts/typechain/ScenarioVerifier.d.ts ../contracts-sdk/src/typechain/ScenarioVerifier.d.ts &&
cp -r ../hardhat-contracts/typechain/ScenarioVerifierFactory.d.ts ../contracts-sdk/src/typechain/ScenarioVerifierFactory.d.ts &&
cp -r ../hardhat-contracts/typechain/ProxyAavePool.d.ts ../contracts-sdk/src/typechain/ProxyAavePool.d.ts
