// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {TxAuthDataVerifierFacetStorage} from "./TxAuthDataVerifierFacetStorage.sol";

/**
 * @title Base Transaction Authentication Data Verifier
 * @dev Provides mechanisms for verifying transaction authentication data, including signature verification and nonce management.
 * This contract is designed to be extended by other contracts requiring transaction authentication based on digital signatures.
 * It includes functionality for:
 * - Verifying transaction signatures against a specified signer address.
 * - Ensuring transactions have not expired based on their block expiration.
 * - Incrementing nonces to prevent replay attacks.
 *
 * The contract utilizes OZ SignatureChecker for signature verification.
 */
contract TxAuthDataVerifierFacet is Context {
    using TxAuthDataVerifierFacetStorage for TxAuthDataVerifierFacetStorage.Layout;

    /// @dev Event emitted when a signature is verified
    event NexeraIDSignatureVerified(
        uint256 chainID,
        uint256 nonce,
        uint256 blockExpiration,
        address contractAddress,
        address userAddress,
        bytes functionCallData
    );

    // Event emitted when the signer is changed
    event SignerChanged(address indexed newSigner);

    /// @notice Custom error for handling signature expiry
    error BlockExpired();

    /// @notice Custom error for handling invalid signatures
    error InvalidSignature();

    /// @notice Struct to hold transaction authentication data
    /// @param chainID The chain ID where the transaction is intended to be processed
    /// @param nonce The nonce to prevent replay attacks
    /// @param blockExpiration The block number after which the transaction is considered expired
    /// @param contractAddress The address of the contract where the transaction is being executed
    /// @param userAddress The address of the user executing the transaction
    /// @param functionCallData The calldata of the function being called, including the function selector and arguments
    struct TxAuthData {
        uint256 chainID;
        uint256 nonce;
        uint256 blockExpiration;
        address contractAddress;
        address userAddress;
        bytes functionCallData;
    }

    /// @notice Initializes the `TxAuthDataVerifier` contract
    /// @param _signer The address of the off-chain service responsible for signing transactions
    function initialize(address _signer) external {
        require(
            TxAuthDataVerifierFacetStorage.layout()._signerAddress ==
                address(0),
            "Cannot initialize again"
        );
        _setSigner(_signer);
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
     * Requirements:
     * - The transaction must not have expired, as indicated by `_blockExpiration`.
     * - The provided signature must be valid and correctly match the caller's address, as determined by `_msgSender()`.
     *
     * Emits a `NexeraIDSignatureVerified` event upon successful verification, indicating that the transaction has been authenticated.
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
     * Emits a `NexeraIDSignatureVerified` event upon successful verification of the transaction.
     */
    modifier requireTxDataAuthWithAddress(address userAddress) {
        _verifyTxAuthData(_msgData(), userAddress);
        _;
    }

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function _setSigner(address _signer) internal {
        require(
            _signer != address(0),
            "BaseTxAuthDataVerifier: new signer is the zero address"
        );
        TxAuthDataVerifierFacetStorage.layout()._signerAddress = _signer;
        emit SignerChanged(_signer);
    }

    /// @notice Retrieves the signer address
    /// @return The signer address
    function txAuthDataSignerAddress() public view returns (address) {
        return TxAuthDataVerifierFacetStorage.layout()._signerAddress;
    }

    /// @notice Retrieves the current nonce for a given user
    /// @param user The address of the user
    /// @return The current nonce of the user
    function txAuthDataUserNonce(address user) public view returns (uint256) {
        return TxAuthDataVerifierFacetStorage.layout().nonces[user];
    }

    /**
     * @dev Verifies the authenticity and validity of a transaction's authorization data.
     * This function checks if the transaction signature is valid, has not expired, and is signed by the correct user.
     * It also ensures that the transaction has not been replayed by checking and incrementing the nonce.
     * Emits a {NexeraIDSignatureVerified} event upon successful verification.
     *
     * @param msgData The full calldata including the function selector and arguments.
     * @param userAddress The address of the user who signed the transaction.
     * @return A boolean value indicating whether the transaction was successfully verified.
     *
     * Requirements:
     * - The current block number must be less than `blockExpiration`.
     * - The signature must be valid and correspond to `userAddress`.
     *
     * Emits a {NexeraIDSignatureVerified} event.
     */
    function _verifyTxAuthData(
        bytes calldata msgData,
        address userAddress
    ) internal returns (bool) {
        /// Decompose msgData into the different parts we want
        bytes calldata argsWithSelector = msgData[:msgData.length -
            _EXTRA_DATA_LENGTH];

        uint256 blockExpiration = uint256(
            bytes32(
                msgData[msgData.length - _EXTRA_DATA_LENGTH:msgData.length -
                    _SIGNATURE_LENGTH]
            )
        );

        bytes calldata signature = msgData[msgData.length - _SIGNATURE_LENGTH:];

        /// Check signature hasn't expired
        if (block.number >= blockExpiration) {
            revert BlockExpired();
        }

        /// Read nonce value and increment it (in storage) to prevent replay attacks
        uint256 userNonce;
        unchecked {
            userNonce = TxAuthDataVerifierFacetStorage.layout().nonces[
                userAddress
            ]++;
        }

        /// Build tx auth data
        TxAuthData memory txAuthData = TxAuthData({
            functionCallData: argsWithSelector,
            contractAddress: address(this),
            userAddress: userAddress,
            chainID: block.chainid,
            nonce: userNonce,
            blockExpiration: blockExpiration
        });

        /// Get Hash
        bytes32 messageHash = getMessageHash(txAuthData);
        bytes32 ethSignedMessageHash = toEthSignedMessageHash(messageHash);

        emit NexeraIDSignatureVerified(
            block.chainid,
            userNonce,
            blockExpiration,
            address(this),
            userAddress,
            argsWithSelector
        );

        /// Verify Signature
        if (
            !SignatureChecker.isValidSignatureNow(
                TxAuthDataVerifierFacetStorage.layout()._signerAddress,
                ethSignedMessageHash,
                signature
            )
        ) {
            revert InvalidSignature();
        }

        return true;
    }

    /// @notice Generates a hash of the given `TxAuthData`
    /// @param _txAuthData The transaction authentication data to hash
    /// @return The keccak256 hash of the encoded `TxAuthData`
    function getMessageHash(
        TxAuthData memory _txAuthData
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _txAuthData.chainID,
                    _txAuthData.nonce,
                    _txAuthData.blockExpiration,
                    _txAuthData.contractAddress,
                    _txAuthData.userAddress,
                    _txAuthData.functionCallData
                )
            );
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from a `hash`. This
     * produces hash corresponding to the one signed with the
     * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
     * JSON-RPC method as part of EIP-191.
     *
     * This is copied from OZ in order to be compatible with both v4 and v5
     */
    function toEthSignedMessageHash(
        bytes32 hash
    ) internal pure returns (bytes32 message) {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, "\x19Ethereum Signed Message:\n32")
            mstore(0x1c, hash)
            message := keccak256(0x00, 0x3c)
        }
    }
}
