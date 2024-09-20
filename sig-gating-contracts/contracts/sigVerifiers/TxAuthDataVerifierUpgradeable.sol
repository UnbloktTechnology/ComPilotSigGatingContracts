// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

import {BaseTxAuthDataVerifier} from "./BaseTxAuthDataVerifier.sol";

/**
 * @title Transaction Authentication Data Verifier (Upgradeable)
 * @dev Upgradeable contract for verifying transaction authentication data, including signature verification and nonce management.
 * This contract is designed to be used in upgradeable contracts architecture, utilizing OpenZeppelin's Initializable and Context for secure initialization and context management.
 * It extends `BaseTxAuthDataVerifier` to provide core functionality for transaction data verification.
 *
 * The contract includes mechanisms for:
 * - Verifying transaction signatures against a specified signer address.
 * - Ensuring transactions have not expired based on their block expiration.
 * - Incrementing nonces to prevent replay attacks.
 *
 * It is intended to be deployed behind a proxy for upgradeability.
 */
contract TxAuthDataVerifierUpgradeable is
    BaseTxAuthDataVerifier,
    ContextUpgradeable
{
    /**
     * @dev Initialize proxied contract with signer
     * @param _signer The address of the off-chain service responsible for signing transactions
     */
    function __TxAuthDataVerifierUpgradeable_init(
        address _signer
    ) internal onlyInitializing {
        _setSigner(_signer);
        __Context_init();
    }

    /**
     * @dev Modifier that requires the transaction to be authenticated based on the caller's signature.
     * This modifier verifies the authenticity of the transaction by checking the signature against the caller's address (using `_msgSender()`) and ensuring the transaction has not expired.
     * It utilizes the `_verifyTxAuthData` function to perform these checks, incorporating the full transaction data and the caller's address for signature verification.
     *
     * Authentication is successful if the following conditions are met:
     * - The signature is valid and corresponds to the address returned by `_msgSender()`.
     * - The current block number is less than the specified `_blockExpiration`.
     *
     *
     * Requirements:
     * - The transaction must not have expired, as indicated by `_blockExpiration`.
     * - The provided signature must be valid and correctly match the caller's address, as determined by `_msgSender()`.
     *
     * Emits a `CompilotSignatureVerified` event upon successful verification, indicating that the transaction has been authenticated.
     */
    modifier requireTxDataAuth() {
        _verifyTxAuthData(_msgData(), _msgSender());
        _;
    }

    /**
     * @dev Modifier that requires the transaction to be authenticated with the provided signature and user address.
     * This modifier decomposes the transaction data and verifies its authenticity by checking the signature against the expected user address and ensuring the transaction has not expired.
     * It leverages the `_verifyTxAuthData` function to perform these checks.
     *
     * The transaction is considered authenticated if it meets the following criteria:
     * - The signature is valid and matches the user address.
     * - The transaction has not reached its expiration block.
     *
     * @param userAddress The Ethereum address of the user who is supposed to have signed the transaction. This address is used to recover the signer from the signature and compare it for equality.
     *
     * Requirements:
     * - The transaction must not have expired, as indicated by `_blockExpiration`.
     * - The signature must correctly match the provided `userAddress`.
     *
     * Emits a `CompilotSignatureVerified` event upon successful verification of the transaction.
     */
    modifier requireTxDataAuthWithAddress(address userAddress) {
        _verifyTxAuthData(_msgData(), userAddress);
        _;
    }
}
