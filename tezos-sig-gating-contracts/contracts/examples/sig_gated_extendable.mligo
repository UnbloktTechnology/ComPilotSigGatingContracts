// module SigGatedExtendable = struct
  type calldata = address * string * bytes

  type 'a siggated_storage = {
    admin: address; // CHANGE_SIGNER ROLE
    signerAddress: address;
    nonces: (address, nat) big_map;
    siggated_extension: 'a;
  }
  type 'a ret = operation list * 'a siggated_storage

  module Errors = struct
      let only_admin = "OnlyAdmin"
      let block_expired = "BlockExpired"
      let invalid_signature = "InvalidSignature"
      let unmatch_expiration_date = "UnmatchExpirationDate"
      let invalid_nonce = "InvalidNonce"
      let parameter_missmatch = "HashMissmatchParameters"
      let invalid_calldata_wrong_name = "UnknownEntrypoint"
      let invalid_calldata_wrong_arguments = "InvalidEntrypointArguments"
      let invalid_calldata_contract_not_dispatcher = "MissingDispatchEntrypoint"
      let not_expected_signer = "KeyMissmatchSignerAddress"
      let missing_isvalidsignature_view = "MissingIsValidSignatureView"
      let invalid_chain = "InvalidChainId"
      let do_not_process_calldata = "DoNotProcessCalldata"
  end

  let is_implicit (elt : address) : bool =
    let pack_elt : bytes = Bytes.pack elt in
    let is_imp : bytes = Bytes.sub 6n 1n pack_elt in
    (is_imp = 0x00)

  let setSigner (type a) (newSigner: address) (s : a siggated_storage) : a ret =
    let _ = Assert.Error.assert (Tezos.get_sender() = s.admin) Errors.only_admin in
    let op = Tezos.emit "%setSigner" newSigner in
    [op], { s with signerAddress = newSigner }

  let getSigner (type a) (_p: unit) (s : a siggated_storage) : address = 
    s.signerAddress

  type txAuthData = {
    // payload: bytes;   // hash of the following fields (except signature)
    // chain_id: chain_id;   // chain_id
    userAddress: address;   // user address (used to check nonce)
    // nonce: nat;   // nonce of the userAddress when forging the signature
    expirationBlock: nat;  // expiration date
    contractAddress: address;  // calldata contract address
    functionName: string;   // name of the entrypoint of the calldata (for example "%mint")
    functionArgs: bytes;   // arguments for the entrypoint of the calldata 
    signerPublicKey: key;     // public key that signed the payload 
    signature: signature;   // signature of the payload signed by the given public key
  }

  let verifyTxAuthData (type a) (p: txAuthData)(s: a siggated_storage) : a siggated_storage = 
    let { userAddress; expirationBlock=expiration; contractAddress; functionName=name; functionArgs=args; signerPublicKey=k; signature } = p in
    let chain_id = Tezos.get_chain_id() in
    let nonce, new_nonces = match Big_map.find_opt userAddress s.nonces with
    | None -> (0n, Big_map.update userAddress (Some(1n)) s.nonces)
    | Some nse -> (nse, Big_map.update userAddress (Some(nse + 1n)) s.nonces)
    in
    // VERIFY parameters correspond to payload hash
    let chainid_b = Bytes.pack chain_id in
    let user_b = Bytes.pack userAddress in
    let nonce_b = Bytes.pack nonce in
    let expiration_b = Bytes.pack expiration in
    let key_b = Bytes.pack k in
    let contract_b = Bytes.pack contractAddress in
    let name_b = Bytes.pack name in
    let expected_bytes = Bytes.concat key_b (Bytes.concat chainid_b (Bytes.concat user_b (Bytes.concat nonce_b (Bytes.concat expiration_b (Bytes.concat contract_b (Bytes.concat name_b args)))))) in
    let payload = Crypto.keccak(expected_bytes) in
    // let () = Assert.Error.assert (expected_payload = payload) Errors.parameter_missmatch in
    // Retrieve signer address from public key
    let kh : key_hash = Crypto.hash_key k in
    let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
    // NONCE
    // let () = Assert.Error.assert (nonce = current_nonce) Errors.invalid_nonce in
    // EXPIRATION
    let _ = Assert.Error.assert (Tezos.get_level() < expiration) Errors.block_expired in
    // CHAIN ID
    // let _ = Assert.Error.assert (Tezos.get_chain_id() = chain_id) Errors.invalid_chain in
    // VERIFY signer key corresponds to signerAddress 
    let () = if (not is_implicit(s.signerAddress)) then // case signerAddress is a smart contract
        //calls isValidSignature of the smart contract             
        let r = Tezos.call_view "isValidSignature" (k, payload, signature) s.signerAddress in
        match r with
        | None -> failwith Errors.missing_isvalidsignature_view
        | Some status -> Assert.assert (status)
    else   // case signerAddress is a implicit account
        Assert.Error.assert (signer_address_from_key = s.signerAddress) Errors.not_expected_signer
    in
    // VERIFY SIGNATURE
    let is_valid = Crypto.check k signature payload in 
    let _ = Assert.Error.assert (is_valid) Errors.invalid_signature in
    { s with nonces=new_nonces }

  let verifyAndDispatchTxAuthData (type a) (p: txAuthData)(s: a siggated_storage) : a ret = 
    let { userAddress; expirationBlock=expiration; contractAddress; functionName=name; functionArgs=args; signerPublicKey=k; signature } = p in
    let chain_id = Tezos.get_chain_id() in
    let nonce, new_nonces = match Big_map.find_opt userAddress s.nonces with
    | None -> (0n, Big_map.update userAddress (Some(1n)) s.nonces)
    | Some nse -> (nse, Big_map.update userAddress (Some(nse + 1n)) s.nonces)
    in
    // VERIFY parameters correspond to payload hash
    let chainid_b = Bytes.pack chain_id in
    let user_b = Bytes.pack userAddress in
    let nonce_b = Bytes.pack nonce in
    let expiration_b = Bytes.pack expiration in
    let key_b = Bytes.pack k in
    let contract_b = Bytes.pack contractAddress in
    let name_b = Bytes.pack name in
    let expected_bytes = Bytes.concat key_b (Bytes.concat chainid_b (Bytes.concat user_b (Bytes.concat nonce_b (Bytes.concat expiration_b (Bytes.concat contract_b (Bytes.concat name_b args)))))) in
    let payload = Crypto.keccak(expected_bytes) in
    // let () = Assert.Error.assert (expected_payload = payload) Errors.parameter_missmatch in
    // Retrieve signer address from public key
    let kh : key_hash = Crypto.hash_key k in
    let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
    // NONCE
    // let () = Assert.Error.assert (nonce = current_nonce) Errors.invalid_nonce in
    // EXPIRATION
    let _ = Assert.Error.assert (Tezos.get_level() < expiration) Errors.block_expired in
    // CHAIN ID
    // let _ = Assert.Error.assert (Tezos.get_chain_id() = chain_id) Errors.invalid_chain in
    // VERIFY signer key corresponds to signerAddress 
    let () = if (not is_implicit(s.signerAddress)) then // case signerAddress is a smart contract
        //calls isValidSignature of the smart contract             
        let r = Tezos.call_view "isValidSignature" (k, payload, signature) s.signerAddress in
        match r with
        | None -> failwith Errors.missing_isvalidsignature_view
        | Some status -> Assert.assert (status)
    else   // case signerAddress is a implicit account
        Assert.Error.assert (signer_address_from_key = s.signerAddress) Errors.not_expected_signer
    in
    // VERIFY SIGNATURE
    let is_valid = Crypto.check k signature payload in 
    let _ = Assert.Error.assert (is_valid) Errors.invalid_signature in
    // DISPATCH CALLDATA
    let internal_dispatch_opt : calldata contract option = Tezos.get_entrypoint_opt "%dispatch" (Tezos.get_self_address ()) in
    let op : operation  = match internal_dispatch_opt with
    | Some ep -> Tezos.Next.Operation.transaction (contractAddress, name, args) 0mutez ep
    | None -> failwith Errors.invalid_calldata_contract_not_dispatcher
    in
    [op], { s with nonces=new_nonces }

