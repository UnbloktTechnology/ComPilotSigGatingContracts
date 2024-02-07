/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  PoseidonUnit2L,
  PoseidonUnit2LInterface,
} from "../PoseidonUnit2L";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "",
        type: "uint256[2]",
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
  "0x60808060405234601857607b908161001e823930815050f35b600080fdfe6080806040526004361015601257600080fd5b600090813560e01c6329a5f2f614602857600080fd5b6040366003190112604157366044116041576020918152f35b5080fdfea2646970667358221220cda3c8ef525742deea32cd80cb3ae6cade1756170311ed2d66d52113d490b56864736f6c63430008100033";

export class PoseidonUnit2L__factory extends ContractFactory {
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
  ): Promise<PoseidonUnit2L> {
    return super.deploy(overrides || {}) as Promise<PoseidonUnit2L>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): PoseidonUnit2L {
    return super.attach(address) as PoseidonUnit2L;
  }
  connect(signer: Signer): PoseidonUnit2L__factory {
    return super.connect(signer) as PoseidonUnit2L__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PoseidonUnit2LInterface {
    return new utils.Interface(_abi) as PoseidonUnit2LInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PoseidonUnit2L {
    return new Contract(address, _abi, signerOrProvider) as PoseidonUnit2L;
  }
}
