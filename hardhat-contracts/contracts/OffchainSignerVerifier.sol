// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract WhitelistedAccess {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;

    address private signer; // Address of the off-chain service that signs the transactions
    mapping(address => Counters.Counter) private nonces;

    constructor(address _signer) {
        signer = _signer;
    }

    // Modifier to validate requests
    modifier withWhitelistedAccess(bytes calldata signature, bytes calldata data) {
        // Recreate the signed message
        bytes32 messageHash = getMessageHash(msg.sender, data, nonces[msg.sender].current());
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover the signer from the signature
        require(ethSignedMessageHash.recover(signature) == signer, "Invalid signature");

        // Increment the nonce for the sender to prevent replay attacks
        nonces[msg.sender].increment();

        _; // Continue execution
    }

    /**
    - Block.chainid: The block.chainid is included in the hash, ensuring the signature is only valid on the specific chain.
    - Address of the target contract: The contract's address (address(this)) is included in the hash, ensuring the signature is only valid for the specific contract.
    - Nonce unique for each msg.sender: The nonce (nonces[msg.sender].current()) is unique for each msg.sender and included in the hash.
        This ensures the signature is valid only for one call and protects against replay attacks.
        By using a separate nonce for each user, it also mitigates potential front-running issues.
    - msg.sender itself: The msg.sender address is included in the hash,
        ensuring that the signature is tied to the specific user and cannot be used by non-whitelisted users.

    - Selector and all arguments of the original call:
        The data parameter in the getMessageHash function is intended to represent the entire calldata, including the function selector and its arguments.
        Ensure that the data passed to getMessageHash and the withWhitelistedAccess modifier includes the function selector and all the arguments of the call.
        This ensures that the signature protects the entire call, and different actions can have different validation rules.
        // TODO should we calculate the hash of the data in the contract or can we trust that user will pass the correct data?
*/
    function getMessageHash(
        address _sender,
        bytes calldata data,
        uint256 _nonce
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, address(this), _sender, data, _nonce));
    }

    // Add functions that are protected by the withWhitelistedAccess modifier
    function protectedFunction(bytes calldata signature, bytes calldata data) external withWhitelistedAccess(signature, data) {
        // Function logic here
    }
}
