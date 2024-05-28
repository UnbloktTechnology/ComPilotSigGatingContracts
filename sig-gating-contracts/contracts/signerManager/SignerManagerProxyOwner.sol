// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import {INexeraIDSignerManager} from "./INexeraIDSignerManager.sol";

contract SignerManagerProxyOwner is AccessControl {
    INexeraIDSignerManager public signerManager;

    // Roles
    bytes32 public constant SIGNER_MANAGER_CONTROLLER_ROLE =
        keccak256("SIGNER_MANAGER_CONTROLLER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Non-existant address to pause signer
    address private constant ONE_ADDRESS =
        0x0000000000000000000000000000000000000001;

    constructor(address signerManagerAddress) {
        signerManager = INexeraIDSignerManager(signerManagerAddress);

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SIGNER_MANAGER_CONTROLLER_ROLE, msg.sender);
        _setupRole(PAUSER_ROLE, msg.sender);
    }

    // Function to set a new signer in the SignerManager contract
    function setSigner(
        address newSigner
    ) external onlyRole(SIGNER_MANAGER_CONTROLLER_ROLE) {
        signerManager.setSigner(newSigner);
    }

    // Function to transfer ownership of the SignerManager contract
    function transferOwnership(
        address newOwner
    ) external onlyRole(SIGNER_MANAGER_CONTROLLER_ROLE) {
        signerManager.transferOwnership(newOwner);
    }

    // Function to change the SIGNER_MANAGER_CONTROLLER_ROLE
    function changeSignerManagerControllerRole(
        address account
    ) external onlyRole(SIGNER_MANAGER_CONTROLLER_ROLE) {
        grantRole(DEFAULT_ADMIN_ROLE, account);
        grantRole(SIGNER_MANAGER_CONTROLLER_ROLE, account);
    }

    // Function to change the PAUSER_ROLE
    function changePauserRole(
        address account
    ) external onlyRole(SIGNER_MANAGER_CONTROLLER_ROLE) {
        grantRole(PAUSER_ROLE, account);
    }

    // Function to pause the SignerManager by setting the signer to a null address
    function pauseSignerManager() external onlyRole(PAUSER_ROLE) {
        signerManager.setSigner(ONE_ADDRESS);
    }
}
