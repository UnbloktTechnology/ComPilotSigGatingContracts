// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "../sigVerifiers/TxAuthDataVerifierUpgradeable.sol"; // Ensure this path matches your file structure
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title Example Gated NFT Minter (Upgradeable)
 * @dev Upgradeable NFT minting contract with gated access based on off-chain signature verification.
 * This contract extends ERC721Upgradeable for NFT functionality, TxAuthDataVerifierUpgradeable for signature verification,
 * and OwnableUpgradeable for ownership management. It uses a counter to assign unique token IDs to minted NFTs.
 *
 * The contract is designed to be used with a proxy for upgradeability.
 */
contract ExampleGatedNFTMinterUpgradeable is
    ERC721Upgradeable,
    TxAuthDataVerifierUpgradeable,
    OwnableUpgradeable
{
    uint256 private _tokenIds;

    /// @notice constructor conform OZ upgradable pattern
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the contract by setting a name, symbol, and signer for TxAuthDataVerifierUpgradeable.
    /// @param signerAddress The address allowed to sign transaction data for minting authorization.
    function initialize(address signerAddress) public initializer {
        __ERC721_init("MyExampleGatedNFTMinterUpgradeable", "GNFTU");
        __Ownable_init();
        __TxAuthDataVerifierUpgradeable_init(signerAddress);
    }

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function setSigner(address _signer) public onlyOwner {
        _setSigner(_signer);
    }

    /// @notice Retrieves the current value of the token ID counter.
    /// @dev Returns the last token ID that was minted.
    /// @return The current value of the token ID counter, which corresponds to the last minted token ID.
    function getLastTokenId() public view returns (uint256) {
        return _tokenIds;
    }

    /// @dev Internal function to mint a new NFT to a specified recipient.
    /// @param recipient The address that will receive the newly minted NFT.
    /// @return newItemId The token ID of the newly minted NFT.
    function mintNFT(address recipient) internal returns (uint256) {
        _tokenIds += 1;
        uint256 newItemId = _tokenIds;
        _mint(recipient, newItemId);

        return newItemId;
    }

    /// @notice Mints a new NFT to a specified recipient, using an optimized signature verification process.
    /// @dev Leverages the `requireTxDataAuth` modifier for efficient signature verification.
    /// @param recipient The address to which the NFT will be minted.
    /// @param _blockExpiration The block number after which the request is considered expired.
    /// @param _signature The signature provided for verification.
    /// @return The ID of the newly minted NFT upon successful verification and minting.
    function mintNFTGated(
        address recipient,
        uint256 _blockExpiration,
        bytes calldata _signature
    ) public requireTxDataAuth(_blockExpiration, _signature) returns (uint256) {
        return mintNFT(recipient);
    }
}
