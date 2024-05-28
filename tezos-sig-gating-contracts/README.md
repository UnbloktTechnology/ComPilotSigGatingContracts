# WIP : Tezos support


## General idea

The SigGating contracts are dedicated to provide a mecanism for off-chain validation of an action requested by a user. The request of a user (i.e. a contract invocation) is declared as a payload sent to NexeraSigner. The NexeraSigner retrieves the nonce for the user (from contract storage), specifies the expiration date  and compact all using a keccak hashing and finally signs this "keccaked payload". This off-chain signature is produced by Nexera signer.
Then the produced signature (and expiration date, nonce, public key) are sent back to the user. The user can now send his transaction (which contains payload + signature + public key + nonce + expiration) to the smart contract that implements the signature verifiacition mecanism. 


![](./pictures/nexera%20global%20workflow.png)

In this case the transaction fee is paid by the user.

The transaction could also be executed by an operator on behalf of the user. In this case the transaction fee is paid by the operator.


### Remark on transaction ordering

When constructing the signature , the actual nonce ofr the user is taken into account in the payload (to prevent replay attack). But it also implies that if a user submits 2 payloads (in this order `calldataA` and `calldataB`) then the `calldataB` cannot executed before `calldataA`.

![](./pictures/nexera%20transaction%20ordering.png)



## Contracts code

Inside the `tezos-sig-gating-contracts` folder

### Setup

Install the LIGO libraries `make install`. In our case we may use FA2 library to use NFT's in our test scenarios

Install node modules for interacting with smart contracts in TypeScript `make scripts_install`.

### Compiling
```
make compile
```
The compilation produces 2 files (TZ file and JSON file) which are  stored in the `compiled` folder.

### Testing
```
make test
```
Launch LIGO tests

### integration testing
```
make sign
```
for a given signer(privatekey) and a payload, this script produces a signature of the given payload signed by the public key (related to the privetkey) 



## Bug reproduction
- fill payload in test file
- `make test` copy functioncall and functioncall_params
- in script signAuthData_repro.ts, paste the 2 fields
- `make repro` copy signature
- in test file, paste the signature
- `make test`



