/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ScenarioVerifierFactory,
  ScenarioVerifierFactoryInterface,
} from "../ScenarioVerifierFactory";

const _abi = [
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
];

const _bytecode =
  "0x60a0346100ca57601f6102f738819003918201601f19168301916001600160401b038311848410176100cf578084926020946040528339810103126100ca57516001600160a01b0381168082036100ca571561006f5760805260405161021190816100e682396080518160560152f35b60405162461bcd60e51b815260206004820152602d60248201527f5f696d706c656d656e746174696f6e436f6e74726163742063616e277420626560448201526c207a65726f206164647265737360981b6064820152608490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe608080604052600436101561001357600080fd5b600090813560e01c633e7e27c01461002a57600080fd5b34610190578160031936011261019057733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81527f000000000000000000000000000000000000000000000000000000000000000060601b6094526e5af43d82803e903d91602b57fd5bf360881b60a85260378183f0906001600160a01b03821690811561015b576001600160a01b0383166080527fccf6fc644a54609387c6734eb29b33fb942c8d5a66561f70594648a2377a81b490602090a1803b156101575760405163189acdbd60e31b815233600482015261012d9390918290602490829084905af1801561014a575b610131575b506040516001600160a01b0390911681529081906020820190565b0390f35b8061013e610144926101a4565b80610194565b38610112565b6101526101ce565b61010d565b8280fd5b62461bcd60e51b81526020608452601660a45275115490cc4c4d8dce8818dc99585d194819985a5b195960521b60c452606490fd5b5080fd5b600091031261019f57565b600080fd5b67ffffffffffffffff81116101b857604052565b634e487b7160e01b600052604160045260246000fd5b506040513d6000823e3d90fdfea26469706673582212200bb2412c390a5f794f1d27ef38b7533b15ea7853823e36f071e8097bfdcac0f164736f6c63430008100033";

export class ScenarioVerifierFactory__factory extends ContractFactory {
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
    _implementationContract: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ScenarioVerifierFactory> {
    return super.deploy(
      _implementationContract,
      overrides || {}
    ) as Promise<ScenarioVerifierFactory>;
  }
  getDeployTransaction(
    _implementationContract: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_implementationContract, overrides || {});
  }
  attach(address: string): ScenarioVerifierFactory {
    return super.attach(address) as ScenarioVerifierFactory;
  }
  connect(signer: Signer): ScenarioVerifierFactory__factory {
    return super.connect(signer) as ScenarioVerifierFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ScenarioVerifierFactoryInterface {
    return new utils.Interface(_abi) as ScenarioVerifierFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ScenarioVerifierFactory {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ScenarioVerifierFactory;
  }
}
