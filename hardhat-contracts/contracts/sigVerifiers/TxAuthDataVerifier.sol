// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {BaseTxAuthDataVerifier} from "./BaseTxAuthDataVerifier.sol";

/// @title A contract for verifying transaction data authorized off-cahin with a signature
/// @notice This contract allows transactions to be signed off-chain and then verified on-chain using the signer's signature.
/// @dev Utilizes ECDSA for signature recovery and Counters to track nonces
contract TxAuthDataVerifier is BaseTxAuthDataVerifier, Ownable {
    /// @notice Constructs the `TxAuthDataVerifier` contract
    /// @param _signer The address of the off-chain service responsible for signing transactions
    constructor(address _signer) {
        _setSigner(_signer);
    }

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function setSigner(address _signer) public onlyOwner {
        _setSigner(_signer);
    }
}
