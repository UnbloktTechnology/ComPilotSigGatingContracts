// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import {IZKPVerifier} from "@iden3/contracts/interfaces/IZKPVerifier.sol";

interface IScenarioVerifier is IZKPVerifier {
  struct ZKP {
    uint64 requestId;
    uint256[] inputs;
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
  }

  function isAllowedForScenario(address user) external returns (bool);

  function whitelistScenario(ZKP[] calldata zkps) external returns (bool);

  function finalizeWhitelistScenario(address user) external returns (bool);
}
