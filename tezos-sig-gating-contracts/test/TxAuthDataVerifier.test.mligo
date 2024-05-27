#import "./helper/bootstrap.mligo" "Bootstrap"
#import "./helper/assert.mligo" "AssertHelper"
#import "../contracts/sigVerifiers/TxAuthDataVerifier.mligo" "TxAuthDataVerifier"


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
// HELPERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

let test_verifier_initial_storage =
    let (owner1, owner2, _owner3, _, _, _, _) = Bootstrap.boot_accounts() in

    // DEPLOY
    let initial_storage = { 
        owner = owner1;
        signerAddress = owner2;
        result = (None : bool option);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let {taddr = verifier_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of TxAuthDataVerifier.Verifier) initial_storage 0tez in
    let verifier_contract = Test.Next.Typed_address.to_contract verifier_taddr in
    let _verifier_address : address = Tezos.address verifier_contract in

    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage verifier_taddr in
    let () = Assert.assert (current_storage = initial_storage) in
    ()

let test_verifier_signature_verify =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in

    // DEPLOY
    let initial_storage = { 
        owner = owner1;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address); //owner2;
        result = (None : bool option);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let {taddr = verifier_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of TxAuthDataVerifier.Verifier) initial_storage 0tez in
    let verifier_contract = Test.Next.Typed_address.to_contract verifier_taddr in
    let _verifier_address : address = Tezos.address verifier_contract in

    // call VERIFY entrypoint 
    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let functioncall: bytes = 0x01020304 in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtbwuz1xp5h7TojQcT5QcoUhwEf2HMhnv1ixWjWHHQ7vv8HGdtMTKG3VUsDMeSvvxaEPudAoaHFsGpiQfabUUVzAosGFZDn" :
   signature) in
    let nonce_bytes : bytes = Bytes.pack nonce in 
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    let exp_date_bytes : bytes = Bytes.pack exp_date in 
    let key_bytes : bytes = Bytes.pack my_key in
    let data : bytes = Bytes.concat nonce_bytes (Bytes.concat exp_date_bytes (Bytes.concat key_bytes functioncall)) in
    // let () = Test.Next.IO.log("data=", data) in
    let data_hash = Crypto.keccak data in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall, my_key, my_sig);
        // msgData: bytes;
        userAddress = owner3; 
    } in
    let r = Test.transfer_to_contract verifier_contract (VerifyTxAuthData p) 0tez in
    let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in

    // VIEW
    // let r = Test.call_view "%verifyTxAuthData" p verifier_address in
    // let () = match r with
    // | None -> Test.Next.Michelson.failwith "ERROR: signature unknown status"
    // | Some status -> Test.Next.Assert.Assert.assert ()
    // in

    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage verifier_taddr in
    let () = match current_storage.result with
    | None -> Test.Next.Assert.failwith "ERROR: signature unknown status"
    | Some res -> Test.Next.Assert.assert (res)
    in 
    ()



let test_failure_verify_twice =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in

    // DEPLOY
    let initial_storage = { 
        owner = owner1;
        signerAddress = ("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address); //owner2;
        result = (None : bool option);
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let {taddr = verifier_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of TxAuthDataVerifier.Verifier) initial_storage 0tez in
    let verifier_contract = Test.Next.Typed_address.to_contract verifier_taddr in
    let _verifier_address : address = Tezos.address verifier_contract in

    // prepare VERIFY parameter 
    let () = Test.set_source owner1 in
    let nonce = 0n in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let functioncall: bytes = 0x01020304 in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtbwuz1xp5h7TojQcT5QcoUhwEf2HMhnv1ixWjWHHQ7vv8HGdtMTKG3VUsDMeSvvxaEPudAoaHFsGpiQfabUUVzAosGFZDn" :
   signature) in
    let nonce_bytes : bytes = Bytes.pack nonce in 
    let exp_date_bytes : bytes = Bytes.pack exp_date in 
    let key_bytes : bytes = Bytes.pack my_key in
    let data : bytes = Bytes.concat nonce_bytes (Bytes.concat exp_date_bytes (Bytes.concat key_bytes functioncall)) in
    let data_hash = Crypto.keccak data in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    let p = {
        msgData = (data_hash, nonce, exp_date, functioncall, my_key, my_sig);
        // msgData: bytes;
        userAddress = owner3; 
    } in
    // call VERIFY entrypoint 
    let r = Test.transfer_to_contract verifier_contract (VerifyTxAuthData p) 0tez in
    let () = AssertHelper.tx_success r in
    // call VERIFY entrypoint again ... should fail
    let r = Test.transfer_to_contract verifier_contract (VerifyTxAuthData p) 0tez in
    let () = AssertHelper.string_failure r TxAuthDataVerifier.Verifier.Errors.invalid_nonce in

    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage verifier_taddr in
    let () = match current_storage.result with
    | None -> Test.Next.Assert.failwith "ERROR: signature unknown status"
    | Some res -> Test.Next.Assert.assert (res)
    in 
    let () = match Big_map.find_opt initial_storage.signerAddress current_storage.nonces with
    | None -> Test.Next.Assert.failwith "ERROR: nonce should exist if firt Verify succeeded"
    | Some nse -> Test.Next.Assert.assert (nse = 1n)
    in 

    ()

