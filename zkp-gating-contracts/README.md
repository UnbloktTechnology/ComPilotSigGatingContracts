# @nexeraprotocol/nexera-id-zkp-gating-contracts

@nexeraprotocol/nexera-id-zkp-gating-contracts

This repository contains smart contracts developed by Nexera ID to help our customers restrict access to their smart contracts.

There are two ways to do this:

- Signature Based Gating: users are verified in our back-end and receive authorization signatures through our api
- ZKP Based gating: using polygon ID, users can generate ZKPs and get verified on-chain

## Signature Based Gating Contracts

From the [docs](https://docs.nexera.id/smartcontractgating/):

NexeraID's signature based gating solution is based on the unified user profile that each customer has in the NexeraID Dashboard. Rather than having separate on-chain and off-chain lists, a customer is allowed (or denied) access to a smart contract based on their status in the NexeraID Dashboard.

The user authenticates with their wallet (1) and prepares an action (2). Then the front end generates a transaction and requests a signature through the NexeraID API (3). The API checks with the NexeraID user profile (4), and if the user is approved, the API signs the transaction and returns it to the front end (5). The front end constructs the final transaction and presents it to the user for their signature (6). The user publishes the transaction which is sent to the signature verifier smart contract, `TxAuthDataVerifier` (7). If the signature is valid, the transaction is sent to the gated smart contract.

Instructions can be found [here](https://docs.nexera.id/developing/gating/smartcontract)

### Contracts

#### Examples

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

- Non Gated Example  NFT Minter for comparaison

#### Verifiers

`./contracts/sigVerifiers/` contains the smart contracts used to verify signatures

- Base Transaction Authentication Data Verifier
Provides mechanisms for verifying transaction authentication data, including signature verification and nonce management.
This contract is designed to be extended by other contracts requiring transaction authentication based on digital signatures.
It includes functionality for:
- Verifying transaction signatures against a specified signer address.
- Ensuring transactions have not expired based on their block expiration.
- Incrementing nonces to prevent replay attacks.
- The contract utilizes OZ SignatureChecker for signature verification (compatible with both EOA and smart contract signers).

- Transaction Authentication Data Verifier
Contract for verifying transaction authentication data, including signature verification and nonce management.
It extends `BaseTxAuthDataVerifier` to provide core functionality for transaction data verification and inherits `Context` for access control utilities.

- Transaction Authentication Data Verifier (Upgradeable)
Upgradeable contract for verifying transaction authentication data, including signature verification and nonce management.
It extends `BaseTxAuthDataVerifier` to provide core functionality for transaction data verification.
It is intended to be deployed behind a proxy for upgradeability.

#### Signer Manager

`./contracts/signerManager/NexeraIDSignerManager.sol` is a smart contract that we use to manage the signer address used in our API.

That way, if this address is compromised, we can change it without every customer having to call _setSigner.

### Sig Gating Tests

`./test/SIgGatingTests/` features tests for signature gating using our examples.

## ZKP Based Gating Contracts

More about this [here](https://docs.nexera.id/developing/gating/onchain).

Relevant files:
`./contracts/validators/` ZKP Validators
`./contracts/zkpVerifiers/` ZKP Verifiers
`./contracts/gatedExamples/` Examples

### ScenarioVerifier Contract

The ScenarioVerifier contract implements a whitelist for N Rules. In order to get in the whitelist, a user has to submit a ZKProof for each rule and then call the whitelistScenario function to finalize whitelisting.

The deployment of the contract subsequently calls setRequest with the right parameters to set up the conditions to be met by the ZKProof for each Rule. A different Rule ID (request id) has to be specified for each setRequest call.

A lib function helps setup the contract and submit proof for different credential types.

### NexeraVerifierEntrypoint

This contract manages the registration, update, and verification of Scenario Verifiers for a single project

### ProxyAavePool

ProxyAavePool has the same interface as Aave Pool contract (includes supply call), but supply throws error if user is not whitelisted. This contract needs INexeraVerifierEntrypoint address in the constructor.

### ZKP Gating Tests

`./test/ZKPGatingTests/`
