// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import "./verifiers/NexeraZKPVerifier.sol";
import "./interfaces/IScenarioVerifier.sol";

contract ScenarioVerifier is IScenarioVerifier, NexeraZKPVerifier {
  // Manage Rules
  uint64[] public registeredRuleIDs;
  mapping(uint64 => bool) public isRuleIdRegistered;
  mapping(uint64 => mapping(address => bool)) public queryRequestWhitelist;

  // Scenario Whitelist
  mapping(address => bool) public scenarioWhitelist;

  // ID to Address connection
  mapping(uint256 => address) public idToAddress;
  mapping(address => uint256) public addressToId;

  // Events

  // Emited when a ZKPRequest is registered in the verifier
  event RequestRegistered(uint64 requestId);

  // Emited when an address is associated with and id
  event AddressIdConnection(address userAddress, uint256 userId);

  // Emited when an address is allowed for a request id
  event UserAllowedForRequest(address userAddress, uint64 requestId);

  // Emited when whitelistScenario has iterated over all zkps in the input list
  event SubmitedAllZKPsForUser(address userAddress, ZKP[] zkps);

  // Emited when an address is allowed for the scenario verifier
  event UserAllowedForScenario(address userAddress);

  // TODO: add a blacklist function to reset the whitelist if a rule is replaced by another one
  function _afterSetRequest(uint64 requestId) internal override {
    // If requestId is not registered, register it to the list of registeredRuleIDs
    if (!isRuleIdRegistered[requestId]) {
      registeredRuleIDs.push(requestId);
      isRuleIdRegistered[requestId] = true;
      emit RequestRegistered(requestId);
    }
  }

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
    ICircuitValidator _validator
  ) internal override {
    // get user id and register it
    uint256 id = inputs[1];
    addressToId[_msgSender()] = id;
    idToAddress[id] = _msgSender();
    emit AddressIdConnection(_msgSender(), id);

    // Whitelist user for this rule
    queryRequestWhitelist[requestId][_msgSender()] = true;
    emit UserAllowedForRequest(_msgSender(), requestId);
  }

  // Once the user is whitelisted for all rules, call this function to finalize
  // (this is more gas efficient than iterating over rules on every submission)
  function finalizeWhitelistScenario(address user) public returns (bool) {
    bool isUserWhitelisted = true;
    for (uint i = 0; i < registeredRuleIDs.length; ) {
      isUserWhitelisted =
        isUserWhitelisted &&
        queryRequestWhitelist[registeredRuleIDs[i]][user];
      if (!isUserWhitelisted) {
        break;
      }
      unchecked {
        i++;
      }
    }
    scenarioWhitelist[user] = isUserWhitelisted;
    emit UserAllowedForScenario(user);
    return isUserWhitelisted;
  }

  // This function sends all the ZKPs and whitelists a user all in one call
  function whitelistScenario(ZKP[] calldata zkps) public returns (bool) {
    for (uint i = 0; i < zkps.length; ) {
      submitZKPResponse(
        zkps[i].requestId,
        zkps[i].inputs,
        zkps[i].a,
        zkps[i].b,
        zkps[i].c
      );
      unchecked {
        i++;
      }
    }
    emit SubmitedAllZKPsForUser(msg.sender, zkps);
    return finalizeWhitelistScenario(msg.sender);
  }

  function isAllowedForScenario(address user) public view returns (bool) {
    return scenarioWhitelist[user];
  }
}
