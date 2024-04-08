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
  txAuthSigner: {
    default: 0,
  },
  externalContract: {
    default: 2,
  },
};

export default namedAccounts;
