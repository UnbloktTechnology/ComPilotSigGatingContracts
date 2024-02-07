/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ProxyAavePool, ProxyAavePoolInterface } from "../ProxyAavePool";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_nexeraVerifierAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "aavePoolAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nexeraVerifierAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "permitV",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "permitR",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "permitS",
        type: "bytes32",
      },
    ],
    name: "supplyWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60803461007457601f6103f738819003918201601f19168301916001600160401b038311848410176100795780849260209460405283398101031261007457516001600160a01b0381169081900361007457600080546001600160a01b03191691909117905560405161036790816100908239f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe6080604052600436101561002c575b361561001f575b61001d6102e3565b005b610027610182565b610015565b6000803560e01c90816302c205f01461007f575080638b2a4df514610076578063a654897b1461006d5763ee567cd90361000e57610068610152565b61000e565b50610068610128565b506100686100fb565b9050346100c7576101003660031901126100c75761009b6100ca565b506100a46100e5565b5060643561ffff8116036100c75760a43560ff8116036100c75750610068610258565b80fd5b600435906001600160a01b03821682036100e057565b600080fd5b604435906001600160a01b03821682036100e057565b346100e05760603660031901126100e0576101146100ca565b5061011d6100e5565b506101266102e3565b565b50346100e05760003660031901126100e0576000546040516001600160a01b039091168152602090f35b50346100e05760003660031901126100e057602060405173cc6114b983e4ed2737e9bd3961c9924e6216c7048152f35b506000368180378080368173cc6114b983e4ed2737e9bd3961c9924e6216c7045af43d82803e156101b1573d90f35b3d90fd5b90601f8019910116810190811067ffffffffffffffff8211176101d757604052565b634e487b7160e01b600052604160045260246000fd5b908160209103126100e0575180151581036100e05790565b506040513d6000823e3d90fd5b1561021957565b60405162461bcd60e51b8152602060048201526017602482015276155cd95c881a5cc81b9bdd081dda1a5d195b1a5cdd1959604a1b6044820152606490fd5b6000805460405163b347e74160e01b81523360048201526102a0929091602091839160249183916001600160a01b03165af19081156102d6575b6000916102a8575b50610212565b6101266102e3565b6102c9915060203d81116102cf575b6102c181836101b5565b8101906101ed565b3861029a565b503d6102b7565b6102de610205565b610292565b6000805460405163b347e74160e01b8152336004820152610329929091602091839160249183916001600160a01b03165af19081156102d6576000916102a85750610212565b61012661018256fea2646970667358221220990277195a72d80fe731ff9a3ca1777f8d499f533bf8ea71ad8cf98fbfe6b08464736f6c63430008100033";

export class ProxyAavePool__factory extends ContractFactory {
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
    _nexeraVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ProxyAavePool> {
    return super.deploy(
      _nexeraVerifierAddress,
      overrides || {}
    ) as Promise<ProxyAavePool>;
  }
  getDeployTransaction(
    _nexeraVerifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_nexeraVerifierAddress, overrides || {});
  }
  attach(address: string): ProxyAavePool {
    return super.attach(address) as ProxyAavePool;
  }
  connect(signer: Signer): ProxyAavePool__factory {
    return super.connect(signer) as ProxyAavePool__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ProxyAavePoolInterface {
    return new utils.Interface(_abi) as ProxyAavePoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ProxyAavePool {
    return new Contract(address, _abi, signerOrProvider) as ProxyAavePool;
  }
}
