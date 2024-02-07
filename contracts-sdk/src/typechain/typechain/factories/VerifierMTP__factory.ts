/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { VerifierMTP, VerifierMTPInterface } from "../VerifierMTP";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "_pA",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "_pB",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "_pC",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[11]",
        name: "_pubSignals",
        type: "uint256[11]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x6080806040523461001657610ad8908161001c8239f35b600080fdfe6080604052600436101561001257600080fd5b6000803560e01c63b9c6ea871461002857600080fd5b3461010c5761026036600319011261010c576100433661010f565b3660c4116101085761005436610121565b906102643681116101045791610100916100fb6020959461040060405261007d6101043561012f565b6100896101243561012f565b6100956101443561012f565b6100a16101643561012f565b6100ad6101843561012f565b6100b96101a43561012f565b6100c56101c43561012f565b6100d16101e43561012f565b6100dd6102043561012f565b6100e96102243561012f565b6100f56102443561012f565b3561012f565b61074e565b8152f35b8380fd5b5080fd5b80fd5b9060049160441161011c57565b600080fd5b9060c4916101041161011c57565b7f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47111561015857565b6000805260206000f35b604051907f2b0b7e4eb338e79dc49653f0a32a4acb42d6d65d67d6a8796c8d292012f9914282527f23c72bedb38cd965afd5a35233c42c2cd8fa23d2291ced5153eb0945cc42c2706020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f0bc7aa6c1aef693444e35935cea1fa02ceef7c4eb684e0a71c380bd1cbea394682527f29cbfecbf222d323af8e1c9654292ece38b45352b18200308e6259773dd5457a6020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f182bf69bce645da388b8fb33616b6c43c48a50c499d07be536520191ef91dc0882527f286a77cb393820c524cdd54518ea43d3f27d595bf6a910694a1170fbe35685426020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f198e0c3ad41c05fced9aa2d6e27d9a2c9818b5b88f19c2e698a8648129b6af6a82527f105535f6a709c5189e305e1a0c70efb5fae522a60afe6fed5c805dbbc8779e296020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907e9237f01920dbe104631d35579740ad6195073ec934184477efaef11e8ee3aa82527f1243fb77067200f806f576091ea92a5281f060234e6fc57df1901b4e3450bb696020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f1b09b7fd32d49bbfe0e15e8258a70ae9ebb9316cef0f9b6feb828a5fc6a2452882527f2b72e8feb8d4ff6aa248af1456fc4899864b0489b8279a5bb94e5f639a8f1ac66020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f2f894980bdbd71026b861c9c9feaf6cd797e28188a9b4154ba63ce83f36a29f282527f1823654e6782371e622b0629518c890a115d6d2cae9bb2c55180143aa0212bd76020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f013d2f682053227157adb588e8533b32e74b1e042d55f83933244f08650abdbd82527e6a9965248ae4075ea54dc532370d14ff99d0c686fc5c23b82176baf60dbb7b6020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f1c9cc75a83a50251238fc513eea4f2effb5e26d5b592b48250ed3e5c9759179082527f1c09ec2c3abe8e173ecbe443fd8e7c2f5ec2024843440235cc1196ee8070f78c6020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f18917ec1f1868dadff1a3196e6804296cac2d322e29574a93c37f25e4003c1ca82527f0e9f0a02b712bb78f13b08c8a99ded7165ed62f95feb1c4c0573073b63aca9216020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b604051907f1e18dba9927d3c91dbcba83e9cb8f533b2c9c9282fa808f11d5f7bcf404b142f82527f0bc5e6897fac05c15be2a6dbe4ab2a5eb0fb51a5d67efb83a582dc5ae2d410e46020830152604082019081526107cf196040836060816007855a01fa156101585760409260066080939284938451905260a05160608401525a01fa1561015857565b6020907f02e76356c6f5d7f49e6d4f6ec3a93cdc50cc3c271b41a11b21fc6c219031429e6080527f21d57a61a975d9eb14e29a76de5ad78404f7db5867e0c49d51e939f1cbdd298d60a0526107a561010435610162565b6107b1610124356101ec565b6107bd61014435610276565b6107c961016435610300565b6107d56101843561038a565b6107e16101a435610413565b6107ed6101c43561049d565b6107f96101e435610527565b610805610204356105b0565b6108116102243561063a565b61081d610244356106c4565b61010092818492358352837f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd479101358103066101205260443561014052606435610160526084356101805260a4356101a0527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e26101c0527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d19266101e0527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c610200527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab610220527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a7610240527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec8610260526080516102805260a0516102a0527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26102c0527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6102e05282610300917f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b83527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa610320528035610340520135610360527f1642e1e5564fdfd598d06d6c6c0bcb91104f0b5be1af80ee3a05cbb870931bd5610380527f2eaa248f26eb631ada70bf8472546eb9deaa6d10d2bbdf452eeac795bcd4cba86103a0527f0aba69025c669be9ea7cfc27e650a4f33580b7fbed2c8c48254895820422c08f6103c0527f12ec59350afb7e582f8d6c48d20afe0343cf2396a8af0d260ed0b7e5c0baf1386103e0528160086107cf195a01fa9051169056fea2646970667358221220a7cee23898195e73c7ad0c6ab03b6f9f2cf9ca744d9a231a2cbda0222e6952df64736f6c63430008100033";

export class VerifierMTP__factory extends ContractFactory {
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
  ): Promise<VerifierMTP> {
    return super.deploy(overrides || {}) as Promise<VerifierMTP>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): VerifierMTP {
    return super.attach(address) as VerifierMTP;
  }
  connect(signer: Signer): VerifierMTP__factory {
    return super.connect(signer) as VerifierMTP__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VerifierMTPInterface {
    return new utils.Interface(_abi) as VerifierMTPInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VerifierMTP {
    return new Contract(address, _abi, signerOrProvider) as VerifierMTP;
  }
}
