// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.20;

import {IZKPVerifier} from "@iden3/contracts/interfaces/IZKPVerifier.sol";

/// @title IScenarioVerifier
/// @notice Interface for the Scenario Verifier, extending the IZKPVerifier interface for scenario-specific verification using Zero-Knowledge Proofs (ZKPs).
interface IScenarioVerifier is IZKPVerifier {
    /// @dev Structure representing a Zero-Knowledge Proof (ZKP) with its associated request ID and proof data.
    /// used in the allowUserForScenario call
    struct ZKP {
        uint64 requestId; // ID of the request associated with this ZKP.
        uint256[] inputs; // Inputs provided for the ZKP.
        uint256[2] a; // Component 'a' of the ZKP.
        uint256[2][2] b; // Component 'b' of the ZKP.
        uint256[2] c; // Component 'c' of the ZKP.
    }

    /// @notice Checks if a user is allowed for the specific scenario.
    /// @param user The address of the user to check.
    /// @return Boolean indicating whether the user is allowed.
    function isAllowedForScenario(address user) external returns (bool);

    /// @notice Processes a batch of ZKPs and attempts to whitelist the user for the scenario.
    /// @param zkps Array of ZKPs to be processed.
    /// @return Boolean indicating the success of the whitelisting process.
    function allowUserForScenario(ZKP[] calldata zkps) external returns (bool);

    /// @notice Finalizes the check process for a user for all rules.
    /// @param user The address of the user to finalize the check for
    /// @return Boolean indicating whether the user was successfully allowed for the scenario.
    function finalizeAllowListScenario(address user) external returns (bool);
}
