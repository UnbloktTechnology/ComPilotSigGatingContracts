export const ExampleMultipleInputsABI = [
	{
		inputs: [
			{
				internalType: "address",
				name: "signerAddress",
				type: "address",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [],
		name: "BlockExpired",
		type: "error",
	},
	{
		inputs: [],
		name: "InvalidSignature",
		type: "error",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "chainID",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "nonce",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "blockExpiration",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "contractAddress",
				type: "address",
			},
			{
				indexed: false,
				internalType: "address",
				name: "userAddress",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bytes",
				name: "functionCallData",
				type: "bytes",
			},
		],
		name: "CompilotSignatureVerified",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "newSigner",
				type: "address",
			},
		],
		name: "SignerChanged",
		type: "event",
	},
	{
		inputs: [],
		name: "getBytesVariable",
		outputs: [
			{
				internalType: "bytes",
				name: "",
				type: "bytes",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getIntVariable",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: "uint256",
						name: "chainID",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "nonce",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "blockExpiration",
						type: "uint256",
					},
					{
						internalType: "address",
						name: "contractAddress",
						type: "address",
					},
					{
						internalType: "address",
						name: "userAddress",
						type: "address",
					},
					{
						internalType: "bytes",
						name: "functionCallData",
						type: "bytes",
					},
				],
				internalType: "struct BaseTxAuthDataVerifier.TxAuthData",
				name: "_txAuthData",
				type: "tuple",
			},
		],
		name: "getMessageHash",
		outputs: [
			{
				internalType: "bytes32",
				name: "",
				type: "bytes32",
			},
		],
		stateMutability: "pure",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "nonces",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_signer",
				type: "address",
			},
		],
		name: "setSigner",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "txAuthDataSignerAddress",
		outputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "user",
				type: "address",
			},
		],
		name: "txAuthDataUserNonce",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_intVariable",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_addressVariable",
				type: "address",
			},
			{
				internalType: "bytes",
				name: "_bytesVariable",
				type: "bytes",
			},
			{
				internalType: "bytes",
				name: "_bytesVariable2",
				type: "bytes",
			},
		],
		name: "updateVariables",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "updateVariablesNoInput",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;
