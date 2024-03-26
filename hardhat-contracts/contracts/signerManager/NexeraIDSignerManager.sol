// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title NexeraID Signer Manager
 * @dev Implementation of the IERC1271 interface to support signature validation using a designated signer.
 * This contract allows the management of a signer address, which can be updated by the contract owner (Nexera ID).
 * It provides a mechanism to validate signatures according to EIP-1271, enabling the contract to act
 * as an identity with the ability to authorize actions through off-chain signed messages.
 */
contract NexeraIDSignerManager is IERC1271, Ownable {
    using ECDSA for bytes32;

    // Address of the signer authorized to sign on behalf of this contract
    address private _signer;

    // EIP-1271 Magic Value for a valid signature
    // bytes4(keccak256("isValidSignature(bytes32,bytes)")
    bytes4 private constant MAGIC_VALUE = 0x1626ba7e;

    // Event emitted when the signer is changed
    event SignerChanged(address indexed newSigner);

    /**
     * @dev Initializes the contract by setting the initial signer.
     * @param initialSigner The address of the initial signer.
     * @param initialOwner The address of the initial owner of the contract.
     */
    constructor(address initialSigner, address initialOwner) {
        _setSigner(initialSigner);
        transferOwnership(initialOwner);
    }

    /**
     * @dev Sets a new signer address.
     * @param newSigner The address of the new signer.
     * Requirements:
     * - The caller must be the contract owner.
     */
    function setSigner(address newSigner) public onlyOwner {
        _setSigner(newSigner);
    }

    /**
     * @dev Internal function to set the signer address.
     * @param newSigner The address of the new signer.
     */
    function _setSigner(address newSigner) internal {
        require(
            newSigner != address(0),
            "NexeraIDSignerManager: new signer is the zero address"
        );
        _signer = newSigner;
        emit SignerChanged(newSigner);
    }

    /// @notice Retrieves the signer address
    /// @return The signer address
    function getSignerAddress() public view returns (address) {
        return _signer;
    }

    /**
     * @dev See {IERC1271-isValidSignature}.
     * @param hash The hash of the data signed.
     * @param signature The signature bytes.
     * @return magicValue bytes4 constant `MAGIC_VALUE` if the signature is valid.
     */
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view override returns (bytes4) {
        address recoveredSigner = ECDSA.recover(hash, signature);
        if (recoveredSigner == _signer) {
            return MAGIC_VALUE;
        } else {
            return 0xffffffff;
        }
    }

    /**
     * @dev Retrieves the current signer address.
     * @return The address of the current signer.
     */
    function getSigner() public view returns (address) {
        return _signer;
    }
}
