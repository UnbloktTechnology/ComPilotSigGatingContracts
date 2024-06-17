# Signature Gating extension

This library is dedicated to provide a mecanism for off-chain validation of a contract invocation. It also involves a `calldata` structure  representing contract invocation which can be processed or dispatched to other contracts. 

## General idea

The user wants to invoke a contract with an off-chain signed message. The message is signed by a ReferenceSigner (which can be an implicit account or a contract that provides one) which has the responsability to verify if the user wallet is authorized (i.e. via a KYC authentication service). Then the off-chain signed message can be sent as parameter during the contract invocation. 

### Replay attack and expiration
In order to prevent that a signature is used twice , the payload must incapsulate a "nonce" field.
Once a user has received a signed message, he must consume the offchain signed message before an expiration (block level). The expiration has been introduced in case the user lose his authorization.

### Forging a signature 
The request of a user (i.e. a contract invocation) is declared as a payload sent to a ReferenceSigner. The ReferenceSigner retrieves the nonce for the user (from contract storage), specifies the expiration (block level) and compact all using a keccak hashing and finally signs this "keccaked payload". This off-chain signature is produced by the ReferenceSigner.
Then the produced signature and extra data (expiration, nonce, public key) are sent back to the user. The user can now send his transaction (which contains a `txAuthData` (payload + signature + public key + nonce + expiration)) to the smart contract that implements the signature verification mechanism. 


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


Then the user build the transaction and invoke the exec_gated_calldata entrypoint. In order to be able to verify an off-chain signed message, the exec_gated_calldata entrypoint expects a `txAuthData` parameter which contains the following fields
  - payload hash
  - chain ID
  - user address
  - nonce
  - expiration (block level)
  - calldata (contract, entrypoint name, arguments)
  - public key
  - signature

![](./pictures/nexera%20exec_offchain%20format.png)

The chain ID in Tezos varies depending on the network (see [rpc nodes](https://taquito.io/docs/rpc_nodes)).

| Network   | chain ID |
|-----------|-----------|
| ghostnet  | NetXnHfVqm9iesp |
| oxfordnet | NetXxWsskGahzQB |
| mainnet   | NetXdQprcVkpaWU |
| sandbox   | `docker exec <docker-container-name> octez-client rpc get /chains/main/chain_id` |


## SigGatingExtendable library usage

- Extend the storage

For example , a nft minter using `@ligo/fa` library
```ocaml
  module NFT = FA2.NFTExtendable

  type fa2_extension = {
      minter: address;   // MINTER ROLE 
  }
  type extended_fa2_storage = fa2_extension NFT.storage

  type storage = extended_fa2_storage SigGatedExtendable.siggated_storage
```

- Add entrypoints
    - declare an entrypoint "DoSomethingFromSignedMessage" that takes a `txAuthData` as parameter
        - use `SigGatingExtendable.verifyTxAuthData` function to verify the txauthdata and extract the user requested invocation (`calldata`)
        - or use `SigGatingExtendable.verifyAndDispatchTxAuthData` function to verify the txauthdata and extract the user requested invocation (`calldata`) and dispatch it to a local `Dispatch` entrypoint.

    - declare an entrypoint `Dispatch` that processes a `calldata`

    - use a strategy built-in function (i.e. `SigGatingExtendable.single_internal_calldata`) to invoke the entrypoint corresponding to the given  `calldata`.


for example ,
```ocaml
  // Example of entrypoint which uses 
  // - verifyTxAuthData function for signature verification (nonce, expiration) 
  // - single_internal_calldata for processing the calldata (by calling the targeted entrypoint)
  [@entry]
  let exec_gated_calldata_no_dispatch (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      let s = SigGatedExtendable.verifyTxAuthData data s in
      let cd : SigGatedExtendable.calldata = (data.contractAddress, data.name, data.args) in
      let op = SigGatedExtendable.single_internal_calldata (cd, "%mint_gated", (Tezos.self "%mint_gated": mint contract)) in
      [op], s
```

for example with Dispatch (usefull in case of proxy too),
```ocaml
  [@entry]
  let dispatch (cd: SigGatedExtendable.calldata)(s: storage) : ret =
    let op = SigGatedExtendable.single_internal_calldata (cd, "%mint_gated", (Tezos.self "%mint_gated": mint contract)) in
    [op], s

  // Example (useful if verification and processing is separated in different contracts) of entrypoint which uses 
  // - verifyAndDispatchTxAuthData function for signature verification (nonce, expiration)
  // - calls Distpatch entrypoint for processing the calldata
  [@entry]
  let exec_gated_calldata (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      SigGatedExtendable.verifyAndDispatchTxAuthData data s 
```

In our exaple the business logic of our feature (mint) resided in `mint_gated` entrypoint 
```ocaml
 [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.siggated_extension.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.siggated_extension.ledger)) in
    let new_fa2_s = NFT.set_balance s.siggated_extension mint.owner mint.token_id in
    [], { s with siggated_extension=new_fa2_s }
```

Notice that we ensure that this entrypoint is callable only by re-entrance with 
```ocaml
 let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in 
```


### Built-ins strategies

| function | description |
|----------|-------------|
| dispatch_calldata | Do not process calldatas but only dispatch the calldata to the targeted contract. |
| single_internal_calldata | Process the calldata by invoking a local entrypoint (where the business logic resides). |
| multiple_2_internal_calldata | same as single_internal_calldata but the calldata can be dispatch to 2 hetreogenous entrypoints |
| multiple_3_internal_calldata | same as single_internal_calldata but the calldata can be dispatch to 3 hetreogenous entrypoints |


## Smart contract architecture

### Example of a standard TZIP-12 NFT token (using FA2 lib)

![](./pictures/nexera%20nftminter%20entrypoints.png)

| function name    | parameters | module     |
|------------------|------------|------------|
| setSigner        | address    | NFTMINTER  |
| mint             | mint       | NFTMINTER  |
| mint_gated       | mint       | NFTMINTER  |
| dispatch         | calldata   | NFTMINTER  |
| exec_gated_calldata    | txAuthData | NFTMINTER  |
| transfer         | FA2.NFTExtendable.TZIP12.transfer |	FA2.NFTExtendable |
| balance_of       | FA2.NFTExtendable.TZIP12.balance_of |	FA2.NFTExtendable |
| update_operators | FA2.NFTExtendable.TZIP12.update_operators | FA2.NFTExtendable |

### Example of a proxy contract

The verification of the signature and the controls (expiration) can be splitted into 2 contracts
- a proxy that verifies the signature and dispatch the `calldata`
- a fa2 contract that accepts a `calldata` (only from the proxy) and process it
  
![](./pictures/nexera%20proxynftminter.png)



## Example code and tests

Inside the `tezos-sig-gating-contracts/tezos-lib-sig-gating-extendable` folder

```
make install
make compile
make test
```

The following sections describes in detail the command lines to launch tests and deploy and interact with the contract.


### Setup

Install the LIGO libraries `make install`. In our case we may use FA2 library to use NFT's in our test scenarios

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


## Limitations

### Remark on transaction ordering

When constructing the signature , the actual nonce ofr the user is taken into account in the payload (to prevent replay attack). But it also implies that if a user submits 2 payloads (in this order `calldataA` and `calldataB`) then the `calldataB` cannot executed before `calldataA`.

![](./pictures/nexera%20transaction%20ordering.png)

