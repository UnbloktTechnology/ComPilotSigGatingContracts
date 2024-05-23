# WIP : Tezos support

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







