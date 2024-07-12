# Signature Gating extension

This library is dedicated to provide a mecanism for off-chain validation of a contract invocation. It also involves a `calldata` structure representing contract invocation which can be processed or dispatched to other contracts.

## General idea

The user wants to invoke a contract with an off-chain signed message. The message is signed by a ReferenceSigner (which can be an implicit account or a contract that provides one) which has the responsability to verify if the user wallet is authorized (i.e. via a KYC authentication service). Then the off-chain signed message can be sent as parameter during the contract invocation.

### Replay attack and expiration

In order to prevent that a signature is used twice , the payload must incapsulate a "nonce" field.
Once a user has received a signed message, he must consume the offchain signed message before an expiration (block level). The expiration has been introduced in case the user lose his authorization.

### Building a signature

The request of a user (i.e. a contract invocation) is declared as a payload sent to a ReferenceSigner. The ReferenceSigner retrieves the nonce for the user (from contract storage), specifies the expiration (block level) and compact all using a keccak hashing and finally signs this "keccaked payload". This off-chain signature is produced by the ReferenceSigner.
Then the produced signature and extra data (expiration, nonce, public key) are sent back to the user. The user can now send his transaction (which contains a `txAuthData` (payload + signature + public key + nonce + expiration)) to the smart contract that implements the signer public key verification mechanism.

In this case the transaction fee is paid by the user. The transaction could also be executed by an operator on behalf of the user. In this case the transaction fee is paid by the operator.

### Off-chain signature workflow

The Auth provider has the responsibility to sign user's calldata. This Auth provider runs a KYC service to ensure on his side the validity of the user.
For a given calldata, the user receives from the Auth provider:

- payload hash (keccak(key, nonce, expiration, calldata))
- nonce (custom nonce of the contract)
- expiration (block level)
- public key of the signer role (Auth provider)
- signature of the payload hash

Then the user build the transaction and invoke the "exec_gated_calldata" entrypoint. In order to be able to verify an off-chain signed message, the "exec_gated_calldata" entrypoint expects a `txAuthData` parameter which contains the following fields

- user address
- expiration (block level)
- calldata (contract, entrypoint name, arguments)
- signer public key
- signature

