// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable, ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import {BaseTxAuthDataVerifier} from "./BaseTxAuthDataVerifier.sol";

/// @title A contract for verifying transaction data authorized off-cahin with a signature
/// @notice This contract allows transactions to be signed off-chain and then verified on-chain using the signer's signature.
/// This version is OwnableUpgradeable, making it compatible with OZ'ds proxy pattern
/// @dev Utilizes ECDSA for signature recovery and Counters to track nonces
contract TxAuthDataVerifierUpgradeable is
    BaseTxAuthDataVerifier,
    OwnableUpgradeable
{
    /**
     * @dev Initialize proxied contract with signer
     * @param _signer The address of the off-chain service responsible for signing transactions
     */
    function __TxAuthDataVerifierUpgradeable_init(
        address _signer
    ) internal onlyInitializing {
        _setSigner(_signer);
        __Ownable_init();
    }

    /// @notice Sets a new signer address
    /// @dev Can only be called by the current owner
    /// @param _signer The address of the new signer
    function setSigner(address _signer) public onlyOwner {
        _setSigner(_signer);
    }

    // These overrides are necessary because both Context and ContextUpgradeable implement these
    function _msgSender()
        internal
        view
        virtual
        override(Context, ContextUpgradeable)
        returns (address)
    {
        return msg.sender;
    }

    function _msgData()
        internal
        pure
        virtual
        override(Context, ContextUpgradeable)
        returns (bytes calldata)
    {
        return msg.data;
    }

    function _contextSuffixLength()
        internal
        pure
        virtual
        override(Context, ContextUpgradeable)
        returns (uint256)
    {
        return 0;
    }
}
