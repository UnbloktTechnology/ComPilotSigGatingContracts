// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

interface INexeraVerifierEntrypoint {
  function isAllowedForEntrypoint(address user) external returns (bool);

  function addScenarioVerifier(address scenarioVerifierAddress) external;
}