The chain ID in Tezos varies depending on the network (see [rpc nodes](https://taquito.io/docs/rpc_nodes)).

```
ghostnet  => NetXnHfVqm9iesp
oxfordnet => NetXxWsskGahzQB
mainnet   => NetXdQprcVkpaWU
sandbox   => `docker exec <docker-container-name> octez-client rpc get /chains/main/chain_id`
```

## SigGatingExtendable library usage

This library provides a parametric storage `siggated_storage` that can be extended and functions that verify the signature. These functions expects a specific input type:

- `verifyTxAuthDataWithContractAddress` expects a `txAuthDataWithContractAddress` input
- `verifyTxAuthData` expects a `txAuthData` input (same txAuthDataWithContractAddress without the contract address)

These functions emits an event `SignatureVerified` when a signature is verified.

### Extend the storage

For example , a nft minter using `@ligo/fa` library

```ocaml
  module NFT = FA2.NFTExtendable

  type fa2_extension = {
      minter: address;   // MINTER ROLE
  }
  type extended_fa2_storage = fa2_extension NFT.storage

  type storage = extended_fa2_storage SigGatedExtendable.siggated_storage
```

### Add entrypoints

Option 1 (dispatch not needed):

- declare an entrypoint "DoSomethingFromSignedMessage" that takes a `txAuthData` as parameter
  - use `SigGatingExtendable.verifyTxAuthData` function to verify the txauthdata and extract the user requested invocation (`calldata`)
  - use a strategy built-in function (i.e. `SigGatingExtendable.process_internal_calldata`) to invoke the entrypoint corresponding to the given `calldata`.

Option 2 (with Dispatch):

- declare an entrypoint "DoSomethingFromSignedMessage" that takes a `txAuthData` as parameter
  - use `SigGatingExtendable.verifyAndDispatchTxAuthData` function to verify the txauthdata and extract the user requested invocation (`calldata`) and dispatch it to a local `Dispatch` entrypoint.
- declare an entrypoint `Dispatch` that processes a `calldata`
  - use a strategy built-in function (i.e. `SigGatingExtendable.process_internal_calldata`) to invoke the entrypoint corresponding to the given `calldata`.

### Built-ins strategies

#### dispatch_calldata function

Do not process calldatas but only dispatch the calldata to the targeted contract.

#### process_internal_calldata function

Process the calldata by invoking a local entrypoint (where the business logic resides).

#### process_internal_calldata_2 function

same as process_internal_calldata but the calldata can be dispatch to 2 hetreogenous entrypoints

#### process_internal_calldata_3 function

same as process_internal_calldata but the calldata can be dispatch to 3 hetreogenous entrypoints

### Examples

#### Example without Dispatch

Case of a single contract, there is no need to use the Dispatch mechanism.
The library provides a `process_internal_calldata` function to execute the right entrypoint with the right parameter conversion.

```ocaml
  [@entry]
  let exec_gated (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      let ops, s = SigGatedExtendable.verifyTxAuthData data s in
      let cd : SigGatedExtendable.calldata = ((Tezos.get_self_address ()), data.functionName, data.functionArgs) in
      let op = SigGatedExtendable.process_internal_calldata (cd, (Tezos.self "%mint_gated": mint contract)) in
      op::ops, s

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    apply_mint mint s
```

#### Example 2 internal entrypoints without Dispatch

Case of a single contract, there is no need to use the Dispatch mechanism.
The library provides a `process_internal_calldata_2` function to execute the right entrypoint with the right parameter conversion.

```
  [@entry]
  let mint_or_burn_gated (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      let ops, s = SigGatedExtendable.verifyTxAuthData data s in
      let cd : SigGatedExtendable.calldata = ((Tezos.get_self_address ()), data.functionName, data.functionArgs) in
      let op = SigGatedExtendable.process_internal_calldata_2 (cd,
        (Tezos.self "%mint_gated": mint contract),
        (Tezos.self "%burn_gated": mint contract)) in
      op::ops, s

  [@entry]
  let burn_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    apply_mint mint s

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    apply_mint mint s
```

#### Example with Dispatch mechanism

The dispatch entrypoint can be used to dispatch a `calldata` to an internal entrypoints (ones of this contract).

```ocaml
  [@entry]
  let dispatch (cd: SigGatedExtendable.calldata)(s: storage) : ret =
    let op = SigGatedExtendable.process_internal_calldata (cd, "%mint_gated", (Tezos.self "%mint_gated": mint contract)) in
    [op], s

  [@entry]
  let exec_gated_calldata (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      SigGatedExtendable.verifyAndDispatchTxAuthData data s

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.siggated_extension.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.siggated_extension.ledger)) in
    let new_fa2_s = NFT.set_balance s.siggated_extension mint.owner mint.token_id in
    [], { s with siggated_extension=new_fa2_s }
```

In our example the business logic of our feature (mint) is in `mint_gated` entrypoint.
Notice that we ensure that this entrypoint is callable only by re-entrance with

```ocaml
 let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
```

#### Example of a "verifier proxy" with Dispatch mechanism

The dispatch entrypoint can be used to dispatch a `calldata` to an external entrypoint (not in this contract).

The VerifierProxy contract provides an entrypoint `exec_gated_calldata` to verify the signature and calls its `dispatch` entrypoint.
The VerifierProxy contract provides an entrypoint `dispatch` which calls the `dispatch` entrypoint of the target smart contract. This entrypoint cannot be called except the contract itself .

```ocaml
  [@entry]
  let dispatch (cd: SigGatedExtendable.calldata)(s: storage) : ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    let op = SigGatedExtendable.dispatch_calldata (cd, "%mint_gated", (Tezos.self "%mint_gated": mint contract)) in
    [op], s

  [@entry]
  let exec_gated_calldata (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      SigGatedExtendable.verifyAndDispatchTxAuthData data s
```

The Token contract provides an entrypoint `dispatch` which uses an internal dispatch strategy in order to call the right entrypoint. This entrypoint cannot be called except the contract itself .

```ocaml
  [@entry]
  let dispatch (cd: SigGatedExtendable.calldata)(s: storage) : ret =
    let () = Assert.assert (Tezos.get_sender () = verifierProxyAddress) in
    let op = SigGatedExtendable.process_internal_calldata (cd, "%mint_gated", (Tezos.self "%mint_gated": mint contract)) in
    [op], s

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.siggated_extension.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.siggated_extension.ledger)) in
    let new_fa2_s = NFT.set_balance s.siggated_extension mint.owner mint.token_id in
    [], { s with siggated_extension=new_fa2_s }
```

## Library tests (for dev)

Inside the `tezos-sig-gating-contracts/tezos-lib-sig-gating-extendable` folder

```
make install
make compile
make test
```

The following sections describes in detail the command lines to launch tests and deploy and interact with the contract.

### Setup

Install the LIGO libraries with `make install`. In our case we may use FA2 library to use NFT's in our test scenarios

### Compiling

Launch smart contract compilation with `make compile`

The compilation produces 2 files (TZ file and JSON file) which are stored in the `compiled` folder. The contract in JSON format is used by scripts for deployment and interactions.

### Testing

Launch LIGO tests with `make test`

## Limitations

### Remark on transaction ordering

When constructing the signature , the actual nonce for the user is taken into account in the payload (to prevent replay attack). But it also implies that if a user submits 2 payloads (in this order `calldataA` and `calldataB`) then the `calldataB` cannot executed before `calldataA`.
