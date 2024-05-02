// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../sigVerifiers/TxAuthDataVerifier.sol"; // Ensure this path matches your file structure

/// @title Example Multiple Inputs Contract
/// @dev This contract demonstrates a contract inheriting from TxAuthDataVerifier to update variables with signature verification.
/// @notice This contract allows updating certain variables only after verifying the transaction authenticity with a signature.
/// @notice This is an example contract, not intended for deployment.
contract ExampleMultipleInputs is TxAuthDataVerifier, Ownable {
    uint256 intVariable;
    address addressVariable;
    bytes bytesVariable;
    bytes bytesVariable2;

    /// @dev Initializes the contract by setting a signer address for the TxAuthDataVerifier.
    /// @param signerAddress The address used for transaction data signature verification.
    constructor(address signerAddress) TxAuthDataVerifier(signerAddress) {}

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function setSigner(address _signer) public onlyOwner {
        _setSigner(_signer);
    }

    /// @notice Returns the current value of the bytes variable.
    /// @return The current value of the bytes variable.
    function getBytesVariable() public view returns (bytes memory) {
        return bytesVariable;
    }

    /// @notice Returns the current value of the int variable.
    /// @return The current value of the int variable.
    function getIntVariable() public view returns (uint256) {
        return intVariable;
    }

    /// @notice Updates the contract variables after verifying the transaction signature.
    /// @dev Requires the transaction to be authenticated via `requireTxDataAuth`.
    /// @param _intVariable The new value for the integer variable.
    /// @param _addressVariable The new value for the address variable.
    /// @param _bytesVariable The new value for the bytes variable.
    function updateVariables(
        uint256 _intVariable,
        address _addressVariable,
        bytes memory _bytesVariable,
        bytes memory _bytesVariable2
    ) public requireTxDataAuth {
        intVariable = _intVariable;
        addressVariable = _addressVariable;
        bytesVariable = _bytesVariable;
        bytesVariable2 = _bytesVariable2;
    }

    function updateVariablesNoInput() public requireTxDataAuth {
        intVariable = 1;
        addressVariable = address(this);
        bytesVariable = "0x11";
    }
}
