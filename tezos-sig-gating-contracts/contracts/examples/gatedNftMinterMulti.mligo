#import "@ligo/fa/lib/main.mligo" "FA2"
#import "@nexeraid/sig-gating/lib/main.mligo" "SigGatedExtendable"
// #import "../../tezos-lib-sig-gating-extendable/lib/main.mligo" "SigGatedExtendable"

module NftMinterInternalDispatch = struct

  module NFT = FA2.NFTExtendable

  type fa2_extension = {
      minter: address;   // MINTER ROLE 
  }
  type extended_fa2_storage = fa2_extension NFT.storage

  type storage = extended_fa2_storage SigGatedExtendable.siggated_storage

  type ret = operation list * storage

  module Errors = struct
      let custom_error_mesage = "CustomError"
  end

  type mint = {
    owner    : address;
    token_id : nat;
  }

  let apply_mint (mint : mint) (s : storage): ret =
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.siggated_extension.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.siggated_extension.ledger)) in
    let new_fa2_s = NFT.set_balance s.siggated_extension mint.owner mint.token_id in
    [], { s with siggated_extension=new_fa2_s }

  (* Calldata extension *)

  [@entry]
  let setSigner(newSigner: address) (s: storage) : ret =
    let ops, s = SigGatedExtendable.setSigner newSigner s in
    (ops, s)
    // ops, { s with siggated_extension = { s.siggated_extension with extension = { s.siggated_extension.extension with minter=newSigner } } }

  [@view]
  let txAuthDataSignerAddress(p: unit)(s: storage) : address = 
      SigGatedExtendable.getSigner p s 

  // Example of entrypoint which uses 
  // - verifyTxAuthData function for signature verification (nonce, expiration) 
  // - process_internal_calldata for processing the calldata (by calling the targeted entrypoint)
  [@entry]
  let mint_or_burn_gated (data : SigGatedExtendable.txAuthData) (s : storage): ret =
      let ops, s = SigGatedExtendable.verifyTxAuthData data s in
      let cd : SigGatedExtendable.calldata = (Tezos.get_self_address (), data.functionName, data.functionArgs) in
      let op = SigGatedExtendable.process_internal_calldata_2 (cd, 
        (Tezos.self "%mint_gated": mint contract), 
        (Tezos.self "%burn_gated": mint contract)) in
      op :: ops, s

  [@entry]
  let burn_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    apply_mint mint s

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    apply_mint mint s

  (* FA2 extension *)

  [@entry]
  let mint (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = s.siggated_extension.extension.minter) in
    apply_mint mint s

  (* Standard FA2 interface, copied from the source *)

  [@entry]
  let transfer (t: NFT.TZIP12.transfer) (s: storage) : ret =
    let ops, news_fa2_s = NFT.transfer t s.siggated_extension in
    ops, { s with siggated_extension=news_fa2_s }

  [@entry]
  let balance_of (b: NFT.TZIP12.balance_of) (s: storage) : ret =
    let ops, news_fa2_s = NFT.balance_of b s.siggated_extension in
    ops, { s with siggated_extension=news_fa2_s }

  [@entry]
  let update_operators (u: NFT.TZIP12.update_operators) (s: storage) : ret =
    let ops, news_fa2_s = NFT.update_operators  u s.siggated_extension in
    ops, { s with siggated_extension=news_fa2_s }

  [@view]
  let get_balance (p : (address * nat)) (s : storage) : nat =
    NFT.get_balance p s.siggated_extension

  [@view]
  let total_supply (token_id : nat) (s : storage) : nat =
    NFT.total_supply token_id s.siggated_extension

  [@view]
  let all_tokens (_ : unit) (s : storage) : nat set =
    NFT.all_tokens () s.siggated_extension

  [@view]
  let is_operator (op : NFT.TZIP12.operator) (s : storage) : bool =
    NFT.is_operator op s.siggated_extension

  [@view]
  let token_metadata (p : nat) (s : storage) : NFT.TZIP12.tokenMetadataData =
    NFT.token_metadata p s.siggated_extension

end