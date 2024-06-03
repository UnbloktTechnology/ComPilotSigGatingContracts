// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ExampleGatedNFTFacetStorage
 * @dev Storage library for the ExampleGatedNFTFacet used in the context of the Diamond Standard (EIP-2535).
 * This library defines the storage layout and provides functions for accessing and manipulating the storage.
 */
library ExampleGatedNFTFacetStorage {
    /// @dev Storage slot for the ExampleGatedNFTFacet storage, derived from a unique hash.
    bytes32 internal constant STORAGE_SLOT =
        keccak256(
            "nexeraId.NexeraIdSigGating.storage.ExampleGatedNFTFacetStorage"
        );

    /**
     * @dev Struct to define the storage layout for the ExampleGatedNFTFacet.
     * @param _tokenIds A counter for tracking the last token ID that was minted.
     */
    struct Layout {
        uint256 _tokenIds;
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
