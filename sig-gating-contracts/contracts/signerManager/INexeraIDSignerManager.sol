// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC1271.sol";

/**
 * @title INexeraIDSignerManager
 * @dev Interface for the NexeraID Signer Manager contract.
 */
interface INexeraIDSignerManager is IERC1271 {
    /**
     * @dev Event emitted when the signerAddress is changed.
     * @param newSigner The address of the new signerAddress.
     */
    event SignerChanged(address indexed newSigner);

    /**
     * @dev Initializes the contract by setting the initial signerAddress and initial owner.
     * @param initialSigner The address of the initial signerAddress.
     * @param initialOwner The address of the initial owner of the contract.
     */
    function initialize(address initialSigner, address initialOwner) external;

    /**
     * @dev Sets a new signerAddress address.
     * @param newSigner The address of the new signerAddress.
     */
    function setSigner(address newSigner) external;

    /**
     * @dev Returns the address of the current signerAddress.
     * @return The address of the signerAddress.
     */
    function getSigner() external view returns (address);

    /**
     * @dev Validates a given signature for the provided hash.
     * @param hash The hash of the data signed.
     * @param signature The signature bytes.
     * @return bytes4 indicating whether the signature is valid.
     */
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view override returns (bytes4);

    /**
     * @dev Returns the address of the current owner.
     * @return The address of the owner.
     */
    function owner() external view returns (address);

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() external;
}
