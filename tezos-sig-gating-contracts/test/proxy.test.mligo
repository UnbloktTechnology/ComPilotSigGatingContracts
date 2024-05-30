#import "./helper/bootstrap.mligo" "Bootstrap"
#import "./helper/assert.mligo" "AssertHelper"
#import "../contracts/examples/proxy.mligo" "PROXY"
#import "../contracts/examples/fa2_for_proxy.mligo" "NFTMINTER"

#import "./helper/fa2_for_proxy.mligo" "FA2Helper"
// #import "../contracts/examples/nftminter.mligo" "NFTMINTER"

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////
//              THIS TEST MUST BE DONE ON TESTNET
// !!!! The signature provided cannot be built if the contract address is not stable !!! 
// In this test we do:
// - DEPLOY SignerManager -> SignerManager address is used in the initial storage of NFTMINTER
// - DEPLOY NFTMINTER -> NFTMINTER address (WARNING: address is not stable) 
// - use script to forge signature , and replace (copy/paste) it in the test
// - re-launch test  
////////////////////////////////////////////////////////////////////////////////////
let test_proxy =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
 
    // DEPLOY FA2_FOR_PROXY
    let nft_extension_initial = { 
        admin = owner1;
        proxyAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address); // unused will be overritten
    } in
    let orig_fa2 = FA2Helper.boot_fa2_for_proxy(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = fa2_taddr; code = _ ; size = _} = orig_fa2 in 
    let fa2_contract = Test.Next.Typed_address.to_contract fa2_taddr in
    let fa2_address : address = Tezos.address fa2_contract in

   // DEPLOY proxy
    let initial_storage = {
        admin = owner1;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let {taddr = proxy_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of PROXY.ProxyVerifier) initial_storage 0tez in
    let proxy_contract = Test.Next.Typed_address.to_contract proxy_taddr in
    let proxy_address : address = Tezos.address proxy_contract in

    // SET PROXY entrypoint call on FA2 contract
    let r = Test.transfer_to_contract fa2_contract (SetProxy proxy_address) 0tez in
    let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in


    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("2025-01-01T00:00:00.00Z" : timestamp) in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigu39Dhuo4UTu7cqgUwgyoR7VNfZseRGrD5xMyFY8RRtGMAcUpMyzSbNo6uFVgpHD2a3K5vdV3388YHjjs3xybAq2xKG83Tm" :
   signature) in
    // build payload 
    let functioncall_contract = fa2_address in
    let functioncall_name = "%mint" in
    let functioncall_params: NFTMINTER.NftMinterForProxy.mint = {
      owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
      token_id=6n
    } in
    let functioncall_contract_bytes : bytes = Bytes.pack functioncall_contract in
    let functioncall_name_bytes : bytes = Bytes.pack functioncall_name in
    let functioncall_params_bytes : bytes = Bytes.pack functioncall_params in
    let nonce_bytes : bytes = Bytes.pack nonce in 
    let exp_date_bytes : bytes = Bytes.pack exp_date in 
    let key_bytes : bytes = Bytes.pack my_key in
    let data : bytes = Bytes.concat key_bytes (Bytes.concat nonce_bytes (Bytes.concat exp_date_bytes (Bytes.concat functioncall_contract_bytes (Bytes.concat functioncall_name_bytes functioncall_params_bytes)))) in
    let data_hash = Crypto.keccak data in
    // DEBUG - uncomment to retrieve the payload that need to be signed
    // let () = Test.Next.IO.log("fa2_address=", fa2_address) in
    // let () = Test.Next.IO.log("functioncall_contract_bytes=", functioncall_contract_bytes) in
    // let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    // let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    // let () = Test.Next.IO.log("exp_date_bytes=", exp_date_bytes) in
    // let () = Test.Next.IO.log("data=", data) in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
        userAddress = owner3;
    } in
    // EXEC_OFFCHAIN entrypoint call 
    let r = Test.transfer_to_contract proxy_contract (Exec_offchain p) 0tez in
    let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in
    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage fa2_taddr in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | Some ownr6 -> Assert.assert (ownr6 = functioncall_params.owner) 
        | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
    in
    ()
