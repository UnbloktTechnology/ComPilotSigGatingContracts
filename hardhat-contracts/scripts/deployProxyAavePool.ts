import { deployProxyAavePool } from "../lib/deploy/deployProxyAavePool";

//dev
//const nexeraVerifierAddress = "0x7e703f7d16ce13ba3be8e0d63d569a9db884204f";
//local for a41da23c-afe4-4a03-8d84-6be8a9336752
const nexeraVerifierAddress = "0x3f03a2C2F8e345B3894c3D871c97Fb5ae5b26Dd7";

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployProxyAavePool(nexeraVerifierAddress).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
