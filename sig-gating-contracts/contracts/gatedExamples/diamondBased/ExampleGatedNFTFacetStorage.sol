// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title
 * @dev
 */
library ExampleGatedNFTFacetStorage {
    bytes32 internal constant STORAGE_SLOT =
        keccak256(
            "nexeraId.NexeraIdSigGating.storage.ExampleGatedNFTFacetStorage"
        );

    struct Layout {
        uint256 _tokenIds;
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
