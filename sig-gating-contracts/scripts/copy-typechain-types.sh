mkdir -p ../contracts-sdk/src/typechain &&
mkdir -p ../contracts-sdk/src/typechain/factories &&
cp -r ../sig-gating-contracts/typechain/ExampleGatedNFTMinter.d.ts ../contracts-sdk/src/typechain/ExampleGatedNFTMinter.d.ts &&
cp -r ../sig-gating-contracts/typechain/TxAuthDataVerifier.d.ts ../contracts-sdk/src/typechain/TxAuthDataVerifier.d.ts