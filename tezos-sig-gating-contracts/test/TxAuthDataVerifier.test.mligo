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
    let verifier_address : address = Tezos.address verifier_contract in


    // call VERIFY entrypoint 
    let () = Test.set_source owner1 in
    let my_key : key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key) in
    let my_sig : signature = ("edsigtcEZTmqQ2KVGCJXCvJxGJ1fGNFMJge5gfdTEYNyYyNo2jki6gFJCMKSL4azsPEdh6ueLLzp2eAes5kGkYaehsXbhK53Coz" :
   signature) in
   let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
   let data : bytes = 0x01020304 in
    let p = {
        msgData = (data, exp_date,  my_key, my_sig);
        // msgData: bytes;
        userAddress = owner3; 
    } in
    // VIEW
    // let r = Test.call_view "%verifyTxAuthData" p verifier_address in
    // let () = match r with
    // | None -> Test.Next.Michelson.failwith "ERROR: signature unknown status"
    // | Some status -> Test.Next.Assert.Assert.assert ()
    // in
    // ENTRYPOINT
    let r = Test.transfer_to_contract verifier_contract (VerifyTxAuthData p) 0tez in
    let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in

    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage verifier_taddr in
    let () = match current_storage.result with
    | None -> Test.Next.Assert.failwith "ERROR: signature unknown status"
    | Some res -> Test.Next.Assert.assert (res)
    in 
    ()


// let test_exo_8_solution_fire =
//   let (owner1, owner2, _owner3, _, _, _, _) = Bootstrap.boot_accounts() in
//   // DEPLOY CachedSinus
//   let initial_storage = { 
//     cached = Big_map.literal([
//       (TrigoFloat.pi_half, TrigoFloat.one)
//       // (TrigoFloat.zero, TrigoFloat.zero)
//     ])  
//   } in
//   let {addr = cached_sinus_taddr; code = _ ; size = _} = Test.originate (contract_of CachedSinus) initial_storage 0tez in
//   let cached_sinus_contract = Test.to_contract cached_sinus_taddr in
//   let cached_sinus_address : address = Tezos.address cached_sinus_contract in

//   // DEPLOY Balistic
//   let initial_storage_balistic = { 
//     cached_sinus = cached_sinus_address;
//     requests = (Big_map.empty : (address, Balistic.fire_param) big_map);
//     results = (Big_map.empty : (address, float) big_map);
//     requests_multiple = (Big_map.empty : (address, Balistic.fire_param list) big_map);
//     results_multiple = (Big_map.empty : (address, float list) big_map)
//   } in
//   let {addr = balistic_taddr; code = _ ; size = _} = Test.originate (contract_of Balistic) initial_storage_balistic 0tez in
//   let balistic_contract = Test.to_contract balistic_taddr in
//   let _balistic_address : address = Tezos.address balistic_contract in

//   // FIRE pre-computed value (sin(22.5°))
//   let () = Test.set_source owner1 in 
//   let angle = Float.div TrigoFloat.pi_quarter (Float.new 2 0) in 
//   let p = { power = Float.new 10 0; angle } in
//   let r = Test.transfer_to_contract_exn balistic_contract (Fire p) 0tez in
//   let () = Test.log("Cost of first Fire") in
//   let () = Test.log(r) in

//   // VERIFY Balistic distance 
//   let current_storage = Test.get_storage balistic_taddr in
//   let value = match Big_map.find_opt owner1 current_storage.results with
//   | Some v -> v
//   | None -> failwith("no value returned")
//   in
//   // SET PRECISION => error_threshold represent 0.0000000001
//   // let error_threshold = (Float.inverse (Float.new 1 10)) in
//   let error_threshold = Float.new 1 (-10) in
//   let expected = Float.new 72153753182 (-10) in
//   let diff = Float.sub value expected in
//   // let () = Test.log(diff) in
//   // let error = Float.resolve diff 11n in
//   // let () = Test.log(error) in
//   let () = assert (Float.lt diff error_threshold) in
//   // VERIFY that sin(PI/4) is stored in cache (in contract CachedSinus) .. actually it is the double of the given angle
//   let sinus_storage = Test.get_storage cached_sinus_taddr in
//   let cached_angle = Float.mul angle (Float.new 2 0) in 
//   let _sin_pi_eigth = match Big_map.find_opt cached_angle sinus_storage.cached with
//   | Some v -> v
//   | None -> failwith("not in cache")
//   in
//   // FIRE (again) pre-computed value (sin(22.5°))
//   let () = Test.set_source owner2 in 
//   let r = Test.transfer_to_contract_exn balistic_contract (Fire p) 0tez in
//   let () = Test.log("Cost of second Fire") in
//   let () = Test.log(r) in
//   ()

