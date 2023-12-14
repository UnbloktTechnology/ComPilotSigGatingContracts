import fs from "fs";

export const saveTsFile = (
  constName: string,
  value: any,
  tsFilePath: string,
) => {
  // Create the TypeScript content
  const tsContent = `
export const ${constName} = ${value} as const;
`;

  // Save the TypeScript content to a file
  fs.writeFileSync(tsFilePath, tsContent);

  console.log(`Value processed and saved to ${tsFilePath}`);
};

// Scenario verifier

export const saveScenarioByteCode = (byteCode: string) => {
  saveTsFile(
    "ScenarioVerifierByteCode",
    `"${byteCode}"`,
    "./../../packages/libs/on-chain-verification-sdk/src/abis/ScenarioVerifierByteCode.ts",
  );
};

export const saveScenarioABI = (abi: any) => {
  saveTsFile(
    "ScenarioVerifierABI",
    JSON.stringify(abi, null, 2),
    "./../../packages/libs/on-chain-verification-sdk/src/abis/ScenarioVerifierABI.ts",
  );
};

// NexeraVerifierEntrypoint

export const saveNexeraVerifierEntrypointByteCode = (byteCode: string) => {
  saveTsFile(
    "NexeraVerifierEntrypointByteCode",
    `"${byteCode}"`,
    "./../../packages/libs/on-chain-verification-sdk/src/abis/NexeraVerifierEntrypointByteCode.ts",
  );
};

export const saveNexeraVerifierEntrypointABI = (abi: any) => {
  saveTsFile(
    "NexeraVerifierEntrypointABI",
    JSON.stringify(abi, null, 2),
    "./../../packages/libs/on-chain-verification-sdk/src/abis/NexeraVerifierEntrypointABI.ts",
  );
};

// CredentialAtomicQuerySigValidator
export const saveCAQSVByteCode = (byteCode: string) => {
  saveTsFile(
    "CredentialAtomicQuerySigValidatorByteCode",
    `"${byteCode}"`,
    "./../../packages/libs/on-chain-verification-sdk/src/abis/CredentialAtomicQuerySigValidatorByteCode.ts",
  );
};

export const saveCAQSVABI = (abi: any) => {
  saveTsFile(
    "CredentialAtomicQuerySigValidatorABI",
    JSON.stringify(abi, null, 2),
    "./../../packages/libs/on-chain-verification-sdk/src/abis/CredentialAtomicQuerySigValidatorABI.ts",
  );
};

// VerifierSigWrapper

export const saveVerifierSigWrapperByteCode = (byteCode: string) => {
  saveTsFile(
    "VerifierSigWrapperByteCode",
    `"${byteCode}"`,
    "./../../packages/libs/on-chain-verification-sdk/src/abis/VerifierSigWrapperByteCode.ts",
  );
};

export const saveVerifierSigWrapperABI = (abi: any) => {
  saveTsFile(
    "VerifierSigWrapperABI",
    JSON.stringify(abi, null, 2),
    "./../../packages/libs/on-chain-verification-sdk/src/abis/VerifierSigWrapperABI.ts",
  );
};
