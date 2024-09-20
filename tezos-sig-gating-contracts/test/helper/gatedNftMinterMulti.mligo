#import "./bootstrap.mligo" "Bootstrap"
#import "@ligo/fa/lib/main.mligo" "FA2"
#import "../../contracts/examples/gatedNftMinterMulti.mligo" "NFTMINTER"

module FA2_NFT = FA2.NFTExtendable

// requires the initial extension + 7 addresses (4 users 3 operators)
let get_nftminter_initial_storage (admin, signerAddress, minter , owner1, owner2, owner3, owner4, op1, op2, op3: address * address * address * address * address * address * address * address * address * address ) =
    let baker = Test.nth_bootstrap_account 0 in
    let () = Test.set_baker baker in
    let owners = [owner1; owner2; owner3; owner4] in
    let ops = [op1; op2; op3] in

    let ledger = Big_map.literal ([
        (1n, owner1);
        (2n, owner2);
        (3n, owner3);
        (4n, owner4);
        (5n, owner4);
    ])
    in

    let operators  = Big_map.literal ([
        ((owner1, op1), Set.literal [1n]);
        ((owner2, op1), Set.literal [2n]);
        ((owner3, op1), Set.literal [3n]);
        ((op1   , op3), Set.literal [1n]);
        ((owner4, op1), Set.literal [4n; 5n]);
    ])
    in

    let token_metadata = (Big_map.literal [
        (1n, ({token_id=1n;token_info=(Map.empty : (string, bytes) map);} : FA2_NFT.TZIP12.tokenMetadataData));
        (2n, ({token_id=2n;token_info=(Map.empty : (string, bytes) map);} : FA2_NFT.TZIP12.tokenMetadataData));
        (3n, ({token_id=3n;token_info=(Map.empty : (string, bytes) map);} : FA2_NFT.TZIP12.tokenMetadataData));
        (4n, ({token_id=4n;token_info=(Map.empty : (string, bytes) map);} : FA2_NFT.TZIP12.tokenMetadataData));
        (5n, ({token_id=5n;token_info=(Map.empty : (string, bytes) map);} : FA2_NFT.TZIP12.tokenMetadataData));
        (6n, ({token_id=6n;token_info=(Map.empty : (string, bytes) map);} : FA2_NFT.TZIP12.tokenMetadataData));
    ] : FA2_NFT.TZIP12.tokenMetadata) in

    let metadata =Big_map.literal [
	("", [%bytes {|tezos-storage:data|}]);
	("data", [%bytes
    {|{
        "name":"FA2",
        "description":"Example FA2 implementation",
        "version":"0.1.0",
        "license":{"name":"MIT"},
        "authors":["Frank Hillard<frank@compilot.ai>"],
        "homepage":"",
        "source":{"tools":["Ligo"], "location":"https://github.com/UnbloktTechnology/ComPilotSigGatingContracts"},
        "interfaces":["TZIP-012"],
        "errors":[],
        "views":[]

    }|}]);
    ] 
    in
    let fa2_extension_initial = { 
        minter = minter;
    } in

    let fa2_storage : NFTMINTER.NftMinterInternalDispatch.extended_fa2_storage = {
        extension      = fa2_extension_initial;
        ledger         = ledger;
        token_metadata = token_metadata;
        operators      = operators;
        metadata       = metadata;
    } in
    let initial_storage : NFTMINTER.NftMinterInternalDispatch.storage = { 
        admin = admin;
        signerAddress = signerAddress;
        nonces = (Big_map.empty: (address, nat) big_map);
        siggated_extension = fa2_storage;

    } in
    initial_storage, owners, ops

let boot_nftminter (admin, signerAddress, minter, owner1, owner2, owner3, owner4, op1, op2, op3) = 
    let initial_storage, _owners, _ops = get_nftminter_initial_storage (admin, signerAddress, minter, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let orig_fa2 = Test.Next.Originate.contract (contract_of NFTMINTER.NftMinterInternalDispatch) initial_storage 0tez in
    orig_fa2
