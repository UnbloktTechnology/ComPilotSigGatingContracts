#import "@ligo/fa/lib/main.mligo" "FA2"
// #import "../.ligo/source/i/ligo__s__fa__1.1.1__ffffffff" "FA2"
// module TZIP12 = FA2.MultiAsset.TZIP12


let boot_accounts () =
    let () = Test.Next.State.reset 8n ([10000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez] : tez list) in
    let accounts =
        Test.Next.Account.address 1n,
        Test.Next.Account.address 2n,
        Test.Next.Account.address 3n,
        Test.Next.Account.address 4n,
        Test.Next.Account.address 5n,
        Test.Next.Account.address 6n,
        Test.Next.Account.address 7n
    in
    accounts


// (* Tests for FA2 multi asset contract *)
// let get_fa2_initial_storage (a, b, c : nat * nat * nat) =
// //   let () = Test.reset_state 6n ([] : tez list) in

//   let owner1 = Test.nth_bootstrap_account 1 in
//   let owner2 = Test.nth_bootstrap_account 2 in
//   let owner3 = Test.nth_bootstrap_account 3 in

// //   let owners = [owner1; owner2; owner3] in

//   let op1 = Test.nth_bootstrap_account 4 in
//   let _op2 = Test.nth_bootstrap_account 5 in
//   let _op3 = Test.nth_bootstrap_account 6 in

// //   let ops = [op1; op2; op3] in

//   let ledger = Big_map.literal ([
//     ((owner1, 1n), a);
//     ((owner2, 1n), b);
//     ((owner3, 1n), c);
//   ])
//   in
//   let operators  = Big_map.literal ([
//     ((owner1, op1), Set.literal [1n]);
//     ((owner2, op1), Set.literal [1n]);
//     ((owner3, op1), Set.literal [1n]);
//   ])
//   in
//   let token_metadata = (Big_map.literal [
//     (1n, ({token_id=1n;token_info=(Map.empty : (string, bytes) map);} : FA2.MultiAsset.TZIP12.tokenMetadataData));
//     (2n, ({token_id=2n;token_info=(Map.empty : (string, bytes) map);} : FA2.MultiAsset.TZIP12.tokenMetadataData));
//     (3n, ({token_id=3n;token_info=(Map.empty : (string, bytes) map);} : FA2.MultiAsset.TZIP12.tokenMetadataData));
//   ] : FA2.MultiAsset.TZIP12.tokenMetadata)
//     in

//     let metadata =Big_map.literal [
//         ("", [%bytes {|tezos-storage:data|}]);
//         ("data", [%bytes
//     {|{
//         "name":"FA2",
//         "description":"Example FA2 implementation",
//         "version":"0.1.0",
//         "license":{"name":"MIT"},
//         "authors":["Benjamin Fuentes<benjamin.fuentes@marigold.dev>"],
//         "homepage":"",
//         "source":{"tools":["Ligo"], "location":"https://github.com/ligolang/contract-catalogue/tree/main/lib/fa2"},
//         "interfaces":["TZIP-012"],
//         "errors":[],
//         "views":[]

//     }|}]);
//     ]  
//     in
//     let initial_storage : FA2.MultiAsset.storage  = {
//         ledger         = ledger;
//         metadata       = metadata;
//         token_metadata = token_metadata;
//         operators      = operators;
//     } in
//     initial_storage


// let boot_fa2 () = 
//     let _accounts = boot_accounts() in
//     let initial_storage = get_fa2_initial_storage (100n, 0n, 0n) in
//     let orig_fa2 = Test.originate (contract_of FA2.MultiAsset) initial_storage 0tez in
//     orig_fa2
