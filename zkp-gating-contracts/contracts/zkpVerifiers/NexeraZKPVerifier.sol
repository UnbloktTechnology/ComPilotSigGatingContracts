// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import {GenesisUtils} from "@iden3/contracts/lib/GenesisUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import {ZKPVerifier} from "@iden3/contracts/verifiers/ZKPVerifier.sol";

/// @title NexeraZKPVerifier
/// @notice Extends ZKPVerifier to handle Zero-Knowledge Proof (ZKP) requests specifically for the Nexera system.
/// @dev We use this because we need _afterSetRequest to register the request ids
contract NexeraZKPVerifier is ZKPVerifier {
    /// @dev Emitted when a ZKP request is set.
    /// @param requestId The ID of the ZKP request.
    /// @param data The data associated with the ZKP request.
    /// @param validator The circuit validator for the ZKP request.
    /// @param metadata Metadata associated with the request.
    event ZKPRequestSet(
        uint64 requestId,
        bytes data,
        ICircuitValidator validator,
        string metadata
    );

    /// @dev Internal hook that is called after a ZKP request is set.
    /// @param requestId The ID of the request that was set.
    function _afterSetRequest(uint64 requestId) internal virtual {}

    /// @notice Sets a Nexera ZKP request and emits an event.
    /// @param requestId The ID of the request to be set.
    /// @param request The ZKP request data.
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
