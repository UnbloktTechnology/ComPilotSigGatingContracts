// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TxAuthDataVerifier is Ownable {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    uint256 private constant SIGNATURE_LENGTH = 65;
    uint256 private constant SIGNATURE_SUFFIX = 31;
    uint256 private constant SIGNATURE_OFFSET = 65 + 32 + 32 + SIGNATURE_SUFFIX;
    uint256 private constant NUMBER_VARIABLE_LENGTH = 32;

    address private signer; // Address of the off-chain service that signs the transactions
    mapping(address => Counters.Counter) public nonces;

    struct TxAuthData {
        bytes functionCallData; // Includes function selector and args
        address contractAddress;
        address userAddress;
        uint256 chainID;
        uint256 nonce;
        uint256 blockExpiration;
    }

    constructor(address _signer) {
        signer = _signer;
    }

    function setSigner(address _signer) public onlyOwner {
        signer = _signer;
    }

    function getUserNonce(address user) public view returns (uint256) {
        return nonces[user].current();
    }

    // Function to validate requests
    // cannot be a modifier because we need to build _functionCallData in the client function
    function requireTxDataAuthBasic(
        bytes calldata _signature,
        bytes memory _functionCallData,
        uint256 _chainID,
        uint256 _blockExpiration
    ) internal {
        // Verify txData is not expired
        require(
            block.number < _blockExpiration,
            "Signed TxData Authorization expired"
        );

        // Build TxAuthData
        TxAuthData memory txAuthData = TxAuthData({
            functionCallData: _functionCallData,
            contractAddress: address(this),
            userAddress: msg.sender,
            chainID: _chainID,
            nonce: nonces[msg.sender].current(),
            blockExpiration: _blockExpiration
        });

        // Recreate the signed message
        bytes32 messageHash = getMessageHash(txAuthData);
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover the signer from the signature
        require(
            ethSignedMessageHash.recover(_signature) == signer,
            "Invalid signature"
        );

        // Increment the nonce for the sender to prevent replay attacks
        nonces[msg.sender].increment();
    }

    // Modifier to validate requests
    // order is args, chainId, blockExpiration, signature
    modifier requireTxDataAuthOpti() {
        bytes calldata argsWithSelector = msg.data[:msg.data.length -
            NUMBER_VARIABLE_LENGTH -
            NUMBER_VARIABLE_LENGTH -
            SIGNATURE_OFFSET];
        uint256 _chainID = uint256(
            bytes32(
                msg.data[msg.data.length -
                    NUMBER_VARIABLE_LENGTH -
                    NUMBER_VARIABLE_LENGTH -
                    SIGNATURE_OFFSET:msg.data.length -
                    SIGNATURE_OFFSET -
                    NUMBER_VARIABLE_LENGTH]
            )
        );

        uint256 _blockExpiration = uint256(
            bytes32(
                msg.data[msg.data.length -
                    NUMBER_VARIABLE_LENGTH -
                    SIGNATURE_OFFSET:msg.data.length - SIGNATURE_OFFSET]
            )
        );
        bytes calldata _signature = msg.data[msg.data.length -
            SIGNATURE_LENGTH -
            SIGNATURE_SUFFIX:msg.data.length - SIGNATURE_SUFFIX];

        // Verify txData is not expired
        require(
            block.number < _blockExpiration,
            "Signed TxData Authorization expired"
        );

        // Build TxAuthData
        TxAuthData memory txAuthData = TxAuthData({
            functionCallData: argsWithSelector,
            contractAddress: address(this),
            userAddress: msg.sender,
            chainID: _chainID,
            nonce: nonces[msg.sender].current(),
            blockExpiration: _blockExpiration
        });
        // Recreate the signed message
        bytes32 messageHash = getMessageHash(txAuthData);
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover the signer from the signature
        require(
            ethSignedMessageHash.recover(_signature) == signer,
            "Invalid signature"
        );

        // Increment the nonce for the sender to prevent replay attacks
        nonces[msg.sender].increment();

        _; // Continue execution
    }

    function getMessageHash(
        TxAuthData memory _txAuthData
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _txAuthData.functionCallData,
                    _txAuthData.contractAddress,
                    _txAuthData.userAddress,
                    _txAuthData.chainID,
                    _txAuthData.nonce,
                    _txAuthData.blockExpiration
                )
            );
    }
}
