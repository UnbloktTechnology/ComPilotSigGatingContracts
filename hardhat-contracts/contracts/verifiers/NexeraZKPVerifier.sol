// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {GenesisUtils} from "@iden3/contracts/lib/GenesisUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import {ZKPVerifier} from "@iden3/contracts/verifiers/ZKPVerifier.sol";

contract NexeraZKPVerifier is ZKPVerifier {
  constructor() ZKPVerifier() {}

  // Emited once the request is set
  event ZKPRequestSet(
    uint64 requestId,
    bytes data,
    ICircuitValidator validator,
    string metadata
  );

  /**
   * @dev Hook that is called after a request is set
   */
  function _afterSetRequest(uint64 requestId) internal virtual {}

  function setNexeraZKPRequest(
    uint64 requestId,
    ZKPRequest calldata request
  ) public onlyOwner {
    setZKPRequest(requestId, request);
    emit ZKPRequestSet(
      requestId,
      request.data,
      request.validator,
      request.metadata
    );
    _afterSetRequest(requestId);
  }
}
