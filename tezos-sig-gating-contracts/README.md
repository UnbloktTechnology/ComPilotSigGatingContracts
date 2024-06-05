# WIP : Tezos support


## General idea

The SigGating contracts are dedicated to provide a mecanism for off-chain validation of an action requested by a user. The request of a user (i.e. a contract invocation) is declared as a payload sent to NexeraSigner. The NexeraSigner retrieves the nonce for the user (from contract storage), specifies the expiration (block level) and compact all using a keccak hashing and finally signs this "keccaked payload". This off-chain signature is produced by Nexera signer.
Then the produced signature and extra data (expiration, nonce, public key) are sent back to the user. The user can now send his transaction (which contains payload + signature + public key + nonce + expiration) to the smart contract that implements the signature verifiacition mecanism. 


![](./pictures/nexera%20global%20workflow.png)

In this case the transaction fee is paid by the user.

The transaction could also be executed by an operator on behalf of the user. In this case the transaction fee is paid by the operator.


### off-chain signture workflow

For a given calldata, the user receives from Nexera 
- payload hash (keccak(key, nonce, expiration, calldata))
- nonce (custom nonce of the contract)
- expiration (block level)
- public key of Nexera signer role
- signature of the payload hash

![](./pictures/nexera%20forge%20sig%20workflow.png)


Then the user build the transaction and invoke the exec_offchain_calldata entrypoint. In order to be able to verify an off-chain signed message, the exec_offchain_calldata entrypoint expects a `txAuthData` parameter which contains the following fields
  - payload hash
  - chain ID
  - user address
  - nonce
  - expiration (block level)
  - calldata (contract, entrypoint name, arguments)
  - public key
  - signature

![](./pictures/nexera%20exec_offchain_calldata%20format.png)

