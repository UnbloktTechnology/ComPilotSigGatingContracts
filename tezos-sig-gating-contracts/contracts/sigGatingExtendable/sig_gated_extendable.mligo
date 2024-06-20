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

////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////////////////////////////////////
  let rec padding (bts: bytes) (current_size: nat) (expected_size: nat) : bytes = 
    if current_size = expected_size then
      bts
    else
      padding (Bytes.concat 0x00 bts) (current_size + 1n) expected_size

  let pad4 (seq: bytes) : bytes =
    let current_size = Bytes.length seq in
    let () = Assert.assert(current_size <= 4n) in
    padding seq current_size 4n
  
  let get_entrypoint_name (type a) (ep : a contract) : string =
    let pack_ep : bytes = Bytes.pack ep in
    let size = Bytes.length pack_ep in
    let () = Assert.assert(size > 28n) in
    let nb_to_read = abs(size - 28n) in 
    let name_bytes : bytes = Bytes.sub 28n nb_to_read pack_ep in      
    let nb_to_read_bytes = bytes nb_to_read in
    let nb_to_read_4bytes = pad4 nb_to_read_bytes in
    // Add prefix for string 
    let full_name_bytes = Bytes.concat 0x0501 (Bytes.concat nb_to_read_4bytes name_bytes) in      
    let name : string = match Bytes.unpack full_name_bytes with
    | None -> failwith "Error in get_entrypoint_name"
    | Some n -> n
    in 
    String.concat "%" name

  let is_implicit (elt : address) : bool =
    let pack_elt : bytes = Bytes.pack elt in
    let is_imp : bytes = Bytes.sub 6n 1n pack_elt in
    (is_imp = 0x00)
////////////////////////////////////////////////////////////////////////////////////////////

  let setSigner (type a) (newSigner: address) (s : a siggated_storage) : a ret =
    let _ = Assert.Error.assert (Tezos.get_sender() = s.admin) Errors.only_admin in
    let op = Tezos.emit "%setSigner" newSigner in
    [op], { s with signerAddress = newSigner }

  let getSigner (type a) (_p: unit) (s : a siggated_storage) : address = 
    s.signerAddress

  type txAuthDataWithContractAddress = {
    userAddress: address;   // user address (used to check nonce)
    expirationBlock: nat;  // expiration date
    contractAddress: address;  // calldata contract address
    functionName: string;   // name of the entrypoint of the calldata (for example "%mint")
    functionArgs: bytes;   // arguments for the entrypoint of the calldata 
    signerPublicKey: key;     // public key that signed the payload 
    signature: signature;   // signature of the payload signed by the given public key
  }

  let verifyTxAuthDataWithContractAddress (type a) (p: txAuthDataWithContractAddress)(s: a siggated_storage) : a siggated_storage = 
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

  let verifyAndDispatchTxAuthData (type a) (p: txAuthDataWithContractAddress)(s: a siggated_storage) : a ret = 
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


  type txAuthData = {
    userAddress: address;   // user address (used to check nonce)
    expirationBlock: nat;  // expiration date
    functionName: string;   // name of the entrypoint of the calldata (for example "%mint")
    functionArgs: bytes;   // arguments for the entrypoint of the calldata 
    signerPublicKey: key;     // public key that signed the payload 
    signature: signature;   // signature of the payload signed by the given public key
  }

  let verifyTxAuthData (type a) (p: txAuthData)(s: a siggated_storage) : a siggated_storage = 
    let { userAddress; expirationBlock=expiration; functionName=name; functionArgs=args; signerPublicKey=k; signature } = p in
    let contractAddress = Tezos.get_self_address () in
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

////////////////////////////////////////////////////////////////////////////////////////////////////////
// DISPATCH strategies
///////////////////////////////////////////////////////////////////////////////////////////////////////
  let process_internal_calldata (type a) (cd, ep: calldata * a contract) : operation =
    let (calldata_address, calldata_name, calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
      let name = get_entrypoint_name ep in
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

  let dispatch_calldata (type a) (cd: calldata) : operation =
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

  let process_internal_calldata_2 (type a b) (cd, ep_1, ep_2: calldata * a contract * b contract) : operation =
    let (calldata_address, calldata_name, calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
      let name_1 = get_entrypoint_name ep_1 in
      if calldata_name = name_1 then  
        match (Bytes.unpack calldata_args: a option) with
        | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_1
        | None -> failwith Errors.invalid_calldata_wrong_arguments
      else
        let name_2 = get_entrypoint_name ep_2 in
        if calldata_name = name_2 then  
          match (Bytes.unpack calldata_args: b option) with
          | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_2
          | None -> failwith Errors.invalid_calldata_wrong_arguments            
        else
          failwith Errors.invalid_calldata_wrong_name
    else
      failwith Errors.invalid_calldata_contract_not_dispatcher

  let process_internal_calldata_3 (type a b c) (cd, ep_1, ep_2, ep_3: calldata * a contract * b contract * c contract) : operation =
    let (calldata_address, calldata_name, calldata_args) = cd in
    if (Tezos.get_self_address() = calldata_address) then
      let name_1 = get_entrypoint_name ep_1 in
      if calldata_name = name_1 then  
        match (Bytes.unpack calldata_args: a option) with
        | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_1
        | None -> failwith Errors.invalid_calldata_wrong_arguments
      else
        let name_2 = get_entrypoint_name ep_2 in
        if calldata_name = name_2 then  
          match (Bytes.unpack calldata_args: b option) with
          | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_2
          | None -> failwith Errors.invalid_calldata_wrong_arguments            
        else
          let name_3 = get_entrypoint_name ep_3 in
          if calldata_name = name_3 then  
            match (Bytes.unpack calldata_args: c option) with
            | Some args_decoded -> Tezos.Next.Operation.transaction args_decoded 0mutez ep_3
            | None -> failwith Errors.invalid_calldata_wrong_arguments            
          else
            failwith Errors.invalid_calldata_wrong_name
    else
      failwith Errors.invalid_calldata_contract_not_dispatcher

// end
