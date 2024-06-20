import { EdSignature, TezosTxAuthData, TezosTxCalldata } from "./schemas";

export function buildTxCallData(
  payload: TezosTxAuthData,
  signature: EdSignature
) {
  const txCallData: TezosTxCalldata = {
    userAddress: payload.userAddress,
    expirationBlock: payload.blockExpiration,
    contractAddress: payload.contractAddress,
    functionName: payload.functionCallName,
    functionArgs: payload.functionCallArgs,
    signerPublicKey: payload.signerPublicKey,
    signature: signature,
  };
  return txCallData;
}

export function buildTxCallDataNoContractAddress(
  payload: TezosTxAuthData,
  signature: EdSignature
) {
  const txCallData: TezosTxCalldata = {
    userAddress: payload.userAddress,
    expirationBlock: payload.blockExpiration,
    functionName: payload.functionCallName,
    functionArgs: payload.functionCallArgs,
    signerPublicKey: payload.signerPublicKey,
    signature: signature,
  };
  return txCallData;
}

export function buildTxCallDataNoFunctionName(
  payload: TezosTxAuthData,
  signature: EdSignature
) {
  const txCallData: TezosTxCalldata = {
    userAddress: payload.userAddress,
    expirationBlock: payload.blockExpiration,
    functionArgs: payload.functionCallArgs,
    signerPublicKey: payload.signerPublicKey,
    signature: signature,
  };
  return txCallData;
}
