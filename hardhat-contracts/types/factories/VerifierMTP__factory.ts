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
  "0x608060405234801561001057600080fd5b506109b5806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063b9c6ea8714610030575b600080fd5b61004a600480360381019061004591906108e0565b610060565b6040516100579190610964565b60405180910390f35b60006107ae565b7f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd478110610098576000805260206000f35b50565b600060405183815284602082015285604082015260408160608360076107d05a03fa9150816100ce576000805260206000f35b825160408201526020830151606082015260408360808360066107d05a03fa9150816100fe576000805260206000f35b505050505050565b600060808601600087017f02e76356c6f5d7f49e6d4f6ec3a93cdc50cc3c271b41a11b21fc6c219031429e81527f21d57a61a975d9eb14e29a76de5ad78404f7db5867e0c49d51e939f1cbdd298d60208201526101a960008801357f23c72bedb38cd965afd5a35233c42c2cd8fa23d2291ced5153eb0945cc42c2707f2b0b7e4eb338e79dc49653f0a32a4acb42d6d65d67d6a8796c8d292012f991428461009b565b6101f960208801357f29cbfecbf222d323af8e1c9654292ece38b45352b18200308e6259773dd5457a7f0bc7aa6c1aef693444e35935cea1fa02ceef7c4eb684e0a71c380bd1cbea39468461009b565b61024960408801357f286a77cb393820c524cdd54518ea43d3f27d595bf6a910694a1170fbe35685427f182bf69bce645da388b8fb33616b6c43c48a50c499d07be536520191ef91dc088461009b565b61029960608801357f105535f6a709c5189e305e1a0c70efb5fae522a60afe6fed5c805dbbc8779e297f198e0c3ad41c05fced9aa2d6e27d9a2c9818b5b88f19c2e698a8648129b6af6a8461009b565b6102e860808801357f1243fb77067200f806f576091ea92a5281f060234e6fc57df1901b4e3450bb697e9237f01920dbe104631d35579740ad6195073ec934184477efaef11e8ee3aa8461009b565b61033860a08801357f2b72e8feb8d4ff6aa248af1456fc4899864b0489b8279a5bb94e5f639a8f1ac67f1b09b7fd32d49bbfe0e15e8258a70ae9ebb9316cef0f9b6feb828a5fc6a245288461009b565b61038860c08801357f1823654e6782371e622b0629518c890a115d6d2cae9bb2c55180143aa0212bd77f2f894980bdbd71026b861c9c9feaf6cd797e28188a9b4154ba63ce83f36a29f28461009b565b6103d760e08801357e6a9965248ae4075ea54dc532370d14ff99d0c686fc5c23b82176baf60dbb7b7f013d2f682053227157adb588e8533b32e74b1e042d55f83933244f08650abdbd8461009b565b6104286101008801357f1c09ec2c3abe8e173ecbe443fd8e7c2f5ec2024843440235cc1196ee8070f78c7f1c9cc75a83a50251238fc513eea4f2effb5e26d5b592b48250ed3e5c975917908461009b565b6104796101208801357f0e9f0a02b712bb78f13b08c8a99ded7165ed62f95feb1c4c0573073b63aca9217f18917ec1f1868dadff1a3196e6804296cac2d322e29574a93c37f25e4003c1ca8461009b565b6104ca6101408801357f0bc5e6897fac05c15be2a6dbe4ab2a5eb0fb51a5d67efb83a582dc5ae2d410e47f1e18dba9927d3c91dbcba83e9cb8f533b2c9c9282fa808f11d5f7bcf404b142f8461009b565b833582527f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4760208501357f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4703066020830152843560408301526020850135606083015260408501356080830152606085013560a08301527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e260c08301527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d192660e08301527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c6101008301527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab6101208301527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a76101408301527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec8610160830152600088015161018083015260206000018801516101a08301527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26101c08301527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6101e08301527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b6102008301527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa610220830152853561024083015260208601356102608301527f1642e1e5564fdfd598d06d6c6c0bcb91104f0b5be1af80ee3a05cbb870931bd56102808301527f2eaa248f26eb631ada70bf8472546eb9deaa6d10d2bbdf452eeac795bcd4cba86102a08301527f0aba69025c669be9ea7cfc27e650a4f33580b7fbed2c8c48254895820422c08f6102c08301527f12ec59350afb7e582f8d6c48d20afe0343cf2396a8af0d260ed0b7e5c0baf1386102e08301526020826103008460086107d05a03fa82518116935050505095945050505050565b60405161038081016040526107c66000840135610067565b6107d36020840135610067565b6107e06040840135610067565b6107ed6060840135610067565b6107fa6080840135610067565b61080760a0840135610067565b61081460c0840135610067565b61082160e0840135610067565b61082f610100840135610067565b61083d610120840135610067565b61084b610140840135610067565b610859610160840135610067565b610866818486888a610106565b8060005260206000f35b600080fd5b600080fd5b60008190508260206002028201111561089657610895610875565b5b92915050565b6000819050826040600202820111156108b8576108b7610875565b5b92915050565b6000819050826020600b02820111156108da576108d9610875565b5b92915050565b60008060008061026085870312156108fb576108fa610870565b5b60006109098782880161087a565b945050604061091a8782880161089c565b93505060c061092b8782880161087a565b92505061010061093d878288016108be565b91505092959194509250565b60008115159050919050565b61095e81610949565b82525050565b60006020820190506109796000830184610955565b9291505056fea264697066735822122074d572ae669eb2dfa77f8ba55dd8e02b1af41fed40d4dbf34e2528d20a79e1fb64736f6c63430008100033";

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