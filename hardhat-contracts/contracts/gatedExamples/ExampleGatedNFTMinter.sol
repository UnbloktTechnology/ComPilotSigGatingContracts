// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../TxAuthDataVerifier.sol"; // Make sure this path matches where your file is

contract ExampleGatedNFTMinter is ERC721, TxAuthDataVerifier {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(
        address signerAddress
    )
        ERC721("MyExampleGatedNFTMinter", "GNFT")
        TxAuthDataVerifier(signerAddress)
    {}

    function mintNFT(address recipient) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);

        return newItemId;
    }

    function mintNFTBasic(
        address recipient,
        bytes calldata _signature,
        uint256 _chainID,
        uint256 _blockExpiration
    ) public returns (uint256) {
        // Calculate function data as a concatenation of functionName and arguments
        bytes32 functionName = "mintNFTBasic";
        bytes memory functionData = abi.encodePacked(functionName, recipient);

        // call requireTxDataAuthBasic with correct inputs
        requireTxDataAuthBasic(
            _signature,
            functionData,
            _chainID,
            _blockExpiration
        );

        // if it doesn't revert, mint the NFT
        return mintNFT(recipient);
    }

    function mintNFTOpti(
        address recipient,
        uint256 _chainID,
        uint256 _blockExpiration,
        bytes calldata _signature
    ) public requireTxDataAuthOpti returns (uint256) {
        return mintNFT(recipient);
    }
}
