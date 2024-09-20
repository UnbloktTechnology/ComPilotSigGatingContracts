#import "./bootstrap.mligo" "Bootstrap"
#import "@ligo/fa/lib/main.mligo" "FA2"
#import "../../contracts/examples/gatedNftMinterDispatch.mligo" "NFTMINTER"

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

    let rec add_token_metadata (count: nat) (all: FA2_NFT.TZIP12.tokenMetadata) : FA2_NFT.TZIP12.tokenMetadata =
        if (count = 0n) then all else 
        let name = Bytes.concat ([%bytes "Asset #"]: bytes) (bytes count) in 
        let new_token_info : (string, bytes) map= Map.literal([("name", name)]) in
        let new_data : FA2_NFT.TZIP12.tokenMetadataData = { token_id=count; token_info=new_token_info } in 
        let new_all = Big_map.add count new_data all in
        add_token_metadata (abs(count-1n)) new_all
    in
    let token_metadata = (Big_map.empty: (nat, FA2_NFT.TZIP12.tokenMetadataData) big_map) in
    let token_metadata = add_token_metadata 6n token_metadata in

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
        "source":{"tools":["Ligo"], "location":"https://github.com/UnbloktTechnology/CompilotSigGatingContracts"},
        "interfaces":["TZIP-012"],
        "errors":[],
        "views":[]

    }|}]);
    ] 
    in
    let fa2_extension_initial = { 
        minter = minter;
        lastMinted = 5n; 
    } in

    let fa2_storage : NFTMINTER.NftMinterDispatch.extended_fa2_storage = {
        extension      = fa2_extension_initial;
        ledger         = ledger;
        token_metadata = token_metadata;
        operators      = operators;
        metadata       = metadata;
    } in
    let initial_storage : NFTMINTER.NftMinterDispatch.storage = { 
        admin = admin;
        signerAddress = signerAddress;
        nonces = (Big_map.empty: (address, nat) big_map);
        siggated_extension = fa2_storage;

    } in
    initial_storage, owners, ops

let boot_nftminter (admin, signerAddress, minter, owner1, owner2, owner3, owner4, op1, op2, op3) = 
    let initial_storage, _owners, _ops = get_nftminter_initial_storage (admin, signerAddress, minter, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let orig_fa2 = Test.Next.Originate.contract (contract_of NFTMINTER.NftMinterDispatch) initial_storage 0tez in
    orig_fa2
