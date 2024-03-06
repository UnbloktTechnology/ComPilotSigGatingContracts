export const VerifierSigWrapperABI = [
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[]",
        name: "input",
        type: "uint256[]",
      },
    ],
    name: "verify",
    outputs: [
      {
        internalType: "bool",
        name: "r",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "_pA",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "_pB",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "_pC",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[11]",
        name: "_pubSignals",
        type: "uint256[11]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
