// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import "./verifiers/NexeraZKPVerifier.sol";

contract SimpleWhitelist is NexeraZKPVerifier {
  uint64 public constant TRANSFER_REQUEST_ID = 1;

  mapping(uint256 => address) public idToAddress;
  mapping(address => uint256) public addressToId;

  mapping(address => bool) public whitelist;

  constructor() {}

  function _beforeProofSubmit(
    uint64 /* requestId */,
    uint256[] memory inputs,
    ICircuitValidator validator
  ) internal view override {
    // check that  challenge input is address of sender
    address addr = PrimitiveTypeUtils.int256ToAddress(
      inputs[validator.inputIndexOf("challenge")]
    );
    // this is linking between msg.sender and
    require(_msgSender() == addr, "address in proof is not a sender address");
  }

  function _afterProofSubmit(
    uint64 requestId,
    uint256[] memory inputs,
    ICircuitValidator validator
  ) internal override {
    require(
      requestId == TRANSFER_REQUEST_ID && addressToId[_msgSender()] == 0,
      "proof can not be submitted more than once"
    );

    // get user id
    uint256 id = inputs[1];

    // additional check didn't get whitelisted before
    if (idToAddress[id] == address(0) && addressToId[_msgSender()] == 0) {
      whitelist[_msgSender()] = true;
      addressToId[_msgSender()] = id;
      idToAddress[id] = _msgSender();
    }
  }
}
