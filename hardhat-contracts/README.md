# @nexeraid/contracts

@nexeraid/contracts

## Contracts

### Latest deployements:

Deployed ProxyAavePool for Aave Demo (dev): 0xf32f3B6fE17381516853853e1b23f237D8387405
Deployed ProxyAavePool for Aave Demo (local): 0x5E085c0adCAbd599df4a5fCa6A778536Af1f767E

### SimpleWhitelist Contract

The SimpleWhitelist contract implements a simple whitelist. In order to get in the whitelist, a user has to submit a ZKProof.

The deployment of the contract subsequently calls setRequst with the right parameters to set up the conditions to be met by the ZKProof.

A lib function helps setup the contract and submit proof for different credential types.

### ScenarioVerifier Contract

The ScenarioVerifier contract implements a whitelist for N Rules. In order to get in the whitelist, a user has to submit a ZKProof for each rule and then call the whitelistScenario function to finalize whitelisting.

The deployment of the contract subsequently calls setRequest with the right parameters to set up the conditions to be met by the ZKProof for each Rule. A different Rule ID (request id) has to be specified for each setRequest call.

A lib function helps setup the contract and submit proof for different credential types.

### ProxyAavePool

ProxyAavePool has the same interface as Aave Pool contract (includes supply call), but supply throws error if user is not whitelisted. This contract needs INexeraVerifierEntrypoint address in the constructor.

## Tests

TBC
