// #import "@ligo/fa/lib/main.mligo" "FA2"
#import "../../.ligo/source/i/ligo__s__fa__1.4.2__ffffffff/lib/main.mligo" "FA2"

module NftMinterExt = struct

  module SigCalldataExtendable = struct
    type calldata = address * string * bytes

    type 'a calldata_storage = {
      admin: address; // CHANGE_SIGNER ROLE
      signerAddress: address;
      nonces: (address, nat) big_map;
      calldata_extension: 'a;
    }
    type 'a ret = operation list * 'a calldata_storage

    module Errors = struct
        let only_role_change_signer = "OnlyChangeSignerRole"
        let block_expired = "BlockExpired"
        let invalid_signature = "InvalidSignature"
        let unmatch_expiration_date = "UnmatchExpirationDate"
        let invalid_nonce = "InvalidNonce"
        let parameter_missmatch = "HashMissmatchParameters"
        // let invalid_calldata_wrong_name = "UnknownEntrypoint"
        let invalid_calldata_wrong_arguments = "InvalidEntrypointArguments"
        let invalid_calldata_contract_not_dispatcher = "MissingDispatchEntrypoint"
        let not_expected_signer = "KeyMissmatchSignerAddress"
        let missing_isvalidsignature_view = "MissingIsValidSignatureView"
        let invalid_chain = "InvalidChainId"
    end

    let is_implicit (elt : address) : bool =
      let pack_elt : bytes = Bytes.pack elt in
      let is_imp : bytes = Bytes.sub 6n 1n pack_elt in
      (is_imp = 0x00)

    let setSigner (type a) (newSigner: address) (s : a calldata_storage) : a ret =
      let _ = Assert.Error.assert (Tezos.get_sender() = s.admin) Errors.only_role_change_signer in
      let op = Tezos.emit "%setSigner" newSigner in
      [op], { s with signerAddress = newSigner }

    let getSigner (type a) (_p: unit) (s : a calldata_storage) : address = 
      s.signerAddress

    type txAuthData = {
      payload: bytes;   // hash of the following fields (except signature)
      chain_id: chain_id;   // chain_id
      userAddress: address;   // user address (used to check nonce)
      nonce: nat;   // nonce of the userAddress when forging the signature
      expiration: nat;  // expiration date
      contractAddress: address;  // calldata contract address
      name: string;   // name of the entrypoint of the calldata (for example "%mint")
      args: bytes;   // arguments for the entrypoint of the calldata 
      publicKey: key;     // public key that signed the payload 
      signature: signature;   // signature of the payload signed by the given public key
    }

    let verifyTxAuthData (type a) (p: txAuthData)(s: a calldata_storage) : a ret = 
      let { payload; chain_id; userAddress; nonce; expiration; contractAddress; name; args; publicKey=k; signature } = p in
      // VERIFY parameters correspond to payload hash
      let chainid_b = Bytes.pack chain_id in
      let user_b = Bytes.pack userAddress in
      let nonce_b = Bytes.pack nonce in
      let expiration_b = Bytes.pack expiration in
      let key_b = Bytes.pack k in
      let contract_b = Bytes.pack contractAddress in
      let name_b = Bytes.pack name in
      let expected_bytes = Bytes.concat key_b (Bytes.concat chainid_b (Bytes.concat user_b (Bytes.concat nonce_b (Bytes.concat expiration_b (Bytes.concat contract_b (Bytes.concat name_b args)))))) in
      let expected_payload = Crypto.keccak(expected_bytes) in
      let () = Assert.Error.assert (expected_payload = payload) Errors.parameter_missmatch in
      // Retrieve signer address from public key
      let kh : key_hash = Crypto.hash_key k in
      let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
      // NONCE
      let current_nonce, new_nonces = match Big_map.find_opt userAddress s.nonces with
      | None -> (0n, Big_map.update userAddress (Some(1n)) s.nonces)
      | Some nse -> (nse, Big_map.update userAddress (Some(nse + 1n)) s.nonces)
      in
      let () = Assert.Error.assert (nonce = current_nonce) Errors.invalid_nonce in
      // EXPIRATION
      let _ = Assert.Error.assert (Tezos.get_level() < expiration) Errors.block_expired in
      // CHAIN ID
      let _ = Assert.Error.assert (Tezos.get_chain_id() = chain_id) Errors.invalid_chain in
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

  end

  module NFT = FA2.NFTExtendable

  type fa2_extension = {
      minter: address;   // MINTER ROLE 
  }
  type extended_fa2_storage = fa2_extension NFT.storage

  type storage = extended_fa2_storage SigCalldataExtendable.calldata_storage

  type ret = operation list * storage

  module Errors = struct
      // let only_role_change_signer = "OnlyChangeSignerRole"
      // let block_expired = "BlockExpired"
      // let invalid_signature = "InvalidSignature"
      // let unmatch_expiration_date = "UnmatchExpirationDate"
      // let invalid_nonce = "InvalidNonce"
      // let parameter_missmatch = "HashMissmatchParameters"
      let invalid_calldata_wrong_name = "UnknownEntrypoint"
      // let invalid_calldata_wrong_arguments = "InvalidEntrypointArguments"
      // let invalid_calldata_contract_not_dispatcher = "MissingDispatchEntrypoint"
      // let not_expected_signer = "KeyMissmatchSignerAddress"
      // let missing_isvalidsignature_view = "MissingIsValidSignatureView"
      // let invalid_chain = "InvalidChainId"
  end

  (* Calldata extension *)

  [@entry]
  let setSigner(newSigner: address) (s: storage) : ret =
    let ops, s = SigCalldataExtendable.setSigner newSigner s in
    (ops, s)
    // ops, { s with calldata_extension = { s.calldata_extension with extension = { s.calldata_extension.extension with minter=newSigner } } }

  [@view]
  let txAuthDataSignerAddress(p: unit)(s: storage) : address = 
      SigCalldataExtendable.getSigner p s 

  type mint = {
    owner    : address;
    token_id : nat;
  }

  // type calldata = address * string * bytes
  [@entry]
  let dispatch (address, name, args: SigCalldataExtendable.calldata)(s: storage) : ret =
    if (Tezos.get_self_address() = address) then
      if name = "%mint_gated" then
        let ep_mint_gated: mint contract = Tezos.self "%mint_gated" in
        let args_decoded: mint = match (Bytes.unpack args: mint option) with
        | Some data -> data
        | None -> failwith SigCalldataExtendable.Errors.invalid_calldata_wrong_arguments
        in 
        [Tezos.Next.Operation.transaction args_decoded 0mutez ep_mint_gated], s
      else
        failwith Errors.invalid_calldata_wrong_name
    else
      failwith SigCalldataExtendable.Errors.invalid_calldata_contract_not_dispatcher
      // let external_dispatch_opt : SigCalldataExtendable.calldata contract option = Tezos.get_entrypoint_opt "%dispatch" address in
      // let op : operation  = match external_dispatch_opt with
      // | Some ep -> Tezos.Next.Operation.transaction (address, name, args) 0mutez ep
      // | None -> failwith SigCalldataExtendable.Errors.invalid_calldata_contract_not_dispatcher
      // in
      // [op], s

  [@entry]
  let exec_gated_calldata (data : SigCalldataExtendable.txAuthData) (s : storage): ret =
      SigCalldataExtendable.verifyTxAuthData data s 

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.calldata_extension.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.calldata_extension.ledger)) in
    let extended_fa2_storage: fa2_extension NFT.storage = s.calldata_extension in 
    let ops, new_s = NFT.set_balance extended_fa2_storage mint.owner mint.token_id in
    ops, { s with calldata_extension=new_s }

  (* FA2 extension *)

  [@entry]
  let mint (mint : mint) (s : storage): ret =
    let sender = Tezos.get_sender () in
    let () = Assert.assert (sender = s.calldata_extension.extension.minter) in
    let () = NFT.Assertions.assert_token_exist s.calldata_extension.token_metadata mint.token_id in
    (* Check that nobody owns the token already *)
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.calldata_extension.ledger)) in
    let ops, new_s = NFT.set_balance s.calldata_extension mint.owner mint.token_id in
    ops, { s with calldata_extension=new_s }

  (* Standard FA2 interface, copied from the source *)

  [@entry]
  let transfer (t: NFT.TZIP12.transfer) (s: storage) : ret =
    let ops, news_fa2_s = NFT.transfer t s.calldata_extension in
    ops, { s with calldata_extension=news_fa2_s }

  [@entry]
  let balance_of (b: NFT.TZIP12.balance_of) (s: storage) : ret =
    let ops, news_fa2_s = NFT.balance_of b s.calldata_extension in
    ops, { s with calldata_extension=news_fa2_s }

  [@entry]
  let update_operators (u: NFT.TZIP12.update_operators) (s: storage) : ret =
    let ops, news_fa2_s = NFT.update_operators  u s.calldata_extension in
    ops, { s with calldata_extension=news_fa2_s }

  [@view]
  let get_balance (p : (address * nat)) (s : storage) : nat =
    NFT.get_balance p s.calldata_extension

  [@view]
  let total_supply (token_id : nat) (s : storage) : nat =
    NFT.total_supply token_id s.calldata_extension

  [@view]
  let all_tokens (_ : unit) (s : storage) : nat set =
    NFT.all_tokens () s.calldata_extension

  [@view]
  let is_operator (op : NFT.TZIP12.operator) (s : storage) : bool =
    NFT.is_operator op s.calldata_extension

  [@view]
  let token_metadata (p : nat) (s : storage) : NFT.TZIP12.tokenMetadataData =
    NFT.token_metadata p s.calldata_extension

end