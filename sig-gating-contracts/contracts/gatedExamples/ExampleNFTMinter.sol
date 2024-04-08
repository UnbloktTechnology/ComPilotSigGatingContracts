// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title Example  NFT Minter
/// @notice This contract demonstrates an NFT minting process that is not gated.
/// @notice This is an example contract, not intended for deployment.
/// @dev Inherits from OpenZeppelin's ERC721 for NFT functionality.
contract ExampleNFTMinter is ERC721 {
    uint256 private _tokenIds;

    /// @notice Initializes the contract by setting a name and symbol for the NFT
    constructor() ERC721("MyExampleNFTMinter", "ENFT") {}

    /// @notice Retrieves the current value of the token ID counter.
    /// @dev Returns the last token ID that was minted.
    /// @return The current value of the token ID counter, which corresponds to the last minted token ID.
    function getLastTokenId() public view returns (uint256) {
        return _tokenIds;
    }

    /// @notice Mints a new NFT to the specified recipient address.
    /// @dev Increments the `_tokenIds` counter, mints the NFT to the `recipient` address, and returns the new token ID.
    /// @param recipient The address of the recipient to whom the NFT will be minted.
    /// @return newItemId The token ID of the newly minted NFT.
    function mintNFT(address recipient) public returns (uint256) {
        _tokenIds += 1;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);

        return newItemId;
    }
}
