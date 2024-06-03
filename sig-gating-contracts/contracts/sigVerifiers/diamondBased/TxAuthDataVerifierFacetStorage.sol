// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TxAuthDataVerifierFacetStorage
 * @dev Storage library for the TxAuthDataVerifierFacet used in the context of the Diamond Standard (EIP-2535).
 * This library defines the storage layout and provides functions for accessing and manipulating the storage.
 * It includes constants for managing calldata offsets and signature lengths.
 */
library TxAuthDataVerifierFacetStorage {
    /// @dev Storage slot for the TxAuthDataVerifierFacet storage, derived from a unique hash.
    bytes32 internal constant STORAGE_SLOT =
        keccak256(
            "nexeraId.NexeraIdSigGating.storage.TxAuthDataVerifierFacetStorage"
        );

    /// @notice Constant representing the length of a bytes32 value.
    uint256 private constant _BYTES_32_LENGTH = 32;

    /// @notice Constant representing the length of a signature (65 bytes).
    uint256 constant _SIGNATURE_LENGTH = 65;

    /// @notice Constant representing the offset for the extra data in the calldata (signature length + bytes32 length).
    uint256 constant _EXTRA_DATA_LENGTH = _SIGNATURE_LENGTH + _BYTES_32_LENGTH;

    /**
     * @dev Struct to define the storage layout for the TxAuthDataVerifierFacet.
     * @param _signerAddress The address of the signer authorized to sign transaction data.
     * @param nonces A mapping from user addresses to their respective nonces, used to prevent replay attacks.
     */
    struct Layout {
        address _signerAddress;
        mapping(address => uint256) nonces;
    }

    /**
     * @dev Retrieves a reference to the Layout struct stored at a specified storage slot.
     * This function uses inline assembly to load the storage slot.
     * @return l A reference to the Layout struct.
     */
    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
