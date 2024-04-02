// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

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
contract BaseTxAuthDataVerifier {
    /// @notice These are used to decompose msgData
    /// @notice This is the length for the expected signature
    uint256 private constant SIGNATURE_LENGTH = 65;
    /// @notice This completes the signature into a multiple of 32
    uint256 private constant SIGNATURE_SUFFIX = 31;
    /// @notice The complete length of the signature related data includes a 32 length field indicating the length,
    // as well as the signature itself completed with 31 zeros to be a multiple of 32
    uint256 private constant SIGNATURE_OFFSET =
        SIGNATURE_LENGTH + BYTES_32_LENGTH + SIGNATURE_SUFFIX;
    uint256 private constant BYTES_32_LENGTH = 32;

    /// @notice Address of the off-chain service that signs the transactions
    address private signer;

    /// @notice Mapping to track the nonces of users to prevent replay attacks
    /// @dev Maps a user address to their current nonce
    mapping(address => uint256) public nonces;

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

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function _setSigner(address _signer) internal {
        signer = _signer;
        emit SignerChanged(_signer);
    }

    /// @notice Retrieves the signer address
    /// @return The signer address
    function getSignerAddress() public view returns (address) {
        return signer;
    }

    /// @notice Retrieves the current nonce for a given user
    /// @param user The address of the user
    /// @return The current nonce of the user
    function getUserNonce(address user) public view returns (uint256) {
        return nonces[user];
    }

    /**
     * @dev Verifies the authenticity and validity of a transaction's authorization data.
     * This function checks if the transaction signature is valid, has not expired, and is signed by the correct user.
     * It also ensures that the transaction has not been replayed by checking and incrementing the nonce.
     * Emits a {NexeraIDSignatureVerified} event upon successful verification.
     *
     * @param msgData The full calldata including the function selector and arguments.
     * @param userAddress The address of the user who signed the transaction.
     * @param blockExpiration The block number until which the transaction is considered valid.
     * @param _signature The signature of the user authorizing the transaction.
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
        address userAddress,
        uint256 blockExpiration,
        bytes memory _signature
    ) internal returns (bool) {
        /// Decompose msgData into the different parts we want
        bytes calldata argsWithSelector = msgData[:msgData.length -
            SIGNATURE_OFFSET];

        /// Check signature hasn't expired
        if (block.number >= blockExpiration) {
            revert BlockExpired();
        }

        TxAuthData memory txAuthData = TxAuthData({
            functionCallData: argsWithSelector,
            contractAddress: address(this),
            userAddress: userAddress,
            chainID: block.chainid,
            nonce: nonces[userAddress],
            blockExpiration: blockExpiration
        });

        /// Get Hash
        bytes32 messageHash = getMessageHash(txAuthData);
        bytes32 ethSignedMessageHash = toEthSignedMessageHash(messageHash);

        /// Verify Signature
        if (
            !SignatureChecker.isValidSignatureNow(
                signer,
                ethSignedMessageHash,
                _signature
            )
        ) {
            revert InvalidSignature();
        }

        emit NexeraIDSignatureVerified(
            block.chainid,
            nonces[userAddress],
            blockExpiration,
            address(this),
            userAddress,
            argsWithSelector
        );

        /// increment nonce to prevent replay attacks
        nonces[userAddress] += 1;

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