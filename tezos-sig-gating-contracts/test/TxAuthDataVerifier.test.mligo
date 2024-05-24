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
        result = (None : bool option)
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
        signerAddress = owner2;
        result = (None : bool option)
    } in
    let {taddr = verifier_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of TxAuthDataVerifier.Verifier) initial_storage 0tez in
    let verifier_contract = Test.Next.Typed_address.to_contract verifier_taddr in
    let _verifier_address : address = Tezos.address verifier_contract in


    // call VERIFY entrypoint 
    let () = Test.set_source owner1 in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtampb8YY3UkdAokz4KG6VUDHwEYxT88uStfJ7odA71xbPZUioeNJtzBcRSJh9zRE3rjyspVrsWk7P4Wkogj4TgeQ7kQpgd" :
   signature) in
    let exp_date_bytes : bytes = Bytes.pack exp_date in 
    let key_bytes : bytes = Bytes.pack my_key in
    let data : bytes = Bytes.concat exp_date_bytes (Bytes.concat key_bytes 0x01020304) in
    let p = {
        msgData = (data, exp_date, my_key, my_sig);
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