The chain ID in Tezos varies depending on the network (see [rpc nodes](https://taquito.io/docs/rpc_nodes)).

| Network   | chain ID |
|-----------|-----------|
| ghostnet  | NetXnHfVqm9iesp |
| oxfordnet | NetXxWsskGahzQB |
| mainnet   | NetXdQprcVkpaWU |
| sandbox   | `docker exec <docker-container-name> octez-client rpc get /chains/main/chain_id` |

## Smart contract architecture

### Example of a standard TZIP-12 NFT token (using FA2 lib)

![](./pictures/nexera%20nftminter%20entrypoints.png)

| function name    | parameters | module     |
|------------------|------------|------------|
| setSigner        | address    | NFTMINTER  |
| mint             | mint       | NFTMINTER  |
| dispatch         | calldata   | NFTMINTER  |
| exec_offchain_calldata    | txAuthData | NFTMINTER  |
| transfer         | FA2.NFTExtendable.TZIP12.transfer |	FA2.NFTExtendable |
| balance_of       | FA2.NFTExtendable.TZIP12.balance_of |	FA2.NFTExtendable |
| update_operators | FA2.NFTExtendable.TZIP12.update_operators | FA2.NFTExtendable |

### Example of a proxy contract

The verification of the signature and the controls (expiration) can be splitted into 2 contracts
- a proxy that verifies the signature and dispatch the `calldata`
- a fa2 contract that accepts a `calldata` (only from the proxy) and process it
  
![](./pictures/nexera%20proxynftminter.png)

## Deployments

The *nft minter* contract has been deployed 

| network  | address                                 |
|----------|-----------------------------------------|
| Ghostnet | KT1Ko4fwVmzNfZe3pSYFjhPYQj6GUTU3dAPa    | 
| Mainnet  | N/A                                     |


## Contracts code

Inside the `tezos-sig-gating-contracts` folder

```
make install
make scripts_install
make compile
make test
make sandbox-start
make integration-test
make sandbox-stop
```

The following sections describes in detail the command lines to launch tests and deploy and interact with the contract.


### Setup

Install the LIGO libraries `make install`. In our case we may use FA2 library to use NFT's in our test scenarios

Install node modules for interacting with smart contracts in TypeScript `make scripts_install`.

### Compiling
```
make compile
```
The compilation produces 2 files (TZ file and JSON file) which are  stored in the `compiled` folder. The contract in JSON format is used by scripts for deployment and interactions. 

### Testing
```
make test
```
Launch LIGO tests

### Integration testing LOCALHOST

A local network (called *sandbox*) can be used for testing before deployment on Testnet.
- Run the sandbox `make sandbox-start`
- Launch a single test script with `make integration-test` that deploys a contract and executes a "mint off chain" (and test failure cases).
- Stop the sandbox `make sandbox-stop`

#### The sandbox
Launching the sandbox will create a running docker container. The `docker ps` command will show you the running container.
Default available users can be shown with `docker exec tezos-sig-gating-contracts-sandbox oxfordbox info`

Two extra users have been added (in script `run-sandbox`). We can check existing addresses
```
docker exec tezos-sig-gating-contracts-sandbox octez-client list known contracts
```
We can also check the balance for these accounts with
```
docker exec tezos-sig-gating-contracts-sandbox octez-client get balance for alice
docker exec tezos-sig-gating-contracts-sandbox octez-client get balance for bob
docker exec tezos-sig-gating-contracts-sandbox octez-client get balance for frank
docker exec tezos-sig-gating-contracts-sandbox octez-client get balance for user
```

Get the chain_id
```
docker exec tezos-sig-gating-contracts-sandbox octez-client rpc get /chains/main/chain_id
```


### Manual interaction (separate scripts)

#### Deploy a NftMinter

Once the sandbox is running we can deploy a contract. The script `local_deploy_nftminter.ts` deploys a contract (NftMinter) on behalf of alice (considered as admin). This script can be launch with `make localdeploy`.

```
docker exec tezos-sig-gating-contracts-sandbox octez-client list known contracts
```

#### Off-chain signing

The script `local_sign.ts` is a tool to sign a payload on behalf of bob. (For the moment the inputs must be specified inside the file. Need improvment !).
```
make localsign
```
for a given signer(privatekey) and a payload, this script produces a signature of the given payload signed by the public key (related to the private key)
This command should display something like this. 
```
sig= {
  bytes: '4829ce5f20426c2e4f2107cba21c466fa06b5db70d25ff2ff3af8ee74ee7a489',
  sig: 'sigtnFrMku2Yae9V4rQ6mp6bFVMJ32d5eurqAExNzcfDkTUnYHfMbLkjdANR2veQLszQdaJ6ijA1xS48BuKDW4uLscKVyrcW',
  prefixSig: 'edsigu4biyQyoJUmgCg49Y8d13tY1887xbiXWEWuygizbfZmQncUtAFWRqns5R1eijsXERx7CDcW5zdvCnvE6yMr36PwiGVKCSu',
  sbytes: '4829ce5f20426c2e4f2107cba21c466fa06b5db70d25ff2ff3af8ee74ee7a489eb5d72f6e40744c43dc5bb8534d18a530669af464ef3ed7d38340eae0cf4c850230bccb71495e6214f36991e0635dec25fa6d534d3179f42f96b100317f8f40c'
}
```
The `prefixSig` field is the signature that must be used when invoking the contract.

#### Mint local

`make localmint`:    Alice sends a message (signed offchain by bob) to the  NftMinter contract. (the message is a call data asking user to mint asset 1).

Expected output:
```
Waiting for Exec_offchain_calldata on KT1UgwgtRhh2FYwoc38sPKDsqPkjDRpEoFio to be confirmed...
tx confirmed:  ooTY3qhAMvhNwpnxA2roTaMiuxuVKy8RwueB9sfYJmUPCC2bhW4
```

#### Display contract storage !
TODO need improvment
Verify that the asset 1 is owned by "user". The following command display the owners for 3 first assets.
```
make localdisplay
```

### Integration testing TESTNET

#### Off-chain signing
The script `signAuthData.ts` is a tool to sign a payload. (For the moment the inputs must be specified inside the file. Need improvment !).
Fill
```
make sign
```
for a given signer(privatekey) and a payload, this script produces a signature of the given payload signed by the public key (related to the private key)
This command should display something like this. 
```
sig= {
  bytes: '4829ce5f20426c2e4f2107cba21c466fa06b5db70d25ff2ff3af8ee74ee7a489',
  sig: 'sigtnFrMku2Yae9V4rQ6mp6bFVMJ32d5eurqAExNzcfDkTUnYHfMbLkjdANR2veQLszQdaJ6ijA1xS48BuKDW4uLscKVyrcW',
  prefixSig: 'edsigu4biyQyoJUmgCg49Y8d13tY1887xbiXWEWuygizbfZmQncUtAFWRqns5R1eijsXERx7CDcW5zdvCnvE6yMr36PwiGVKCSu',
  sbytes: '4829ce5f20426c2e4f2107cba21c466fa06b5db70d25ff2ff3af8ee74ee7a489eb5d72f6e40744c43dc5bb8534d18a530669af464ef3ed7d38340eae0cf4c850230bccb71495e6214f36991e0635dec25fa6d534d3179f42f96b100317f8f40c'
}
```
The `prefixSig` field is the signature that must be used when invoking the contract.

#### Deploy contract on ghostnet
This command deploys the `NftMinter` contract on Ghostnet. It uses the `deploy_nftminter.ts` script. (For the moment the initial storage of the contract must be specified in the file. Need improvment).
```
make deploy
```

#### Interact (call entrypoint)

Once the contract is deployed , we can interact with it. 
The following command invoke the `Exec_offchain_calldata` entrypoint of the `NftMinter` contract. 
(For the moment the parameters (nonce, expiration, calldata, public key, signature, useraddress) must be specified in the file. The signature parameter can be forged with the `make sign` command. Need improvment).
```
make mint
```

Once the transaction is accepted, you can check on an indexer (TZKT for example)
For example, [our ghostnet contract](https://ghostnet.tzkt.io/KT1AoU1mrLRSM2zouUVkvLz2UHo1on4UAFBF/operations/)


## Limitations

### Remark on transaction ordering

When constructing the signature , the actual nonce ofr the user is taken into account in the payload (to prevent replay attack). But it also implies that if a user submits 2 payloads (in this order `calldataA` and `calldataB`) then the `calldataB` cannot executed before `calldataA`.

![](./pictures/nexera%20transaction%20ordering.png)

