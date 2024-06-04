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

type 'a raw_payload = {
  public_key: key;
  user: address;
  nonce: nat;
  expiration: timestamp;
  functioncall_contract: address;
  functioncall_name: string;
  functioncall_params: 'a;
}
let compute_hash (type a) (data : a raw_payload) : bytes * bytes = 
    let key_bytes : bytes = Bytes.pack data.public_key in
    let user_bytes : bytes = Bytes.pack data.user in
    let nonce_bytes : bytes = Bytes.pack data.nonce in 
    let exp_date_bytes : bytes = Bytes.pack data.expiration in 
    let functioncall_contract_bytes : bytes = Bytes.pack data.functioncall_contract in
    let functioncall_name_bytes : bytes = Bytes.pack data.functioncall_name in
    let functioncall_params_bytes : bytes = Bytes.pack data.functioncall_params in
    let data : bytes = Bytes.concat key_bytes (Bytes.concat user_bytes (Bytes.concat nonce_bytes (Bytes.concat exp_date_bytes (Bytes.concat functioncall_contract_bytes (Bytes.concat functioncall_name_bytes functioncall_params_bytes))))) in
    let data_hash = Crypto.keccak data in    
    // DEBUG - uncomment to retrieve the payload that need to be signed
    // let () = Test.Next.IO.log("functioncall_contract_bytes=", functioncall_contract_bytes) in
    // let () = Test.Next.IO.log("functioncall_name_bytes=", functioncall_name_bytes) in
    // let () = Test.Next.IO.log("functioncall_params_bytes=", functioncall_params_bytes) in
    // let () = Test.Next.IO.log("nonce_bytes=", nonce_bytes) in
    // let () = Test.Next.IO.log("data=", data) in
    // let () = Test.Next.IO.log("data_hash=", data_hash) in
    data_hash, functioncall_params_bytes

