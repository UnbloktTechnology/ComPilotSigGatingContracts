// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title A contract for verifying transaction data authorized off-cahin with a signature
/// V0 compares two gating meachansim
/// @notice This contract allows transactions to be signed off-chain and then verified on-chain using the signer's signature.
/// This version of the contract implements two ways to do that in order to compare them
/// @dev Utilizes ECDSA for signature recovery and Counters to track nonces
contract TxAuthDataVerifierV0 is Ownable {
    using ECDSA for bytes32;

    /// @notice These are used to decompose msg.data
    uint256 private constant SIGNATURE_LENGTH = 65;
    uint256 private constant SIGNATURE_SUFFIX = 31;
    uint256 private constant SIGNATURE_OFFSET = 65 + 32 + 32 + SIGNATURE_SUFFIX;
    uint256 private constant BYTES_32_VARIABLE = 32;

    /// @notice Address of the off-chain service that signs the transactions
    address private signer;

    /// @notice Mapping to track the nonces of users to prevent replay attacks
    /// @dev Maps a user address to their current nonce
    mapping(address => uint256) public nonces;

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

    /// @notice Constructs the `TxAuthDataVerifier` contract
    /// @param _signer The address of the off-chain service responsible for signing transactions
    constructor(address _signer) {
        signer = _signer;
    }

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function setSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    /// @notice Retrieves the current nonce for a given user
    /// @param user The address of the user
    /// @return The current nonce of the user
    function getUserNonce(address user) public view returns (uint256) {
        return nonces[user];
    }

    /// @notice Validates the transaction data against the provided signature
    /// @dev This function cannot be a modifier because we need to construct `_functionCallData` in the calling function
    /// @param _signature The signature to validate
    /// @param _functionCallData The calldata of the function call
    /// @param _blockExpiration The block number after which the transaction is considered expired
    function requireTxDataAuthBasic(
        bytes calldata _signature,
        bytes memory _functionCallData,
        uint256 _blockExpiration
    ) internal {
        /// Check signature hasn't expired
        if (block.number >= _blockExpiration) {
            revert BlockExpired();
        }

        TxAuthData memory txAuthData = TxAuthData({
            functionCallData: _functionCallData,
            contractAddress: address(this),
            userAddress: msg.sender,
            chainID: block.chainid,
            nonce: nonces[msg.sender],
            blockExpiration: _blockExpiration
        });

        /// Get Hash
        bytes32 messageHash = getMessageHash(txAuthData);
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        /// Verify Signature
        if (ethSignedMessageHash.recover(_signature) != signer) {
            revert InvalidSignature();
        }

        /// increment nonce to prevent replay attacks
        nonces[msg.sender] += 1;
    }

    /// @notice Modifier to validate transaction data in an optimized manner
    /// @dev Extracts args, blockExpiration, and signature from `msg.data`
    modifier requireTxDataAuthOpti() {
        /// Decompose msg.data into the different parts we want
        bytes calldata argsWithSelector = msg.data[:msg.data.length -
            BYTES_32_VARIABLE -
            SIGNATURE_OFFSET];
        uint256 _blockExpiration = uint256(
            bytes32(
                msg.data[msg.data.length -
                    BYTES_32_VARIABLE -
                    SIGNATURE_OFFSET:msg.data.length - SIGNATURE_OFFSET]
            )
        );
        bytes calldata _signature = msg.data[msg.data.length -
            SIGNATURE_LENGTH -
            SIGNATURE_SUFFIX:msg.data.length - SIGNATURE_SUFFIX];

        /// Check signature hasn't expired
        if (block.number >= _blockExpiration) {
            revert BlockExpired();
        }

        TxAuthData memory txAuthData = TxAuthData({
            functionCallData: argsWithSelector,
            contractAddress: address(this),
            userAddress: msg.sender,
            chainID: block.chainid,
            nonce: nonces[msg.sender],
            blockExpiration: _blockExpiration
        });

        /// Get Hash
        bytes32 messageHash = getMessageHash(txAuthData);
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        /// Verify Signature
        if (ethSignedMessageHash.recover(_signature) != signer) {
            revert InvalidSignature();
        }

        /// increment nonce to prevent replay attacks
        nonces[msg.sender] += 1;

        _;
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
}
