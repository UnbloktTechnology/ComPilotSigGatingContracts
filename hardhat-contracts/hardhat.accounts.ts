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
};

export default namedAccounts;
