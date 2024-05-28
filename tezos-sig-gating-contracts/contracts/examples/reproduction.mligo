// #import "@ligo/fa/lib/main.mligo" "FA2"   // why not recognized ?
#import "../../.ligo/source/i/ligo__s__fa__1.4.2__ffffffff/lib/main.mligo" "FA2"

module NftMinter = struct
  module NFT = FA2.NFTExtendable

  type extension = {
      admin: address;
      signerAddress: address; 
  }
  type storage = extension NFT.storage
  type ret = operation list * storage

  module Errors = struct
      let invalid_signature = "InvalidSignature"
      let parameter_missmatch = "hash of given parameters (key, functioncall) does not match the payload hash"
  end

  type mint = {
    owner    : address;
    token_id : nat;
  }

  type verifyTxAuthData_param = {
      msgData: bytes * bytes * bytes * key * signature;
      userAddress: address; 
  }
  let verifyTxAuthData (p: verifyTxAuthData_param)(s: storage) : ret = 
      let (payload, functioncall, args,  k, signature) : bytes * bytes * bytes * key * signature = p.msgData in
      let key_b = Bytes.pack k in
      let expected_bytes = Bytes.concat key_b (Bytes.concat functioncall args) in
      let expected_payload = Crypto.keccak(expected_bytes) in
      let () = Assert.Error.assert (expected_payload = payload) Errors.parameter_missmatch in

      // Retrieve signer address from public key
      let kh : key_hash = Crypto.hash_key k in
      let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
      let () = Assert.Error.assert (signer_address_from_key = s.extension.signerAddress) "missmatch key and signerAddress" in

      // VERIFY SIGNATURE
      let is_valid = Crypto.check k signature payload in 
      let _ = Assert.Error.assert (is_valid) Errors.invalid_signature in
      //TODO
      // let ep_opt : mint contract option = Bytes.unpack functioncall in
      let ep_opt : mint contract option = Tezos.get_entrypoint_opt "%mint_offchain" (Tezos.get_self_address()) in
      let op : operation  = match ep_opt with
      | Some ep -> 
          let args: mint = match (Bytes.unpack args: mint option) with
          | Some data -> data
          | None -> failwith "[VerifyTxAuthData] Cannot unpack functioncall args"
          in 
          let op : operation = Tezos.Next.Operation.transaction args 0mutez ep in
          op
      | None -> failwith "[VerifyTxAuthData] mint_offchain entrypoint not found"
      in
      [op], s
      // [], s

  type mint_offchain = {
      msgData: bytes * bytes * bytes * key * signature;
      userAddress: address; 
      token_id : nat;
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