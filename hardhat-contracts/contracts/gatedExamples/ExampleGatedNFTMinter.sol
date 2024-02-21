// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../sigVerifiers/TxAuthDataVerifier.sol"; // Ensure this path matches your file structure

/// @title Example Gated NFT Minter
/// @notice This contract demonstrates an NFT minting process gated by off-chain signature verification.
/// @dev Inherits from OpenZeppelin's ERC721 for NFT functionality and a custom TxAuthDataVerifier for signature verification.
contract ExampleGatedNFTMinter is ERC721, TxAuthDataVerifier {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @notice Initializes the contract by setting a name, symbol, and signer for TxAuthDataVerifier.
    /// @param signerAddress The address allowed to sign transaction data for minting authorization.
    constructor(
        address signerAddress
    )
        ERC721("MyExampleGatedNFTMinter", "GNFT")
        TxAuthDataVerifier(signerAddress)
    {}

    /// @notice Retrieves the current value of the token ID counter.
    /// @dev Returns the last token ID that was minted.
    /// @return The current value of the token ID counter, which corresponds to the last minted token ID.
    function getLastTokenId() public view returns (uint256) {
        return _tokenIds.current();
    }

    /// @dev Internal function to mint a new NFT to a specified recipient.
    /// @param recipient The address that will receive the newly minted NFT.
    /// @return newItemId The token ID of the newly minted NFT.
    function mintNFT(address recipient) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);

        return newItemId;
    }

    /// @notice Mints a new NFT to a specified recipient, using an optimized signature verification process.
    /// @dev Leverages the `requireTxDataAuthOpti` modifier for efficient signature verification.
    /// @param recipient The address to which the NFT will be minted.
    /// @param _blockExpiration The block number after which the request is considered expired.
    /// @param _signature The signature provided for verification.
    /// @return The ID of the newly minted NFT upon successful verification and minting.
    function mintNFTGated(
        address recipient,
        uint256 _blockExpiration,
        bytes calldata _signature
    ) public requireTxDataAuth returns (uint256) {
        return mintNFT(recipient);
    }
}
