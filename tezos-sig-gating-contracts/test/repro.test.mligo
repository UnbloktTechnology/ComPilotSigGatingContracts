#import "./helper/repro_helper.mligo" "NftMinterHelper"
#import "./helper/assert.mligo" "AssertHelper"
#import "./helper/bootstrap.mligo" "Bootstrap"
#import "../contracts/examples/reproduction.mligo" "NFTMINTER"

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let test_repro_initial_storage =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let _nftminter_address : address = Tezos.address nftminter_contract in

    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    ()


let test_repro_mint_offchain =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in
    let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in

    // call MINT_OFFCHAIN entrypoint 
    let () = Test.set_source owner1 in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigu36vhhH7zeF6PhRkzTUUuR1935diGvM629mfDYGYGRkJyjaawoyoRdzMBbm8hd7Vypaxi4FZKNvDoTACGNBrLPES35HVpV" :
   signature) in
    // FUNCTIONCALL (ENTRYPOINT) 
    let functioncall_contract = nftminter_address in
    let functioncall_name = "%mint_offchain" in
    let functioncall_params: NFTMINTER.NftMinter.mint = {
      owner=owner3;
      token_id=6n
    } in
    let functioncall_contract_bytes : bytes = Bytes.pack functioncall_contract in
    let functioncall_name_bytes : bytes = Bytes.pack functioncall_name in
    let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    let functioncall_params_bytes : bytes = Bytes.pack functioncall_params in
    let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // debug
    // let ep : NFTMINTER.NftMinter.mint contract = match Bytes.unpack functioncall with
    // | Some c -> c
    // | None -> failwith "error unpacking entrypoint"
    // in
    // let () = Test.Next.IO.log("functioncall ep=", functioncall) in
    // let () = Test.Next.IO.log("decoded ep=", ep) in
    let key_bytes : bytes = Bytes.pack my_key in
    // let data : bytes = Bytes.concat key_bytes functioncall in
    let data : bytes = Bytes.concat key_bytes (Bytes.concat functioncall_contract_bytes (Bytes.concat functioncall_name_bytes functioncall_params_bytes)) in
    let () = Test.Next.IO.log("data=", data) in
    let data_hash = Crypto.keccak data in
    let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
        userAddress = owner3;
        token_id = 6n;        
    } in

    let r = Test.transfer_to_contract nftminter_contract (Exec_offchain p) 0tez in
    let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in

    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | Some ownr6 -> Assert.assert (ownr6 = p.userAddress) 
        | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
    in
    ()