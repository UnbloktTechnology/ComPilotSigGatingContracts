// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./ScenarioVerifier.sol";
import "../interfaces/INexeraVerifierEntrypoint.sol";

/// @title Nexera Verifier Entrypoint
/// @notice This contract manages the registration, update, and verification of Scenario Verifiers for a single project
contract NexeraVerifierEntrypoint is
    Initializable,
    INexeraVerifierEntrypoint,
    OwnableUpgradeable
{
    // Add the library methods
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableMap for EnumerableMap.AddressToUintMap;

    // Declare a set state variable
    EnumerableSet.AddressSet private scenarioVerifierAddresses;
    EnumerableMap.AddressToUintMap private isScenarioEnabled;

    // Events

    /// @dev Event emitted when a Scenario Verifier is added
    event ScenarioVerifierAdded(address scenarioVerifierAddress);
    /// @dev Event emitted when a Scenario Verifier is deleted
    event ScenarioVerifierDeleted(address scenarioVerifierAddress);
    /// @dev Event emitted when a Scenario Verifier is updated
    event ScenarioVerifierUpdated(
        address oldScenarioVerifierAddress,
        address newScenarioVerifierAddress
    );
    /// @dev Event emitted when a Scenario Verifier is enabled
    event ScenarioVerifierEnabled(address scenarioVerifierAddress);
    /// @dev Event emitted when a Scenario Verifier is disabled
    event ScenarioVerifierDisabled(address scenarioVerifierAddress);

    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize proxied contract with owner
     * @param newOwner The address of the thing owner
     */
    function initialize(address newOwner) public initializer {
        __Ownable_init(newOwner);
    }

    /// @dev Modifier to require a verified user as sender
    modifier requiresVerified() {
        require(
            isAllowedForEntrypoint(msg.sender),
            "Nexera Verifier: Sender is not verified"
        );
        _;
    }

    /// @notice Checks if a user is allowed for the entrypoint
    /// @param user The address of the user to check
    /// @return isUserAllowed True if the user is allowed, false otherwise
    function isAllowedForEntrypoint(address user) public view returns (bool) {
        bool isUserAllowed = true;
        address[] memory scenariosValues = EnumerableSet.values(
            scenarioVerifierAddresses
        );
        uint numberOfScenarios = scenariosValues.length;
        for (uint i = 0; i < numberOfScenarios; ) {
            isUserAllowed = ScenarioVerifier(scenariosValues[i])
                .isAllowedForScenario(user);
            if (!isUserAllowed) {
                break;
            }
            unchecked {
                i++;
            }
        }
        return isUserAllowed;
    }

    /// @notice Checks if a scenario verifier exists in the entrypoint
    /// @param scenarioVerifier Address of the scenario verifier to check
    /// @return exist True if the scenario verifier exists, false otherwise
    function _existScenarioVerifier(
        address scenarioVerifier
    ) internal view returns (bool) {
        return
            EnumerableSet.contains(scenarioVerifierAddresses, scenarioVerifier);
    }

    /// @notice Gets the address of a scenario verifier by index
    /// @param index The index of the verifier in the list
    /// @return Address of the scenario verifier
    function getScenarioVerifierAddress(
        uint index
    ) public view returns (address) {
        return EnumerableSet.at(scenarioVerifierAddresses, index);
    }

    /// @notice Adds a new scenario verifier to the entrypoint
    /// @param scenarioVerifierAddress Address of the new scenario verifier
    function addScenarioVerifier(
        address scenarioVerifierAddress
    ) public onlyOwner {
        require(
            scenarioVerifierAddress != address(0),
            "Input Scenario address cannot be the zero address"
        );

        bool added = EnumerableSet.add(
            scenarioVerifierAddresses,
            scenarioVerifierAddress
        );
        require(added, "Scenario Verifier already added");
        EnumerableMap.set(isScenarioEnabled, scenarioVerifierAddress, 1);

        emit ScenarioVerifierAdded(scenarioVerifierAddress);
    }

    /// @notice Deletes a scenario verifier from the entrypoint
    /// @param scenarioVerifierAddress Address of the scenario verifier to delete
    function deleteScenarioVerifier(
        address scenarioVerifierAddress
    ) public onlyOwner {
        require(
            _existScenarioVerifier(scenarioVerifierAddress),
            "Nexera Verifier: Scenario Verifier Address doesn't exist"
        );

        EnumerableSet.remove(
            scenarioVerifierAddresses,
            scenarioVerifierAddress
        );
        EnumerableMap.remove(isScenarioEnabled, scenarioVerifierAddress);

        emit ScenarioVerifierDeleted(scenarioVerifierAddress);
    }

    /// @notice Updates an existing scenario verifier
    /// @param oldScenarioVerifierAddress Address of the existing scenario verifier
    /// @param newScenarioVerifierAddress Address of the new scenario verifier
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

        emit ScenarioVerifierUpdated(
            oldScenarioVerifierAddress,
            newScenarioVerifierAddress
        );
    }

    /// @notice Enables a scenario verifier
    /// @param scenarioVerifierAddress Address of the scenario verifier to enable
    function enableScenario(address scenarioVerifierAddress) public onlyOwner {
        require(
            _existScenarioVerifier(scenarioVerifierAddress),
            "Nexera Verifier: Scenario Verifier Address doesn't exist"
        );

        EnumerableMap.set(isScenarioEnabled, scenarioVerifierAddress, 1);
        emit ScenarioVerifierEnabled(scenarioVerifierAddress);
    }

    /// @notice Disables a scenario verifier
    /// @param scenarioVerifierAddress Address of the scenario verifier to disable
    function disableScenario(address scenarioVerifierAddress) public onlyOwner {
        require(
            _existScenarioVerifier(scenarioVerifierAddress),
            "Nexera Verifier: Scenario Verifier Address doesn't exist"
        );

        EnumerableMap.set(isScenarioEnabled, scenarioVerifierAddress, 0);

        emit ScenarioVerifierDisabled(scenarioVerifierAddress);
    }

    /// @notice Gets if a scenario is enabled
    /// @param scenarioVerifierAddress Address of the scenario verifier to check
    /// @return Boolean with the response
    function getIsScenarioEnabled(
        address scenarioVerifierAddress
    ) public view returns (bool) {
        (bool check, uint256 value) = EnumerableMap.tryGet(
            isScenarioEnabled,
            scenarioVerifierAddress
        );

        return check && value == 1;
    }
}
