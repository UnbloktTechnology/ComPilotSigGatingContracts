#import "@ligo/fa/lib/main.mligo" "FA2"
#import "@compilot/sig-gating/lib/main.mligo" "SigGatedExtendable"
// #import "../../tezos-lib-sig-gating-extendable/lib/main.mligo" "SigGatedExtendable"

module NftMinterUnlimited = struct

  (* FA2 extension - storage *)
  module NFT = FA2.NFTExtendable
  type fa2_extension = {
      minter: address;   // MINTER ROLE 
      next_token_id: nat;
  }
  type extended_fa2_storage = fa2_extension NFT.storage

  type mint = {
    owner    : address;
    token_info : (string, bytes) map;
  }

  (* SigGating extension - storage *)
  type storage = extended_fa2_storage SigGatedExtendable.siggated_storage

  type ret = operation list * storage

  module Errors = struct
      let asset_already_exist = "AssetAlreadyExist"
  end

  (* FA2 extension - entrypoints *)

  let apply_mint (mint : mint) (s : storage): ret =
    // Apply MINT
    let token_id = s.siggated_extension.extension.next_token_id in
    let new_extension = { s.siggated_extension.extension with next_token_id=token_id+1n } in
    let () = Assert.Error.assert (Option.is_none (Big_map.find_opt token_id s.siggated_extension.token_metadata)) Errors.asset_already_exist in
    let new_token_info: NFT.TZIP12.tokenMetadataData = {token_id=token_id;token_info=mint.token_info;} in
    let new_token_metadata: NFT.TZIP12.tokenMetadata = Big_map.add token_id new_token_info s.siggated_extension.token_metadata in
    let ext_fa2_s = { s.siggated_extension with token_metadata=new_token_metadata; extension=new_extension} in
    let new_fa2_s = NFT.set_balance ext_fa2_s mint.owner token_id in
    [], { s with siggated_extension=new_fa2_s }

  [@entry]
  let mint (mint : mint) (s : storage): ret =
    let () = Assert.assert (Tezos.get_sender () = s.siggated_extension.extension.minter) in
    apply_mint mint s

  [@view]
  let nextTokenId(p: unit)(s: storage) : nat = 
      s.siggated_extension.extension.next_token_id

  (* SigGating extension - entrypoints *)

  [@entry]
  let setSigner(newSigner: address) (s: storage) : ret =
    let ops, s = SigGatedExtendable.setSigner newSigner s in
    (ops, s)

  [@view]
  let txAuthDataSignerAddress(p: unit)(s: storage) : address = 
      SigGatedExtendable.getSigner p s 

  type txAuthInput = {
    userAddress: address;   // user address (used to check nonce)
    expirationBlock: nat;  // expiration date
    // functionName: string;   // name of the entrypoint of the calldata (for example "%mint")
    functionArgs: bytes;   // arguments for the entrypoint of the calldata 
    signerPublicKey: key;     // public key that signed the payload 
    signature: signature;   // signature of the payload signed by the given public key
  }
  
  // Example of entrypoint which uses 
  // - verifyTxAuthData function for signature verification (nonce, expiration) 
  // - process the calldata itself
  [@entry]
  let mint_gated (datainput : txAuthInput) (s : storage): ret =
    let data : SigGatedExtendable.txAuthData = { 
      userAddress = datainput.userAddress;
      expirationBlock = datainput.expirationBlock;
      functionName = "%mint_gated";
      functionArgs = datainput.functionArgs;
      signerPublicKey = datainput.signerPublicKey;
      signature = datainput.signature;
    } in
    let opsVerify, s = SigGatedExtendable.verifyTxAuthData data s in
    let mint_decoded: mint = match (Bytes.unpack data.functionArgs: mint option) with
    | Some data -> data
    | None -> failwith SigGatedExtendable.Errors.invalid_calldata_wrong_arguments
    in 
    let opsMint, s = apply_mint mint_decoded s in
    SigGatedExtendable.Utils.concatlists opsVerify opsMint, s


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