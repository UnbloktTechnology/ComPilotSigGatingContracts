// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./NexeraVerifierEntrypoint.sol";

import "hardhat-deploy/solc_0.8/openzeppelin/proxy/Clones.sol";

/**
 * @title VerifierEntrypointFactory
 * @dev Factory contract to create and deploy instances of the NexeraVerifierEntrypoint contract.
 */
contract VerifierEntrypointFactory {
    // Address of the VerifierEntrypoint implementation
    address immutable implementationContract;

    /**
     * @dev Event emitted when a new VerifierEntrypoint contract is created.
     * @param scenarioVerifierAddress The address of the newly deployed VerifierEntrypoint contract.
     */
    event NewVerifierEntrypointDeployed(address scenarioVerifierAddress);

    /**
     * @dev Constructor to set the implementation contract address.
     * @param _implementationContract The address of the VerifierEntrypoint implementation contract.
     */
    constructor(address _implementationContract) {
        require(
            _implementationContract != address(0),
            "_implementationContract can't be zero address"
        );
        implementationContract = _implementationContract;
    }

    /**
     * @dev Creates a new VerifierEntrypoint contract and initializes it.
     * @return clone The address of the newly created VerifierEntrypoint contract.
     */
    function createVerifierEntrypoint() public returns (address) {
        // Clone VerifierEntrypoint implementation
        address clone = Clones.clone(implementationContract);
        NexeraVerifierEntrypoint verifier = NexeraVerifierEntrypoint(clone);

        // emit event with address
        emit NewVerifierEntrypointDeployed(clone);

        // initialize and transfer ownership to sender
        verifier.initialize(msg.sender);

        return clone;
    }
}
