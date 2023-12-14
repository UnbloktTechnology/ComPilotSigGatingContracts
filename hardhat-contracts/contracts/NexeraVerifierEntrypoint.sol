// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import "./ScenarioVerifier.sol";
import "./interfaces/INexeraVerifierEntrypoint.sol";

contract NexeraVerifierEntrypoint is INexeraVerifierEntrypoint, Ownable {
  address[] public scenarioVerifierAddresses;
  mapping(address => bool) public isScenarioEnabled;

  // Events

  // Emited when a Scenario is added to the Entrypoint
  event ScenarioVerifierAdded(address scenarioVerifierAddress);
  // Emited when a Scenario is deleted from the Entrypoint
  event ScenarioVerifierDeleted(address scenarioVerifierAddress);
  // Emited when a Scenario is updated from the Entrypoint
  event ScenarioVerifierUpdated(
    address oldScenarioVerifierAddress,
    address newScenarioVerifierAddress
  );
  // Emited when a Scenario is enabled from the Entrypoint
  event ScenarioVerifierEnabled(address scenarioVerifierAddress);
  // Emited when a Scenario is disabled from the Entrypoint
  event ScenarioVerifierDisabled(address scenarioVerifierAddress);

  modifier requiresVerified() {
    require(
      isAllowedForEntrypoint(msg.sender),
      "Nexera Verifier: Sender is not verified"
    );
    _;
  }

  function isAllowedForEntrypoint(address user) public view returns (bool) {
    bool isUserAllowed = true;
    for (uint i = 0; i < scenarioVerifierAddresses.length; ) {
      isUserAllowed =
        isUserAllowed &&
        ScenarioVerifier(scenarioVerifierAddresses[i]).isAllowedForScenario(
          user
        );
      if (!isUserAllowed) {
        break;
      }
      unchecked {
        i++;
      }
    }
    return isUserAllowed;
  }

  function _existScenarioVerifier(
    address scenarioVerifier
  ) internal view returns (bool) {
    bool exist = false;
    for (uint i = 0; i < scenarioVerifierAddresses.length; i++) {
      if (scenarioVerifierAddresses[i] == scenarioVerifier) {
        exist = true;
        break;
      }
    }
    return exist;
  }

  function getScenarioVerifierAddress(
    uint index
  ) public view returns (address) {
    return scenarioVerifierAddresses[index];
  }

  function addScenarioVerifier(
    address scenarioVerifierAddress
  ) public onlyOwner {
    require(
      scenarioVerifierAddress != address(0),
      "Input Scenario address cannot be the zero address"
    );
    scenarioVerifierAddresses.push(scenarioVerifierAddress);
    isScenarioEnabled[scenarioVerifierAddress] = true;

    emit ScenarioVerifierAdded(scenarioVerifierAddress);
  }

  function deleteScenarioVerifier(
    address scenarioVerifierAddress
  ) public onlyOwner {
    require(
      _existScenarioVerifier(scenarioVerifierAddress),
      "Nexera Verifier: Scenario Verifier Address doesn't exist"
    );

    uint index = 0;

    while (scenarioVerifierAddresses[index] != scenarioVerifierAddress) {
      index++;
    }

    delete isScenarioEnabled[scenarioVerifierAddresses[index]];
    scenarioVerifierAddresses[index] = scenarioVerifierAddresses[
      scenarioVerifierAddresses.length - 1
    ];
    scenarioVerifierAddresses.pop();

    emit ScenarioVerifierDeleted(scenarioVerifierAddress);
  }

  function updateScenarioVerifier(
    address oldScenarioVerifierAddress,
    address newScenarioVerifierAddress
  ) public onlyOwner {
    require(
      _existScenarioVerifier(oldScenarioVerifierAddress),
      "Nexera Verifier: Scenario Verifier Address doesn't exist"
    );

    deleteScenarioVerifier(oldScenarioVerifierAddress);
    addScenarioVerifier(newScenarioVerifierAddress);

    emit ScenarioVerifierUpdated(oldScenarioVerifierAddress, newScenarioVerifierAddress);
  }

  function enableScenario(address scenarioVerifierAddress) public onlyOwner {
    require(
      _existScenarioVerifier(scenarioVerifierAddress),
      "Nexera Verifier: Scenario Verifier Address doesn't exist"
    );

    isScenarioEnabled[scenarioVerifierAddress] = true;

    emit ScenarioVerifierEnabled(scenarioVerifierAddress);
  }

  function disableScenario(address scenarioVerifierAddress) public onlyOwner {
    require(
      _existScenarioVerifier(scenarioVerifierAddress),
      "Nexera Verifier: Scenario Verifier Address doesn't exist"
    );

    isScenarioEnabled[scenarioVerifierAddress] = false;

    emit ScenarioVerifierDisabled(scenarioVerifierAddress);
  }
}
