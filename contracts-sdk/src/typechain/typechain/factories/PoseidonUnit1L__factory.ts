/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  PoseidonUnit1L,
  PoseidonUnit1LInterface,
} from "../PoseidonUnit1L";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[1]",
        name: "",
        type: "uint256[1]",
      },
    ],
    name: "poseidon",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x60808060405234601857607b908161001e823930815050f35b600080fdfe6080806040526004361015601257600080fd5b600090813560e01c631caab9a714602857600080fd5b6020366003190112604157366024116041576020918152f35b5080fdfea264697066735822122041c56e02e465690fec3951f6f7b6279f9ea08e3e77ad406e0812999f37b0c7fc64736f6c63430008100033";

export class PoseidonUnit1L__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PoseidonUnit1L> {
    return super.deploy(overrides || {}) as Promise<PoseidonUnit1L>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): PoseidonUnit1L {
    return super.attach(address) as PoseidonUnit1L;
  }
  connect(signer: Signer): PoseidonUnit1L__factory {
    return super.connect(signer) as PoseidonUnit1L__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PoseidonUnit1LInterface {
    return new utils.Interface(_abi) as PoseidonUnit1LInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PoseidonUnit1L {
    return new Contract(address, _abi, signerOrProvider) as PoseidonUnit1L;
  }
}
