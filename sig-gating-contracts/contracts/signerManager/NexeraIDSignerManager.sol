// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title NexeraID Signer Manager
 * @dev Implementation of the IERC1271 interface to support signature validation using a designated signerAddress.
 * This contract allows the management of a signerAddress address, which can be updated by the contract owner (Nexera ID).
 * It provides a mechanism to validate signatures according to EIP-1271, enabling the contract to act
 * as an identity with the ability to authorize actions through off-chain signed messages.
 */
contract NexeraIDSignerManager is IERC1271, Ownable {
    using ECDSA for bytes32;

    // Address of the signerAddress authorized to sign on behalf of this contract
    address public signerAddress;

    // EIP-1271 Non valid value
    bytes4 private constant _NON_VALID = 0xffffffff;

    // Event emitted when the signerAddress is changed
    event SignerChanged(address indexed newSigner);

    /**
     * @dev Initializes the contract by setting the initial signerAddress.
     * @param initialSigner The address of the initial signerAddress.
     * @param initialOwner The address of the initial owner of the contract.
     */
    constructor(address initialSigner, address initialOwner) {
        _setSigner(initialSigner);
        transferOwnership(initialOwner);
    }

    /**
     * @dev Sets a new signerAddress address.
     * @param newSigner The address of the new signerAddress.
     * Requirements:
     * - The caller must be the contract owner.
     */
    function setSigner(address newSigner) public onlyOwner {
        _setSigner(newSigner);
    }

    /**
     * @dev Internal function to set the signerAddress address.
     * @param newSigner The address of the new signerAddress.
     */
    function _setSigner(address newSigner) internal {
        require(
            newSigner != address(0),
            "NexeraIDSignerManager: new signerAddress is the zero address"
        );
        signerAddress = newSigner;
        emit SignerChanged(newSigner);
    }

    /**
     * @dev See {IERC1271-isValidSignature}.
     * @param hash The hash of the data signed.
     * @param signature The signature bytes.
     * @return bytes4(keccak256("isValidSignature(bytes32,bytes)") - EIP-1271 standard - if the signature is valid.
     */
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view override returns (bytes4) {
        address recoveredSigner = ECDSA.recover(hash, signature);
        if (recoveredSigner == signerAddress) {
            return this.isValidSignature.selector;
        } else {
            return _NON_VALID;
        }
    }
}
