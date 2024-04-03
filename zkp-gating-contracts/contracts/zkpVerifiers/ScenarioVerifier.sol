// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {PrimitiveTypeUtils} from "@iden3/contracts/lib/PrimitiveTypeUtils.sol";
import {ICircuitValidator} from "@iden3/contracts/interfaces/ICircuitValidator.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./NexeraZKPVerifier.sol";
import "../interfaces/IScenarioVerifier.sol";

/// @title ScenarioVerifier
/// @notice This contract manages rules for a scenario using ZKP requests, including setting a request for a rule and allowing users who submit the right ZKPs
contract ScenarioVerifier is
    Initializable,
    IScenarioVerifier,
    NexeraZKPVerifier
{
    // Array of registered rule IDs
    uint64[] public registeredRuleIDs;

    // Mapping to check if a rule ID is registered
    mapping(uint64 => bool) public isRuleIdRegistered;

    // Mapping for query request whitelist status by rule ID and address
    mapping(uint64 => mapping(address => bool)) public queryRequestWhitelist;

    // Mapping for scenario whitelist status by address
    mapping(address => bool) public scenarioAllowList;

    // Mapping to connect a Polygon ID to an address
    mapping(uint256 => address) public idToAddress;

    // Mapping to connect an address to a Polygon ID
    mapping(address => uint256) public addressToId;

    // Events

    /// @dev Event emitted when a ZKPRequest is registered in the verifier
    event RequestRegistered(uint64 requestId);

    /// @dev Event emitted when an address is associated with a Polygon ID
    event AddressIdConnection(address userAddress, uint256 userId);

    /// @dev Event emitted when a user address is allowed for a request ID
    event UserAllowedForRequest(address userAddress, uint64 requestId);

    /// @dev Event emitted when all ZKPs for a user are submitted
    event SubmitedAllZKPsForUser(address userAddress, ZKP[] zkps);

    /// @dev Event emitted when an address is allowed for the scenario verifier
    event UserAllowedForScenario(address userAddress);

    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize proxied contract with owner
     * @param newOwner The address of the thing owner
     */
    function initialize(address newOwner) public initializer {
        _transferOwnership(newOwner);
    }

    /// @notice Internal function called after setting a request to register the request ID
    /// @param requestId The ID of the request being set
    function _afterSetRequest(uint64 requestId) internal override {
        // If requestId is not registered, register it to the list of registeredRuleIDs
        if (!isRuleIdRegistered[requestId]) {
            registeredRuleIDs.push(requestId);
            isRuleIdRegistered[requestId] = true;
            emit RequestRegistered(requestId);
        }
    }

    /// @notice Internal function called before submitting a proof, checks the sender address
    /// @param inputs Array of inputs for the proof
    /// @param validator The circuit validator
    function _beforeProofSubmit(
        uint64 /* requestId */,
        uint256[] memory inputs,
        ICircuitValidator validator
    ) internal view override {
        // check that challenge input is address of sender
        address addr = PrimitiveTypeUtils.uint256LEToAddress(
            inputs[validator.inputIndexOf("challenge")]
        );
        require(
            _msgSender() == addr,
            "address in proof is not a sender address"
        );
    }

    /// @notice Internal function called after submitting a proof, links id and address and allows user for the request/rule
    /// @param requestId The ID of the request being processed
    /// @param inputs Array of inputs for the proof
    /// @param _validator The circuit validator
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

    /// @dev Once the user is allowed for all rules, call this function to finalize
    /// (this is more gas efficient than iterating over rules on every submission)
    /// @notice Finalizes the whitelisting of a user for all rules
    /// @param user The address of the user to check
    /// @return isUserWhitelisted True if the user is allowed for all rules
    function finalizeAllowListScenario(address user) public returns (bool) {
        bool isUserWhitelisted = true;
        uint numberOfRules = registeredRuleIDs.length;
        for (uint i = 0; i < numberOfRules; ) {
            isUserWhitelisted = queryRequestWhitelist[registeredRuleIDs[i]][
                user
            ];
            if (!isUserWhitelisted) {
                break;
            }
            unchecked {
                i++;
            }
        }
        scenarioAllowList[user] = isUserWhitelisted;
        emit UserAllowedForScenario(user);
        return isUserWhitelisted;
    }

    /// @notice Submits all ZKPs and allowlists a user in one call
    /// @param zkps Array of ZKPs to submit
    /// @return Boolean indicating the success of the operation
    function allowUserForScenario(ZKP[] calldata zkps) public returns (bool) {
        uint numberOfZKPs = zkps.length;
        for (uint i = 0; i < numberOfZKPs; ) {
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
        return finalizeAllowListScenario(msg.sender);
    }

    /// @notice Checks if a user is allowed for the scenario
    /// @param user The address of the user to check
    /// @return Boolean indicating if the user is allowed for the scenario
    function isAllowedForScenario(address user) public view returns (bool) {
        return scenarioAllowList[user];
    }
}
