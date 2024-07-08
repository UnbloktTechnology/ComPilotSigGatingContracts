// #import "../../.ligo/source/i/ligo__s__fa__1.4.2__ffffffff/lib/main.mligo" "FA2"
// #import "../../.ligo/source/i/nexeraid__s__sig_gating__1.0.2__ffffffff/lib/main.mligo" "SigGatedExtendable"
#import "@ligo/fa/lib/main.mligo" "FA2"
#import "@nexeraid/sig-gating/lib/main.mligo" "SigGatedExtendable"

module NftMinterDispatch = struct

  (* FA2 extension - storage *)
  module NFT = FA2.NFTExtendable
  type fa2_extension = {
      minter: address;   // MINTER ROLE 
      lastMinted: nat;
  }
  type extended_fa2_storage = fa2_extension NFT.storage

  type mint = {
    owner    : address;
    token_id : nat;
  }

  (* SigGating extension - storage *)
  type storage = extended_fa2_storage SigGatedExtendable.siggated_storage

  type ret = operation list * storage

  module Errors = struct
      let custom_error_mesage = "CustomError"
      let asset_already_owned = "AssetAlreadyOwned"
  end

  (* FA2 extension - entrypoints *)

  let apply_mint (mint : mint) (s : storage): ret =
    // Apply MINT
    let () = NFT.Assertions.assert_token_exist s.siggated_extension.token_metadata mint.token_id in
    let () = Assert.Error.assert (Option.is_none (Big_map.find_opt mint.token_id s.siggated_extension.ledger)) Errors.asset_already_owned in
    let new_fa2_s = NFT.set_balance s.siggated_extension mint.owner mint.token_id in
    let new_fa2_s = { new_fa2_s with extension={ new_fa2_s.extension with lastMinted=mint.token_id }} in
    [], { s with siggated_extension=new_fa2_s }

  [@entry]
  let mint (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = s.siggated_extension.extension.minter) in
    apply_mint mint s

  [@view]
  let lastMinted(p: unit)(s: storage) : nat = 
      s.siggated_extension.extension.lastMinted
      
  (* SigGating extension - entrypoints *)

  [@entry]
  let setSigner(newSigner: address) (s: storage) : ret =
    let ops, s = SigGatedExtendable.setSigner newSigner s in
    (ops, s)

  [@view]
  let txAuthDataSignerAddress(p: unit)(s: storage) : address = 
      SigGatedExtendable.getSigner p s 

  [@entry]
  let dispatch (cd: SigGatedExtendable.calldata)(s: storage) : ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
    let op = SigGatedExtendable.process_internal_calldata (cd, (Tezos.self "%mint_gated": mint contract)) in
    [op], s

  [@entry]
  let exec_gated_calldata (data : SigGatedExtendable.txAuthDataWithContractAddress) (s : storage): ret =
      SigGatedExtendable.verifyAndDispatchTxAuthData data s 

  [@entry]
  let mint_gated (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = Tezos.get_self_address()) in
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