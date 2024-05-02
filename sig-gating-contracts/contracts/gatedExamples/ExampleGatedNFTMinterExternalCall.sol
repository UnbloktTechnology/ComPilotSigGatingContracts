// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../sigVerifiers/TxAuthDataVerifier.sol"; // Ensure this path matches your file structure

/**
 * @title Example Gated NFT Minter (External Call)
 * @dev NFT minting contract with gated access based on off-chain signature verification.
 * This contract extends ERC721 for NFT functionality, TxAuthDataVerifier for signature verification,
 * and Ownable for ownership management. It uses a counter to assign unique token IDs to minted NFTs.
 *
 * This Smart contract is meant to be called from another smart contract that has exclusive access to it.
 * In this usecase, the userAddress should be in the input and not _msgSender
 */
contract ExampleGatedNFTMinterExternalCall is
    ERC721,
    TxAuthDataVerifier,
    Ownable
{
    uint256 private _tokenIds;
    address public externalContractCaller;

    /// @notice Initializes the contract by setting a name, symbol, and signer for TxAuthDataVerifier.
    /// @param signerAddress The address allowed to sign transaction data for minting authorization.
    constructor(
        address signerAddress,
        address _externalContractCaller
    )
        ERC721("MyExampleGatedNFTMinterExternalCall", "GNFT")
        TxAuthDataVerifier(signerAddress)
    {
        externalContractCaller = _externalContractCaller;
    }

    /// @notice Sets a new externalContractCaller address
    /// @dev Can only be called by the current owner
    /// @param _externalContractCaller The address of the new externalContractCaller
    function setExternalCaller(
        address _externalContractCaller
    ) public onlyOwner {
        externalContractCaller = _externalContractCaller;
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
    /// @param userAddress The address requesting the signature (in case a contract wants to call this)
    /// @return The ID of the newly minted NFT upon successful verification and minting.
    function mintNFTGatedWithAddress(
        address recipient,
        address userAddress
    ) public requireTxDataAuthWithAddress(userAddress) returns (uint256) {
        require(
            _msgSender() == externalContractCaller,
            "only the set externalContractCaller can call this"
        );
        return _mintNFT(recipient);
    }
}
