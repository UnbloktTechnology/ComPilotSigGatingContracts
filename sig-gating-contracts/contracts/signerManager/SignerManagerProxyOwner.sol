// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import {INexeraIDSignerManager} from "./INexeraIDSignerManager.sol";

/**
 * @title SignerManagerProxyOwner
 * @dev A contract to manage the NexeraID Signer Manager contract with role-based access control.
 * DEFAULT_ADMIN_ROLE controls changing the signerAddress on the NexeraID Signer Manager and can manage PAUSER_ROLE.
 * It is refered to as DEFAULT_ADMIN_ROLE in the docs
 * PAUSER_ROLE can only pause the contract (change the address to ONE_ADDRESS)
 */
contract SignerManagerProxyOwner is AccessControl {
    INexeraIDSignerManager public signerManager;

    // Roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Non-existant address to pause signer
    address private constant ONE_ADDRESS =
        0x0000000000000000000000000000000000000001;

    constructor(address signerManagerAddress) {
        signerManager = INexeraIDSignerManager(signerManagerAddress);

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
    }

    // Function to set a new signer in the SignerManager contract
    function setSigner(
        address newSigner
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        signerManager.setSigner(newSigner);
    }

    // Function to transfer ownership of the SignerManager contract
    function transferSignerManagerOwnership(
        address newOwner
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        signerManager.transferOwnership(newOwner);
    }

    // Function to pause the SignerManager by setting the signer to a null address
    function pauseSignerManager() external onlyRole(PAUSER_ROLE) {
        signerManager.setSigner(ONE_ADDRESS);
    }
}
