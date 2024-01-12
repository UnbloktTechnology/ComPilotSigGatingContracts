export const VerifierEntrypointFactoryABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_implementationContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "scenarioVerifierAddress",
        type: "address",
      },
    ],
    name: "NewVerifierEntrypointDeployed",
    type: "event",
  },
  {
    inputs: [],
    name: "createVerifierEntrypoint",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
