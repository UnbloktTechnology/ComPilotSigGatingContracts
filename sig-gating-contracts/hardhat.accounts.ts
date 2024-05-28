const namedAccounts: {
  [name: string]:
    | string
    | number
    | { [network: string]: null | number | string };
} = {
  deployer: {
    default: 0,
  },
  tester: {
    default: 1,
  },
  externalContract: {
    default: 2,
  },
  signerManagerController: {
    default: 3,
  },
  pauser: {
    default: 4,
  },
  txAuthSignerAddress: {
    default: 5,
  },
};

export default namedAccounts;
