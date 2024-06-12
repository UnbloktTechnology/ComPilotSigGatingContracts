const namedAccounts: {
  [name: string]:
    | string
    | number
    | { [network: string]: null | number | string };
} = {
  deployer: {
    default: 0,
  },
  signerManagerController: {
    default: 1,
  },
  pauser: {
    default: 2,
  },
  txAuthSignerAddress: {
    default: 0, // for testnets, txAuthSignerAddress will be the same as deployer
  },
  tester: {
    default: 4,
  },
  tester2: {
    default: 5,
  },
  externalContract: {
    default: 6,
  },
};

export default namedAccounts;