////////////////////////////////////////////////////////////////////////////////////////////////////////
// DISPATCH strategies
///////////////////////////////////////////////////////////////////////////////////////////////////////
  let process_internal_calldata (type a) (cd, name, ep: calldata * string * a contract) : operation =
    let (calldata_address, calldata_name, calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
      if name = calldata_name then  
        let args_decoded: a = match (Bytes.unpack calldata_args: a option) with
        | Some data -> data
        | None -> failwith Errors.invalid_calldata_wrong_arguments
        in 
        // USELESS double checking arguments
        let () = Assert.assert (Bytes.pack args_decoded = calldata_args) in 
        Tezos.Next.Operation.transaction args_decoded 0mutez ep
      else
        failwith Errors.invalid_calldata_wrong_name
    else
      failwith Errors.invalid_calldata_contract_not_dispatcher

  let dispatch_calldata (type a) (cd, _name, _ep: calldata * string * a contract) : operation =
    let (calldata_address, _calldata_name, _calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
        failwith Errors.do_not_process_calldata
    else
      let external_dispatch_opt : calldata contract option = Tezos.get_entrypoint_opt "%dispatch" calldata_address in
      let op : operation  = match external_dispatch_opt with
      | Some ep_dispatch -> Tezos.Next.Operation.transaction cd 0mutez ep_dispatch
      | None -> failwith Errors.invalid_calldata_contract_not_dispatcher
      in
      op

  let process_internal_calldata_2 (type a b) 
        (cd: calldata)
        (name_1, ep_1: string * a contract) 
        (name_2, ep_2: string * b contract) : operation =
    let (calldata_address, calldata_name, calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
      if calldata_name = name_1 then  
        match (Bytes.unpack calldata_args: a option) with
        | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_1
        | None -> failwith Errors.invalid_calldata_wrong_arguments
      else
        if calldata_name = name_2 then  
          match (Bytes.unpack calldata_args: b option) with
          | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_2
          | None -> failwith Errors.invalid_calldata_wrong_arguments            
        else
          failwith Errors.invalid_calldata_wrong_name
    else
      failwith Errors.invalid_calldata_contract_not_dispatcher

  let process_internal_calldata_3 (type a b c) 
        (cd: calldata)
        (name_1, ep_1: string * a contract)
        (name_2, ep_2: string * b contract) 
        (name_3, ep_3: string * c contract) : operation =
    let (calldata_address, calldata_name, calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
      if calldata_name = name_1 then  
        match (Bytes.unpack calldata_args: a option) with
        | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_1
        | None -> failwith Errors.invalid_calldata_wrong_arguments
      else
        if calldata_name = name_2 then  
          match (Bytes.unpack calldata_args: b option) with
          | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_2
          | None -> failwith Errors.invalid_calldata_wrong_arguments            
        else
          if calldata_name = name_3 then  
            match (Bytes.unpack calldata_args: c option) with
            | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_3
            | None -> failwith Errors.invalid_calldata_wrong_arguments            
          else
            failwith Errors.invalid_calldata_wrong_name
    else
      failwith Errors.invalid_calldata_contract_not_dispatcher

// end
