const namedAccounts: {
  [name: string]:
    | string
    | number
    | { [network: string]: null | number | string };
} = {
  deployer: {
    80001: "privatekey://" + process.env.MUMBAI_PRIVATE_KEY, // mumbai change for correct address
    default: 0,
  },
  tester: {
    default: 1,
  },
};

export default namedAccounts;
