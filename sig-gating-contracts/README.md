# @nexeraprotocol/nexera-id-sig-gating-contracts

@nexeraprotocol/nexera-id-sig-gating-contracts

Signature Based Gating: users are verified in our back-end and receive authorization signatures through our api.

## Smart Contract Architecture Overview

![Architecture Overview](../images/NexeraID%20Smart%20Contract%20Architecture%20Overview.png)

## Contracts Files

### Examples

`./contracts/gatedExamples/` contains examples of an NFT Minter using our signature based gating contracts.
/**

- Example Gated NFT Minter
NFT minting contract with gated access based on off-chain signature verification.
This contract extends ERC721 for NFT functionality, TxAuthDataVerifier for signature verification, and Ownable for ownership management.

- Example Gated NFT Minter (Upgradeable)
Upgradeable NFT minting contract with gated access based on off-chain signature verification.
This contract extends ERC721Upgradeable for NFT functionality, TxAuthDataVerifierUpgradeable for signature verification, and OwnableUpgradeable for ownership management.

- Example Multiple Inputs Contract
This contract demonstrates a contract inheriting from TxAuthDataVerifier to update variables with signature verification.
This contract tests more complex inputs such as bytes inputs or no inputs

- Non Gated Example  NFT Minter for comparison

### Verifiers

`./contracts/sigVerifiers/` contains the smart contracts used to verify signatures

- Base Transaction Authentication Data Verifier
Provides mechanisms for verifying transaction authentication data, including signature verification and nonce management.
This contract is designed to be extended by other contracts requiring transaction authentication based on digital signatures.
It includes functionality for:
- Verifying transaction signatures against a specified signer address.
- Ensuring transactions have not expired based on their block expiration.
- Incrementing nonces to prevent replay attacks.
- The contract utilizes OZ SignatureChecker for signature verification (compatible with both EOA and smart contract signers). We recommend our customers set this to point to our deployed NexeraIDSignerManager contract.

- Transaction Authentication Data Verifier
Contract for verifying transaction authentication data, including signature verification and nonce management.
It extends `BaseTxAuthDataVerifier` to provide core functionality for transaction data verification and inherits `Context` for access control utilities.

- Transaction Authentication Data Verifier (Upgradeable)
Upgradeable contract for verifying transaction authentication data, including signature verification and nonce management.
It extends `BaseTxAuthDataVerifier` to provide core functionality for transaction data verification.
It is intended to be deployed behind a proxy for upgradeability.

### Signer Manager

`./contracts/signerManager/NexeraIDSignerManager.sol` is a smart contract that we use to manage the signer address used in our API.

That way, if this address is compromised, we can change it without every customer having to call _setSigner.

This smart contract will be deployed by us and will eventually be controlled by the SIGNER_MANAGER_CONTROLLER_ADDRESS.

## Addresses/Roles

DEPLOYER_ADDRESS: deploys example contracts and signerManager, setup in git secrets

We will use 0x8b6c7Df09b65B1f81d9b3Bda73F5f22c50460c35 on all networks.

TX_SIGNER_ADDRESS: signs txAuthData in our api back end, setup and secured by Amazon Secrets Manager

We will use 0x03DF23c4dEA7B52Daf9B7920Ec6CFeDFFA691689 on all networks.

SIGNER_MANAGER_CONTROLLER_ADDRESS: can change the TX_SIGNER_ADDRESS on the SignerManager contract, is a MultiSig gnosis address => SIGNER_MANAGER_CONTROLLER_ROLE

This is a different address on each network:

- Sepolia: 0x745B6d5f858047Daf7516aa4Fc34878f4BD3b73D
- Polygon Mainnet: 0x191A193F5D5A88D7Ac52565c5ad3992da6D11183
- Base: 0xb748Cf0409bDc6f8039090EF6b09ba9722886d18

## Deployments

SignerManager is deployed on 0x29A75f22AC9A7303Abb86ce521Bb44C4C69028A0 on

- Sepolia
- Polygon Amoy
- Polygon Mainnet
- Base

## Sig Gating Tests

`./test/` features tests for signature gating using our examples.
