import fs from "fs";
import { Address } from "@compilot/sig-gating-contracts-sdk/lib";

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

// ABI
export const saveContractABI = (contractName: string, abi: any) => {
	saveTsFile(
		`${contractName}ABI`,
		JSON.stringify(abi, null, 2),
		`../contracts-sdk/src/abis/${contractName}ABI.ts`,
	);
};

// ByteCode
export const saveContractByteCode = (
	contractName: string,
	byteCode: string,
) => {
	saveTsFile(
		`${contractName}ByteCode`,
		`"${byteCode}"`,
		`../contracts-sdk/src/bytecodes/${contractName}ByteCode.ts`,
	);
};

// Factory addresses

export const saveFactoryAddresses = (
	factoryName: string,
	network: string,
	address: Address,
) => {
	saveTsFile(
		`${factoryName}Address_${network}`,
		`"${address}"`,
		`../contracts-sdk/src/addresses/${factoryName}Address_${network}.ts`,
	);
};
