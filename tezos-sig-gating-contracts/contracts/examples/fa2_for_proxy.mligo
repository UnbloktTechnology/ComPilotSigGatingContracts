// #import "@ligo/fa/lib/main.mligo" "FA2"
#import "../../.ligo/source/i/ligo__s__fa__1.4.2__ffffffff/lib/main.mligo" "FA2"

module NftMinterForProxy = struct
  module NFT = FA2.NFTExtendable

  type extension = {
      admin: address;
      proxyAddress: address; 
  }

  type storage = extension NFT.storage
  type ret = operation list * storage

  module Errors = struct
      let only_from_proxy = "Accept calldata only from proxy"
      let only_owner = "OnlyOwner"
      let invalid_calldata_wrong_name = "UnknownEntrypoint"
      let invalid_calldata_wrong_arguments = "InvalidEntrypointArguments"
      let this_contract_does_not_dispatch = "[dispatch] this contract does not dispatch calldata"
  end

  [@entry]
  let setProxy(proxy: address) (s: storage) : ret =
      let _ = Assert.Error.assert (Tezos.get_sender() = s.extension.admin) Errors.only_owner in
      [], { s with extension = { s.extension with proxyAddress = proxy } }

  [@view]
  let getProxy(_p: unit)(s: storage) : address = 
      s.extension.proxyAddress

  type mint = {
    owner    : address;
    token_id : nat;
  }
  let apply_mint(mint : mint) (s : storage): ret =
    let () = NFT.Assertions.assert_token_exist s.token_metadata mint.token_id in
    let () = Assert.assert (Option.is_none (Big_map.find_opt mint.token_id s.ledger)) in
    let s = NFT.set_balance s mint.owner mint.token_id in
    [], s

  [@entry]
  let mint (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = s.extension.admin) in
    apply_mint mint s

  type calldata = address * string * bytes
  [@entry]
  let dispatch (address, name, args: calldata)(s: storage) : ret =
    let () = Assert.Error.assert (Tezos.get_sender() = s.extension.proxyAddress) Errors.only_from_proxy in
    if (Tezos.get_self_address() = address) then
      if name = "%transfer" then
        let args_decoded: FA2.NFTExtendable.TZIP12.transfer = match (Bytes.unpack args: FA2.NFTExtendable.TZIP12.transfer option) with
        | Some data -> data
        | None -> failwith Errors.invalid_calldata_wrong_arguments
        in 
        NFT.transfer args_decoded s
      else if name = "%mint" then
        let args_decoded: mint = match (Bytes.unpack args: mint option) with
        | Some data -> data
        | None -> failwith Errors.invalid_calldata_wrong_arguments
        in 
        apply_mint args_decoded s
      else
        failwith Errors.invalid_calldata_wrong_name
    else
      failwith Errors.this_contract_does_not_dispatch

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