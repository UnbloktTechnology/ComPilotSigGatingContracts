// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.20;

/// @title INexeraVerifierEntrypoint
/// @notice Interface for the Nexera Verifier Entrypoint, defining essential functions for user verification and scenario verifier management.
interface INexeraVerifierEntrypoint {
    /// @notice Checks if a user is allowed to access the entrypoint.
    /// @param user The address of the user to check.
    /// @return Boolean indicating whether the user is allowed.
    function isAllowedForEntrypoint(address user) external returns (bool);

    /// @notice Adds a new scenario verifier to the system.
    /// @param scenarioVerifierAddress The address of the scenario verifier to be added.
    function addScenarioVerifier(address scenarioVerifierAddress) external;

    /// @notice Deletes a scenario verifier from the system.
    /// @param scenarioVerifierAddress The address of the scenario verifier to be deleted.
    function deleteScenarioVerifier(address scenarioVerifierAddress) external;

    /// @notice Updates a scenario verifier in the system.
    /// @param oldScenarioVerifierAddress The address of the current scenario verifier.
    /// @param newScenarioVerifierAddress The address of the new scenario verifier to replace the old one.
    function updateScenarioVerifier(
        address oldScenarioVerifierAddress,
        address newScenarioVerifierAddress
    ) external;

    /// @notice Enables a scenario verifier for use in the system.
    /// @param scenarioVerifierAddress The address of the scenario verifier to be enabled.
    function enableScenario(address scenarioVerifierAddress) external;

    /// @notice Disables a scenario verifier in the system.
    /// @param scenarioVerifierAddress The address of the scenario verifier to be disabled.
    function disableScenario(address scenarioVerifierAddress) external;
}
