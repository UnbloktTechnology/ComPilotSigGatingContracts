// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../sigVerifiers/TxAuthDataVerifier.sol"; // Ensure this path matches your file structure

/**
 * @title Example Gated NFT Minter
 * @dev NFT minting contract with gated access based on off-chain signature verification.
 * This contract extends ERC721 for NFT functionality, TxAuthDataVerifier for signature verification,
 * and Ownable for ownership management. It uses a counter to assign unique token IDs to minted NFTs.
 * @notice This is an example contract, not intended for deployment.
 */
contract ExampleGatedNFTMinter is ERC721, TxAuthDataVerifier, Ownable {
    uint256 private _tokenIds;

    /// @notice Initializes the contract by setting a name, symbol, and signer for TxAuthDataVerifier.
    /// @param signerAddress The address allowed to sign transaction data for minting authorization.
    constructor(
        address signerAddress
    )
        ERC721("MyExampleGatedNFTMinter", "GNFT")
        TxAuthDataVerifier(signerAddress)
    {}

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function setSigner(address _signer) public onlyOwner {
        _setSigner(_signer);
    }

    /// @notice Retrieves the current value of the token ID counter.
    /// @dev Returns the last token ID that was minted.
    /// @return The current value of the token ID counter, which corresponds to the last minted token ID.
    function lastTokenId() public view returns (uint256) {
        return _tokenIds;
    }

    /// @dev Internal function to mint a new NFT to a specified recipient.
    /// @param recipient The address that will receive the newly minted NFT.
    /// @return newItemId The token ID of the newly minted NFT.
    function _mintNFT(address recipient) internal returns (uint256) {
        _tokenIds += 1;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);

        return newItemId;
    }

    /// @notice Mints a new NFT to a specified recipient, using an optimized signature verification process.
    /// @dev Leverages the `requireTxDataAuth` modifier for efficient signature verification.
    /// @param recipient The address to which the NFT will be minted.
    /// @return The ID of the newly minted NFT upon successful verification and minting.
    function mintNFTGated(
        address recipient
    ) public requireTxDataAuth returns (uint256) {
        return _mintNFT(recipient);
    }
}
