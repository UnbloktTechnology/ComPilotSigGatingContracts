/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  VerifierMTPWrapper,
  VerifierMTPWrapperInterface,
} from "../VerifierMTPWrapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[]",
        name: "input",
        type: "uint256[]",
      },
    ],
    name: "verify",
    outputs: [
      {
        internalType: "bool",
        name: "r",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
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
  "0x6080806040523461001657610e18908161001c8239f35b600080fdfe60806040526004361015610013575b600080fd5b6000803560e01c9081632612907c1461003e575063b9c6ea871461003657600080fd5b61000e6100fb565b346100d0576101203660031901126100d057610059366100d3565b610062366100ee565b61006b366100e0565b906101043567ffffffffffffffff948582116100d057366023830112156100d05781600401359586116100d0573660248760051b840101116100d0576100cc6100ba876024850187878a610d15565b60405190151581529081906020820190565b0390f35b80fd5b9060049160441161000e57565b9060c4916101041161000e57565b9060449160c41161000e57565b503461000e5761026036600319011261000e57610117366100d3565b610120366100ee565b610129366100e0565b6102649136831161000e576101d6936101d1604051946103808601604052610153610104356101df565b61015f610124356101df565b61016b610144356101df565b610177610164356101df565b610183610184356101df565b61018f6101a4356101df565b61019b6101c4356101df565b6101a76101e4356101df565b6101b3610204356101df565b6101bf610224356101df565b6101cb610244356101df565b356101df565b6107dd565b60005260206000f35b7f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47111561020857565b6000805260206000f35b604080517f2b0b7e4eb338e79dc49653f0a32a4acb42d6d65d67d6a8796c8d292012f9914281527f23c72bedb38cd965afd5a35233c42c2cd8fa23d2291ced5153eb0945cc42c27060208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f0bc7aa6c1aef693444e35935cea1fa02ceef7c4eb684e0a71c380bd1cbea394681527f29cbfecbf222d323af8e1c9654292ece38b45352b18200308e6259773dd5457a60208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f182bf69bce645da388b8fb33616b6c43c48a50c499d07be536520191ef91dc0881527f286a77cb393820c524cdd54518ea43d3f27d595bf6a910694a1170fbe356854260208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f198e0c3ad41c05fced9aa2d6e27d9a2c9818b5b88f19c2e698a8648129b6af6a81527f105535f6a709c5189e305e1a0c70efb5fae522a60afe6fed5c805dbbc8779e2960208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517e9237f01920dbe104631d35579740ad6195073ec934184477efaef11e8ee3aa81527f1243fb77067200f806f576091ea92a5281f060234e6fc57df1901b4e3450bb6960208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f1b09b7fd32d49bbfe0e15e8258a70ae9ebb9316cef0f9b6feb828a5fc6a2452881527f2b72e8feb8d4ff6aa248af1456fc4899864b0489b8279a5bb94e5f639a8f1ac660208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f2f894980bdbd71026b861c9c9feaf6cd797e28188a9b4154ba63ce83f36a29f281527f1823654e6782371e622b0629518c890a115d6d2cae9bb2c55180143aa0212bd760208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f013d2f682053227157adb588e8533b32e74b1e042d55f83933244f08650abdbd81527e6a9965248ae4075ea54dc532370d14ff99d0c686fc5c23b82176baf60dbb7b60208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f1c9cc75a83a50251238fc513eea4f2effb5e26d5b592b48250ed3e5c9759179081527f1c09ec2c3abe8e173ecbe443fd8e7c2f5ec2024843440235cc1196ee8070f78c60208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f18917ec1f1868dadff1a3196e6804296cac2d322e29574a93c37f25e4003c1ca81527f0e9f0a02b712bb78f13b08c8a99ded7165ed62f95feb1c4c0573073b63aca92160208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b604080517f1e18dba9927d3c91dbcba83e9cb8f533b2c9c9282fa808f11d5f7bcf404b142f81527f0bc5e6897fac05c15be2a6dbe4ab2a5eb0fb51a5d67efb83a582dc5ae2d410e460208201528082019384526107cf1991816060816007865a01fa1561020857600660809260409585519052602085015160608401525a01fa1561020857565b9260208093606095608084019687957f02e76356c6f5d7f49e6d4f6ec3a93cdc50cc3c271b41a11b21fc6c219031429e8652848601927f21d57a61a975d9eb14e29a76de5ad78404f7db5867e0c49d51e939f1cbdd298d84526108436101043588610212565b6108506101243588610299565b61085d6101443588610320565b61086a61016435886103a7565b610877610184358861042e565b6108846101a435886104b4565b6108916101c4358861053b565b61089e6101e435886105c2565b6108ab6102043588610648565b6108b861022435886106cf565b6108c56102443588610756565b80358852857f30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd4791013581030660a0870152803560c08701528481013560e0870152604081013561010087015201356101208501527f2d4d9aa7e302d9df41749d5507949d05dbea33fbb16c643b22f599a2be6df2e26101408501527f14bedd503c37ceb061d8ec60209fe345ce89830a19230301f076caff004d19266101608501527f0967032fcbf776d1afc985f88877f182d38480a653f2decaa9794cbc3bf3060c6101808501527f0e187847ad4c798374d0d6732bf501847dd68bc0e071241e0213bc7fc13db7ab6101a08501527f304cfbd1e08a704a99f5e847d93f8c3caafddec46b7a0d379da69a4d112346a76101c08501527f1739c1b1a457a8c7313123d24d2f9192f896b7c63eea05a9d57f06547ad0cec86101e08501528351610200850152516102208401527f198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c26102408401527f1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed6102608401527f090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b6102808401527f12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa6102a084015280356102c084015201356102e08201527f12ec59350afb7e582f8d6c48d20afe0343cf2396a8af0d260ed0b7e5c0baf138610360610300927f1642e1e5564fdfd598d06d6c6c0bcb91104f0b5be1af80ee3a05cbb870931bd5848201527f2eaa248f26eb631ada70bf8472546eb9deaa6d10d2bbdf452eeac795bcd4cba86103208201527f0aba69025c669be9ea7cfc27e650a4f33580b7fbed2c8c48254895820422c08f61034082015201528160086107cf195a01fa90511690565b50634e487b7160e01b600052604160045260246000fd5b610160810190811067ffffffffffffffff821117610b9f57604052565b610ba7610b6b565b604052565b90601f8019910116810190811067ffffffffffffffff821117610b9f57604052565b15610bd557565b60405162461bcd60e51b815260206004820152601b60248201527f6578706563746564206172726179206c656e67746820697320313100000000006044820152606490fd5b6000198114610c295760010190565b634e487b7160e01b600052601160045260246000fd5b50634e487b7160e01b600052603260045260246000fd5b9190811015610c67575b60051b0190565b610c6f610c3f565b610c60565b90600b811015610c675760051b0190565b9081602091031261000e5751801515810361000e5790565b9194939261026083019560408093853760008484015b60028210610cf35750505090829160c061010094013701906000915b600b8310610cdc57505050565b600190825181526020809101920192019190610ccf565b84808281866001953701930191019091610cb3565b506040513d6000823e3d90fd5b909192949360405190610d2782610b82565b610160368337600b90610d3b828214610bce565b60005b828110610dbd57505060405163b9c6ea8760e01b815295965060209486948594610d6d94935060048601610c9d565b0381305afa908115610db0575b600091610d85575090565b610da6915060203d8111610da9575b610d9e8183610bac565b810190610c85565b90565b503d610d94565b610db8610d08565b610d7a565b80610dcc610ddd92848c610c56565b35610dd78287610c74565b52610c1a565b610d3e56fea2646970667358221220b74e30f4293e37eb134905ba556af5f4cc1133141738b12b065767121a31bfe764736f6c63430008100033";

export class VerifierMTPWrapper__factory extends ContractFactory {
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
  ): Promise<VerifierMTPWrapper> {
    return super.deploy(overrides || {}) as Promise<VerifierMTPWrapper>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): VerifierMTPWrapper {
    return super.attach(address) as VerifierMTPWrapper;
  }
  connect(signer: Signer): VerifierMTPWrapper__factory {
    return super.connect(signer) as VerifierMTPWrapper__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VerifierMTPWrapperInterface {
    return new utils.Interface(_abi) as VerifierMTPWrapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): VerifierMTPWrapper {
    return new Contract(address, _abi, signerOrProvider) as VerifierMTPWrapper;
  }
}