let sign_hash (data_hash : bytes) : signature = 
  Test.Next.Crypto.sign "edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU" data_hash


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
    
    let inputs: NFTMINTER.NftMinter.mint raw_payload = {
      public_key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key);
      user = owner3;
      nonce = 0n;
      expiration = ("2025-01-01T00:00:00.00Z" : timestamp);
      functioncall_contract = nftminter_address;
      functioncall_name = "%mint_offchain";
      functioncall_params = ({
        owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
        token_id=6n
      }: NFTMINTER.NftMinter.mint)
    } in
    let data_hash, functioncall_params_bytes = compute_hash inputs in 
    // let my_sig : signature = ("edsigtcjNvuDj6sfUL9u3Ma4Up3zfiZiPM2gzwDC3Vk1324SJzaGTbVwtdmdJ5q9UbD9qnKm9jdzytFqjSSt54oLY61XuB2mSW5" : signature) in
    let my_sig : signature = sign_hash data_hash in

    // DEBUG - uncomment to retrieve the payload that need to be signed
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("nftminter_address=", owner3) in

    let p: NFTMINTER.NftMinter.txAuthData = {
      payload = data_hash;   // hash of the following fields (except signature)
      userAddress = inputs.user;   // user address (used to check nonce)
      nonce = inputs.nonce;   // nonce of the userAddress when forging the signature
      expiration = inputs.expiration;  // expiration date
      contractAddress = inputs.functioncall_contract;  // calldata contract address
      name = inputs.functioncall_name;   // name of the entrypoint of the calldata (for example "%mint")
      args = functioncall_params_bytes;   // arguments for the entrypoint of the calldata 
      publicKey = inputs.public_key;     // public key that signed the payload 
      signature = my_sig;   // signature of the payload signed by the given public key
    } in
    // EXEC_OFFCHAIN entrypoint call 
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract nftminter_contract (Exec_offchain p) 0tez in
    // let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in
    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.extension.admin = owner3) in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | Some ownr6 -> Assert.assert (ownr6 = inputs.functioncall_params.owner) 
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
    let inputs: NFTMINTER.NftMinter.mint raw_payload = {
      public_key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key);
      user = owner3;
      nonce = 0n;
      expiration = ("2025-01-01T00:00:00.00Z" : timestamp);
      functioncall_contract = nftminter_address;
      functioncall_name = "%mint_offchain";
      functioncall_params = ({
        owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
        token_id=7n
      }: NFTMINTER.NftMinter.mint)
    } in
    let data_hash, functioncall_params_bytes = compute_hash inputs in 
    let my_sig : signature = ("edsigtcjNvuDj6sfUL9u3Ma4Up3zfiZiPM2gzwDC3Vk1324SJzaGTbVwtdmdJ5q9UbD9qnKm9jdzytFqjSSt54oLY61XuB2mSW5" : signature) in
    // let my_sig : signature = sign_hash data_hash in


    // DEBUG - uncomment to retrieve the payload that need to be signed
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("nftminter_address=", owner3) in

    let p: NFTMINTER.NftMinter.txAuthData = {
      payload = data_hash;   // hash of the following fields (except signature)
      userAddress = inputs.user;   // user address (used to check nonce)
      nonce = inputs.nonce;   // nonce of the userAddress when forging the signature
      expiration = inputs.expiration;  // expiration date
      contractAddress = inputs.functioncall_contract;  // calldata contract address
      name = inputs.functioncall_name;   // name of the entrypoint of the calldata (for example "%mint")
      args = functioncall_params_bytes;   // arguments for the entrypoint of the calldata 
      publicKey = inputs.public_key;     // public key that signed the payload 
      signature = my_sig;   // signature of the payload signed by the given public key
    } in

    // EXEC_OFFCHAIN entrypoint call should fail (in calldata token_id=7n but signature expects token_id=6n)
    let () = Test.set_source owner1 in
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
    let inputs: NFTMINTER.NftMinter.mint raw_payload = {
      public_key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key);
      user = owner3;
      nonce = 0n;
      expiration = ("2025-01-01T00:00:00.00Z" : timestamp);
      functioncall_contract = nftminter_address;
      functioncall_name = "%foobar";
      functioncall_params = ({
        owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
        token_id=6n
      }: NFTMINTER.NftMinter.mint)
    } in
    let data_hash, functioncall_params_bytes = compute_hash inputs in
    // let my_sig : signature = ("edsigttGP3HkT983SuVgv6GqdYSpuWtkmdhxYazshPfkweXtfXfnzJT2Ku3QGgHQ32iG6UcuRzwAAKXt6w3Exm16WyXvj9EzdrD" : signature) in
    let my_sig : signature = sign_hash data_hash in



    // DEBUG - uncomment to retrieve the payload that need to be signed
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("nftminter_address=", owner3) in

    let p: NFTMINTER.NftMinter.txAuthData = {
      payload = data_hash;   // hash of the following fields (except signature)
      userAddress = inputs.user;   // user address (used to check nonce)
      nonce = inputs.nonce;   // nonce of the userAddress when forging the signature
      expiration = inputs.expiration;  // expiration date
      contractAddress = inputs.functioncall_contract;  // calldata contract address
      name = inputs.functioncall_name;   // name of the entrypoint of the calldata (for example "%mint")
      args = functioncall_params_bytes;   // arguments for the entrypoint of the calldata 
      publicKey = inputs.public_key;     // public key that signed the payload 
      signature = my_sig;   // signature of the payload signed by the given public key
    } in

    // EXEC_OFFCHAIN entrypoint call should fail (in calldata token_id=7n but signature expects token_id=6n)
    let () = Test.set_source owner1 in
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
    let inputs: NFTMINTER.NftMinter.mint raw_payload = {
      public_key = ("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key);
      user = owner3;
      nonce = 0n;
      expiration = ("2025-01-01T00:00:00.00Z" : timestamp);
      functioncall_contract = nftminter_address;
      functioncall_name = "%mint_offchain";
      functioncall_params = ({
        owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
        token_id=6n
      }: NFTMINTER.NftMinter.mint)
    } in
    let data_hash, functioncall_params_bytes = compute_hash inputs in
    let my_sig : signature = ("edsigtcjNvuDj6sfUL9u3Ma4Up3zfiZiPM2gzwDC3Vk1324SJzaGTbVwtdmdJ5q9UbD9qnKm9jdzytFqjSSt54oLY61XuB2mSW5" : signature) in
    // let my_sig : signature = sign_hash data_hash in

    // DEBUG - uncomment to retrieve the payload that need to be signed
    // let () = Test.Next.IO.log("nftminter_address=", nftminter_address) in
    // let () = Test.Next.IO.log("nftminter_address=", owner3) in

    let p: NFTMINTER.NftMinter.txAuthData = {
      payload = data_hash;   // hash of the following fields (except signature)
      userAddress = inputs.user;   // user address (used to check nonce)
      nonce = inputs.nonce;   // nonce of the userAddress when forging the signature
      expiration = inputs.expiration;  // expiration date
      contractAddress = inputs.functioncall_contract;  // calldata contract address
      name = inputs.functioncall_name;   // name of the entrypoint of the calldata (for example "%mint")
      args = functioncall_params_bytes;   // arguments for the entrypoint of the calldata 
      publicKey = inputs.public_key;     // public key that signed the payload 
      signature = my_sig;   // signature of the payload signed by the given public key
    } in
    // EXEC_OFFCHAIN entrypoint call should fail (in calldata token_id=7n but signature expects token_id=6n)
    let () = Test.set_source owner1 in
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
        | Some ownr6 -> Assert.assert (ownr6 = inputs.functioncall_params.owner) 
        | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
    in
    ()