export const ScenarioVerifierFactoryABI = [
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
    name: "NewScenarioVerifierDeployed",
    type: "event",
  },
  {
    inputs: [],
    name: "createScenarioVerifier",
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
