#import "./helper/nftminter.mligo" "NftMinterHelper"
#import "./helper/assert.mligo" "AssertHelper"
#import "./helper/bootstrap.mligo" "Bootstrap"
#import "../contracts/examples/nftminter.mligo" "NFTMINTER"

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////
module Utils = struct
    let rec zipWith (type a b c) (lst_a : a list) (lst_b : b list) (f: (a * b) -> c) : c list =
      match lst_a, lst_b with
      | [], _ -> []
      | _, [] -> []
      | x::xs, y::ys -> (f (x, y)) :: zipWith xs ys f

    [@inline]
    let reverse (type a) (lst : a list) : a list =
      let rec rev (type b) ((lst1, res) : b list * b list) : b list =
        match lst1 with
        | [] -> res
        | hd :: tl -> rev (tl, (hd :: res))
      in
      rev (lst, ([] : a list))
end

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let test_nftminter_initial_storage =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let _nftminter_address : address = Tezos.address nftminter_contract in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    ()

let test_nftminter_set_signer =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let _nftminter_address : address = Tezos.address nftminter_contract in
    // SETSIGNER
    let () = Test.set_source owner3 in
    let r = Test.transfer_to_contract nftminter_contract (SetSigner owner2) 0tez in
    let () = AssertHelper.tx_success r in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = Assert.assert (current_storage.extension.signerAddress = owner2) in
    ()

let test_nftminter_failure_set_signer_not_admin =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let _nftminter_address : address = Tezos.address nftminter_contract in
    // SETSIGNER
    let () = Test.set_source owner4 in
    let r = Test.transfer_to_contract nftminter_contract (SetSigner owner2) 0tez in
    let () = AssertHelper.string_failure r NFTMINTER.NftMinter.Errors.only_owner in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = Assert.assert (current_storage.extension.signerAddress = nft_extension_initial.signerAddress) in
    ()


let test_nftminter_mint_offchain =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY NFTMINTER
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in

    // PREPARE parameter for EXEC_OFFCHAIN call 
    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtrgtCw6NiCYhrvCRTFJyKVnhxem32rBcTiNpKrJYXFR3pDhYMh9GHPU14F21E4eKSHhMF5nuVAQrhr3WxpgSAL6y84FtSh" :
   signature) in
    // build payload 
    let functioncall_contract = nftminter_address in
    let functioncall_name = "%mint_offchain" in
    let functioncall_params: NFTMINTER.NftMinter.mint = {
      owner=owner3;
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
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    // let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    // let () = Test.Next.IO.log("data=", data) in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
        userAddress = owner3;
    } in
    // EXEC_OFFCHAIN entrypoint call 
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

  let test_nftminter_mint_offchain_failure_wrong_calldata_param =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY NFTMINTER
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in

    // PREPARE parameter for EXEC_OFFCHAIN call 
    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigu3jvjcCdYD1mLPm9dxy8eRJJryMNZamNMLe62mPHGTbRY1RNbgXZP1Fz5vGbTAMXY783Bmpu78jKrXfsx7sFsyet2CCLRp" :
   signature) in
    // build payload 
    let functioncall_contract = nftminter_address in
    let functioncall_name = "%mint_offchain" in
    let functioncall_params: NFTMINTER.NftMinter.mint = {
      owner=owner3;
      token_id=7n
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
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    // let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    // let () = Test.Next.IO.log("data=", data) in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
        userAddress = owner3;
    } in
    // EXEC_OFFCHAIN entrypoint call should fail (in calldata token_id=7n but signature expects token_id=6n)
    let r = Test.transfer_to_contract nftminter_contract (Exec_offchain p) 0tez in
    let () = AssertHelper.string_failure r NFTMINTER.NftMinter.Errors.invalid_signature in
    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | None -> () 
        | Some ownr6 -> Test.Next.Assert.failwith "Token 6 should not be owned"
    in
    ()

  
  let test_nftminter_mint_offchain_failure_unknown_calldata_name =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY NFTMINTER
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in

    // PREPARE parameter for EXEC_OFFCHAIN call 
    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtikjimSyrCvZLWbhsf39ezpQyj6yAZkkdZgKGCbtbaxdkHZhbYbSCZeX5jNtAPFCDkFkcTYhEKRhsVLAdmoYFid88LbKu5" :
   signature) in
    // build payload 
    let functioncall_contract = nftminter_address in
    let functioncall_name = "%foobar" in
    let functioncall_params: NFTMINTER.NftMinter.mint = {
      owner=owner3;
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
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    // let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    // let () = Test.Next.IO.log("data=", data) in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
        userAddress = owner3;
    } in
    // EXEC_OFFCHAIN entrypoint call should fail (in calldata token_id=7n but signature expects token_id=6n)
    let r = Test.transfer_to_contract nftminter_contract (Exec_offchain p) 0tez in
    let () = AssertHelper.string_failure r NFTMINTER.NftMinter.Errors.invalid_calldata_wrong_name in
    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | None -> () 
        | Some ownr6 -> Test.Next.Assert.failwith "Token 6 should not be owned"
    in
    ()


  let test_nftminter_mint_offchain_failure_replay_attack =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY NFTMINTER
    let nft_extension_initial = { 
        admin = owner3;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let orig_nftminter = NftMinterHelper.boot_nftminter(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in

    // PREPARE parameter for EXEC_OFFCHAIN call 
    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtrgtCw6NiCYhrvCRTFJyKVnhxem32rBcTiNpKrJYXFR3pDhYMh9GHPU14F21E4eKSHhMF5nuVAQrhr3WxpgSAL6y84FtSh" :
   signature) in
    // build payload 
    let functioncall_contract = nftminter_address in
    let functioncall_name = "%mint_offchain" in
    let functioncall_params: NFTMINTER.NftMinter.mint = {
      owner=owner3;
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
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    // let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    // let () = Test.Next.IO.log("data=", data) in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall_contract, functioncall_name, functioncall_params_bytes, my_key, my_sig);
        userAddress = owner3;
    } in
    // EXEC_OFFCHAIN entrypoint call should fail (in calldata token_id=7n but signature expects token_id=6n)
    let r = Test.transfer_to_contract nftminter_contract (Exec_offchain p) 0tez in
    let () = AssertHelper.tx_success r in
    // call VERIFY entrypoint again ... should fail
    let r = Test.transfer_to_contract nftminter_contract (Exec_offchain p) 0tez in
    let () = AssertHelper.string_failure r NFTMINTER.NftMinter.Errors.invalid_nonce in

    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | Some ownr6 -> Assert.assert (ownr6 = p.userAddress) 
        | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
    in
    ()