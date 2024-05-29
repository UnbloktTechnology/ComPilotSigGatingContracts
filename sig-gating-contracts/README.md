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

This smart contract will be deployed by us and will eventually be controlled by the SignerManagerProxyOwner.

### Signer Manager Proxy Owner

`./contracts/signerManager/SignerManagerProxyOwner.sol` is a smart contract that we use to manage NexeraIDSignerManager.

It allos two levels of permissions:

- SIGNER_MANAGER_CONTROLLER_ROLE controls changing the sigenrAddress on the NexeraID Signer Manager (should be controlled by a more secure address)
- PAUSER_ROLE can only pause the contract (change the address to ONE_ADDRESS) - sould be controlled by a faster address than SIGNER_MANAGER_CONTROLLER_ROLE

This smart contract will be deployed by us and will trasnfer SIGNER_MANAGER_CONTROLLER_ROLE to a Gnosis MultiSig and PAUSER_ROLE to a human (see Addresses section).

## Addresses/Roles

DEPLOYER_ADDRESS: deploys example contracts and signerManager, setup in git secrets

TX_SIGNER_ADDRESS: signs txAuthData in our api back end, setup and secured by Amazon Secrets Manager

PAUSER_ADDRESS: can pause the SignerManager Contract in case of a hack, is an address controlled by 2-3 people who can react fast (ledger or MM) =>PAUSER_ROLE

SIGNER_MANAGER_CONTROLLER_ADDRESS: can change the TX_SIGNER_ADDRESS and PAUSER_ADDRESS on the SignerManager contract, is a MultiSig gnosis address => SIGNER_MANAGER_CONTROLLER_ROLE

## Sig Gating Tests

`./test/` features tests for signature gating using our examples.
