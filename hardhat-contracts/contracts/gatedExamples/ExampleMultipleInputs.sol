// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../sigVerifiers/TxAuthDataVerifier.sol"; // Ensure this path matches your file structure

/// @title Example Multiple Inputs Contract
/// @dev This contract demonstrates a contract inheriting from TxAuthDataVerifier to update variables with signature verification.
/// @notice This contract allows updating certain variables only after verifying the transaction authenticity with a signature.
contract ExampleMultipleInputs is TxAuthDataVerifier {
    uint256 intVariable;
    address addressVariable;
    bytes bytesVariable;

    /// @dev Initializes the contract by setting a signer address for the TxAuthDataVerifier.
    /// @param signerAddress The address used for transaction data signature verification.
    constructor(address signerAddress) TxAuthDataVerifier(signerAddress) {}

    /// @notice Returns the current value of the bytes variable.
    /// @return The current value of the bytes variable.
    function getBytesVariable() public view returns (bytes memory) {
        return bytesVariable;
    }

    /// @notice Updates the contract variables after verifying the transaction signature.
    /// @dev Requires the transaction to be authenticated via `requireTxDataAuth`.
    /// @param _intVariable The new value for the integer variable.
    /// @param _addressVariable The new value for the address variable.
    /// @param _bytesVariable The new value for the bytes variable.
    /// @param _blockExpiration The block number until which the transaction is considered valid.
    /// @param _signature The signature proving the authenticity of the transaction data.
    function updateVariables(
        uint256 _intVariable,
        address _addressVariable,
        bytes memory _bytesVariable,
        uint256 _blockExpiration,
        bytes calldata _signature
    ) public requireTxDataAuth(_blockExpiration) {
        intVariable = _intVariable;
        addressVariable = _addressVariable;
        bytesVariable = _bytesVariable;
    }
}