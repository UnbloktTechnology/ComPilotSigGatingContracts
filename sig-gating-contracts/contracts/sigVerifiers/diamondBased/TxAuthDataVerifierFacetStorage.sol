// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title
 * @dev
 */
library TxAuthDataVerifierFacetStorage {
    bytes32 internal constant STORAGE_SLOT =
        keccak256(
            "nexeraId.NexeraIdSigGating.storage.TxAuthDataVerifierFacetStorage"
        );

    /// @notice These are used to decompose msgData
    uint256 private constant _BYTES_32_LENGTH = 32;

    /// @notice This is the length for the expected signature
    uint256 constant _SIGNATURE_LENGTH = 65;

    /// @notice The offset for the extra data in the calldata
    uint256 constant _EXTRA_DATA_LENGTH = _SIGNATURE_LENGTH + _BYTES_32_LENGTH;

    struct Layout {
        address _signerAddress;
        mapping(address => uint256) nonces;
    }

    /**
     * @dev Retrieves a reference to the Layout struct stored at a specified storage slot
     */
    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            l.slot := slot
        }
    }
}
