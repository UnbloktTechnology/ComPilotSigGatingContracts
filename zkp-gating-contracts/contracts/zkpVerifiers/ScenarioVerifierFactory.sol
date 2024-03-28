// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ScenarioVerifier.sol";

import "hardhat-deploy/solc_0.8/openzeppelin/proxy/Clones.sol";

/**
 * @title ScenarioVerifierFactory
 * @dev Factory contract to create and deploy instances of the ScenarioVerifier contract.
 */
contract ScenarioVerifierFactory {
    // Address of the ScenarioVerifier implementation
    address immutable implementationContract;

    /**
     * @dev Event emitted when a new ScenarioVerifier contract is created.
     * @param scenarioVerifierAddress The address of the newly deployed ScenarioVerifier contract.
     */
    event NewScenarioVerifierDeployed(address scenarioVerifierAddress);

    /**
     * @dev Constructor to set the implementation contract address.
     * @param _implementationContract The address of the ScenarioVerifier implementation contract.
     */
    constructor(address _implementationContract) {
        require(
            _implementationContract != address(0),
            "_implementationContract can't be zero address"
        );
        implementationContract = _implementationContract;
    }

    /**
     * @dev Creates a new ScenarioVerifier contract and initializes it.
     * @return clone The address of the newly created ScenarioVerifier contract.
     */
    function createScenarioVerifier() public returns (address) {
        // Clone ScenarioVerifier implementation
        address clone = Clones.clone(implementationContract);
        ScenarioVerifier verifier = ScenarioVerifier(clone);

        // emit event with address
        emit NewScenarioVerifierDeployed(clone);

        // initialize and transfer ownership to sender
        verifier.initialize(msg.sender);

        return clone;
    }
}
