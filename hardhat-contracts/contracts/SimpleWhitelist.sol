// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import "./verifiers/NexeraZKPVerifier.sol";

/// @title SimpleWhitelist
/// @notice This example contract implements a simple whitelist mechanism using Zero-Knowledge Proofs (ZKPs).
contract SimpleWhitelist is NexeraZKPVerifier {
  // Constant for the transfer request ID.
  uint64 public constant TRANSFER_REQUEST_ID = 1;

  // Mapping from user ID to address.
  mapping(uint256 => address) public idToAddress;

  // Mapping from address to user ID.
  mapping(address => uint256) public addressToId;

  // Mapping to keep track of whitelisted addresses.
  mapping(address => bool) public whitelist;

  /// @dev Internal function called before submitting a proof.
  ///      Ensures that the challenge input is the address of the sender.
  /// @param inputs Array of inputs for the proof.
  /// @param validator The circuit validator.
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

  /// @dev Internal function called after submitting a proof.
  ///      Registers a user to the whitelist if the conditions are met.
  /// @param requestId The ID of the request being processed.
  /// @param inputs Array of inputs for the proof.
  /// @param validator The circuit validator.
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
