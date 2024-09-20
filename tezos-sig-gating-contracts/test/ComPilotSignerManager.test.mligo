#import "./helper/bootstrap.mligo" "Bootstrap"
#import "./helper/assert.mligo" "AssertHelper"
#import "../contracts/signerManager/ComPilotSignerManager.mligo" "ComPilotSignerManager"


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
let test_signermanager_pause =
    let (owner1, _owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner3;
        pauser = owner1;
        pause = false
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Pause ()) 0tez in
    let () = AssertHelper.tx_success r in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause) in
    ()

let test_signermanager_failure_pause_not_pauser =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner3;
        pauser = owner1;
        pause = false
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (Pause ()) 0tez in
    let () = AssertHelper.string_failure r ComPilotSignerManager.SignerManager.Errors.not_pauser in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = false) in
    ()

let test_signermanager_failure_pause_already_paused =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner3;
        pauser = owner1;
        pause = true
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Pause ()) 0tez in
    let () = AssertHelper.string_failure r ComPilotSignerManager.SignerManager.Errors.already_paused in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = true) in
    ()

let test_signermanager_unpause =
    let (owner1, _owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner3;
        pauser = owner1;
        pause = true
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Unpause ()) 0tez in
    let () = AssertHelper.tx_success r in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = false) in
    ()

let test_signermanager_failure_unpause_not_pauser =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner3;
        pauser = owner1;
        pause = true
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (Unpause ()) 0tez in
    let () = AssertHelper.string_failure r ComPilotSignerManager.SignerManager.Errors.not_pauser in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = true) in
    ()

let test_signermanager_failure_unpause_already_unpaused =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner3;
        pauser = owner1;
        pause = false
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Unpause ()) 0tez in
    let () = AssertHelper.string_failure r ComPilotSignerManager.SignerManager.Errors.already_unpaused in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = false) in
    ()

////////////////////////////////////////////////////////////////////////////////////
//              THIS TEST MUST BE DONE ON TESTNET
// !!!! The signature provided cannot be built if the contract address is not stable !!! 
// In this test we do:
// - DEPLOY SignerManager -> SignerManager address is used in the initial storage of NFTMINTER
// - DEPLOY NFTMINTER -> NFTMINTER address (WARNING: address is not stable) 
// - use script to forge signature , and replace (copy/paste) it in the test
// - re-launch test  
////////////////////////////////////////////////////////////////////////////////////
// let test_verifier_signature_verify_using_signer_manager =
//     let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
//     // DEPLOY SignerManager
//     let initial_storage = { 
//         owner = owner1;
//         signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
//         pauser = owner1;
//         pause = false
//     } in
//     let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of ComPilotSignerManager.SignerManager) initial_storage 0tez in
//     let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
//     let signer_manager_address : address = Tezos.address signer_manager_contract in

//     // DEPLOY NFTMINTER
//     let nft_extension_initial = { 
//         admin = owner1;
//         signerAddress = signer_manager_address;
//         nonces = (Big_map.empty: (address, nat) big_map)
//     } in
//     let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
//     let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
//     let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
//     let nftminter_address : address = Tezos.address nftminter_contract in

//     let () = Test.set_source owner1 in
//     let nonce = 0n in
//     let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
//     let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
//     let my_sig : signature = ("edsigtgJ66TKs2WqbAPwTcizA8W6m9zMQAZvUcPZ3MNoaY6xn7tg1kjwxcJdpuArPMMH2PP47jJMZ1DBiT5LAqnqENpmQaVBpSV" :
//    signature) in
//     // build payload 
//     let functioncall_contract = nftminter_address in
//     let functioncall_name = "%mint_gated" in
//     let functioncall_params: NFTMINTER.NftMinter.mint = {
//       owner=owner3;
//       token_id=6n
//     } in
//     let functioncall_contract_bytes : bytes = Bytes.pack functioncall_contract in
//     let functioncall_name_bytes : bytes = Bytes.pack functioncall_name in
//     let functioncall_params_bytes : bytes = Bytes.pack functioncall_params in
//     let nonce_bytes : bytes = Bytes.pack nonce in 
//     let exp_date_bytes : bytes = Bytes.pack exp_date in 
//     let key_bytes : bytes = Bytes.pack my_key in
//     let data : bytes = Bytes.concat key_bytes (Bytes.concat nonce_bytes (Bytes.concat exp_date_bytes (Bytes.concat functioncall_contract_bytes (Bytes.concat functioncall_name_bytes functioncall_params_bytes)))) in
//     let data_hash = Crypto.keccak data in
//     // DEBUG - uncomment to retrieve the payload that need to be signed
//     let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
//     let () = Test.Next.IO.log("functioncall_contract_bytes=", functioncall_contract_bytes) in
//     let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
//     let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
//     let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
//     let () = Test.Next.IO.log("exp_date_bytes=", exp_date_bytes) in
//     let () = Test.Next.IO.log("data=", data) in
//     let () = Test.Next.IO.log("data_hash=", data_hash) in
//     let p = {
//         msgData = (data_hash, nonce, exp_date, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
//         userAddress = owner3;
//     } in
//     // EXEC_GATED_CALLDATA entrypoint call 
//     let r = Test.transfer_to_contract nftminter_contract (Exec_gated_calldata p) 0tez in
//     let () = Test.Next.IO.log(r) in
//     let () = AssertHelper.tx_success r in
//     // VERIFY modified storage
//     let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
//     let () = Assert.assert (current_storage.extension.admin = owner3) in
//     let () = 
//         match Big_map.find_opt 6n current_storage.ledger with
//         | Some ownr6 -> Assert.assert (ownr6 = p.userAddress) 
//         | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
//     in
//     ()

