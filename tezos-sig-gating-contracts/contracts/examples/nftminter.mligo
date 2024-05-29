// #import "@ligo/fa/lib/main.mligo" "FA2"
#import "../../.ligo/source/i/ligo__s__fa__1.4.2__ffffffff/lib/main.mligo" "FA2"

module NftMinter = struct
  module NFT = FA2.NFTExtendable

  type extension = {
      admin: address;
      signerAddress: address; 
      nonces: (address, nat) big_map 
  }

  type storage = extension NFT.storage
  type ret = operation list * storage

  (* Extension *)
  module Errors = struct
      let only_owner = "OnlyOwner"
      let block_expired = "BlockExpired"
      let invalid_signature = "InvalidSignature"
      let unmatch_expiration_date = "UnmatchExpirationDate"
      let invalid_nonce = "InvalidNonce"
      let parameter_missmatch = "hash of given parameters (nonce, expiration, key, functioncall) does not match the payload hash"
      let invalid_calldata_wrong_name = "[dispatch] entrypoint not found"
      let invalid_calldata_wrong_arguments = "[dispatch] Cannot unpack calldata arguments into the expected type"
      let invalid_calldata_contract_not_dispatcher = "[dispatch] calldata should point to a contract with a dispatch entrypoint"
      let not_expected_signer = "missmatch between key and signerAddress"
      let missing_isvalidsignature_view = "The signerAddress contract should have a isValidSignature view"
  end

  let is_implicit (elt : address) : bool =
      let pack_elt : bytes = Bytes.pack elt in
      let is_imp : bytes = Bytes.sub 6n 1n pack_elt in
      (is_imp = 0x00)

  [@entry]
  let setSigner(newSigner: address) (s: storage) : ret =
      let _ = Assert.Error.assert (Tezos.get_sender() = s.extension.admin) Errors.only_owner in
      let op = Tezos.emit "%setSigner" newSigner in
      [op], { s with extension = { s.extension with signerAddress = newSigner } }

  [@view]
  let txAuthDataSignerAddress(_p: unit)(s: storage) : address = 
      s.extension.signerAddress

  type mint = {
    owner    : address;
    token_id : nat;
  }

  type calldata = address * string * bytes
  [@entry]
  let dispatch (address, name, args: calldata)(s: storage) : ret =
    if (Tezos.get_self_address() = address) then
      if name = "%mint_offchain" then
        let ep_mint_offchain: mint contract = Tezos.self "%mint_offchain" in
        let args_decoded: mint = match (Bytes.unpack args: mint option) with
        | Some data -> data
        | None -> failwith Errors.invalid_calldata_wrong_arguments
        in 
        [Tezos.Next.Operation.transaction args_decoded 0mutez ep_mint_offchain], s
      else
        failwith Errors.invalid_calldata_wrong_name
    else
      let external_dispatch_opt : calldata contract option = Tezos.get_entrypoint_opt "%dispatch" address in
      let op : operation  = match external_dispatch_opt with
      | Some ep -> Tezos.Next.Operation.transaction (address, name, args) 0mutez ep
      | None -> failwith Errors.invalid_calldata_contract_not_dispatcher
      in
      [op], s

  type verifyTxAuthData_param = {
      msgData: bytes * nat * timestamp * address * string * bytes * key * signature;
      userAddress: address; 
  }
  let verifyTxAuthData (p: verifyTxAuthData_param)(s: storage) : ret = 
      let (payload, nonce, expiration, contractAddress, name, args, k, signature) : bytes * nat * timestamp * address * string * bytes * key * signature = p.msgData in
      // VERIFY parameters correspond to payload hash
      let nonce_b = Bytes.pack nonce in
      let expiration_b = Bytes.pack expiration in
      let key_b = Bytes.pack k in
      let contract_b = Bytes.pack contractAddress in
      let name_b = Bytes.pack name in
      let expected_bytes = Bytes.concat key_b (Bytes.concat nonce_b (Bytes.concat expiration_b (Bytes.concat contract_b (Bytes.concat name_b args)))) in
      let expected_payload = Crypto.keccak(expected_bytes) in
      let () = Assert.Error.assert (expected_payload = payload) Errors.parameter_missmatch in
      // VERIFY signer: Retrieve signer address from public key
      let kh : key_hash = Crypto.hash_key k in
      let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
      // NONCE
      let current_nonce, new_nonces = match Big_map.find_opt p.userAddress s.extension.nonces with
      | None -> (0n, Big_map.update p.userAddress (Some(1n)) s.extension.nonces)
      | Some nse -> (nse, Big_map.update p.userAddress (Some(nse + 1n)) s.extension.nonces)
      in
      let () = Assert.Error.assert (nonce = current_nonce) Errors.invalid_nonce in
      // EXPIRATION
      let _ = Assert.Error.assert (Tezos.get_now() < expiration) Errors.block_expired in
      // VERIFY signer key corresponds to signerAddress 
      let () = if (not is_implicit(s.extension.signerAddress)) then // case signerAddress is a smart contract
          //calls isValidSignature of the smart contract             
          let r = Tezos.call_view "isValidSignature" (k, payload, signature) s.extension.signerAddress in
          match r with
          | None -> failwith Errors.missing_isvalidsignature_view
          | Some status -> Assert.assert (status)
      else   // case signerAddress is a implicit account
          Assert.Error.assert (signer_address_from_key = s.extension.signerAddress) Errors.not_expected_signer
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
      [op], { s with extension = { s.extension with nonces=new_nonces } }


  type mint_offchain = {
      msgData: bytes * nat * timestamp * address * string * bytes * key * signature;
      userAddress: address; 
  }
  [@entry]
  let exec_offchain (mint : mint_offchain) (s : storage): ret =
      let param = {
          msgData = mint.msgData;
          userAddress = mint.userAddress; 
      } in
      verifyTxAuthData param s 

  [@entry]
  let mint_offchain (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.ledger)) in
    let s = NFT.set_balance s mint.owner mint.token_id in
    [], s

  [@entry]
  let mint (mint : mint) (s : storage): ret =
    let sender = Tezos.get_sender () in
    let () = Assert.assert (sender = s.extension.admin) in
    let () = NFT.Assertions.assert_token_exist s.token_metadata mint.token_id in
    (* Check that nobody owns the token already *)
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.ledger)) in
    let s = NFT.set_balance s mint.owner mint.token_id in
    [], s

  (* Standard FA2 interface, copied from the source *)

  [@entry]
  let transfer (t: NFT.TZIP12.transfer) (s: storage) : ret =
    NFT.transfer t s

  [@entry]
  let balance_of (b: NFT.TZIP12.balance_of) (s: storage) : ret =
    NFT.balance_of b s

  [@entry]
  let update_operators (u: NFT.TZIP12.update_operators) (s: storage) : ret =
    NFT.update_operators  u s

  [@view]
  let get_balance (p : (address * nat)) (s : storage) : nat =
    NFT.get_balance p s

  [@view]
  let total_supply (token_id : nat) (s : storage) : nat =
    NFT.total_supply token_id s

  [@view]
  let all_tokens (_ : unit) (s : storage) : nat set =
    NFT.all_tokens () s

  [@view]
  let is_operator (op : NFT.TZIP12.operator) (s : storage) : bool =
    NFT.is_operator op s

  [@view]
  let token_metadata (p : nat) (s : storage) : NFT.TZIP12.tokenMetadataData =
    NFT.token_metadata p s

end