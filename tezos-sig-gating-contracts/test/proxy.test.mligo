#import "./helper/bootstrap.mligo" "Bootstrap"
#import "./helper/assert.mligo" "AssertHelper"
#import "../contracts/examples/proxy.mligo" "PROXY"
#import "../contracts/examples/fa2Proxy.mligo" "NFTMINTER"

#import "./helper/fa2Proxy.mligo" "FA2Helper"
// #import "../contracts/examples/nftminter.mligo" "NFTMINTER"

/////////////////////////////////////////////////////////////////////////////////////////////////////////
// HELPERS
/////////////////////////////////////////////////////////////////////////////////////////////////////////


type 'a raw_payload = {
  public_key: key;
  chain_id: chain_id;
  user: address;
  nonce: nat;
  expiration: nat;
  functioncall_contract: address;
  functioncall_name: string;
  functioncall_params: 'a;
}
let compute_hash (type a) (data : a raw_payload) : bytes * bytes = 
    let key_bytes : bytes = Bytes.pack data.public_key in
    let chain_id_bytes : bytes = Bytes.pack data.chain_id in
    let user_bytes : bytes = Bytes.pack data.user in
    let nonce_bytes : bytes = Bytes.pack data.nonce in 
    let expiration_bytes : bytes = Bytes.pack data.expiration in 
    let functioncall_contract_bytes : bytes = Bytes.pack data.functioncall_contract in
    let functioncall_name_bytes : bytes = Bytes.pack data.functioncall_name in
    let functioncall_params_bytes : bytes = Bytes.pack data.functioncall_params in
    let data : bytes = Bytes.concat key_bytes (Bytes.concat chain_id_bytes (Bytes.concat user_bytes (Bytes.concat nonce_bytes (Bytes.concat expiration_bytes (Bytes.concat functioncall_contract_bytes (Bytes.concat functioncall_name_bytes functioncall_params_bytes)))))) in
    let data_hash = Crypto.keccak data in    
    data_hash, functioncall_params_bytes

let localsigner = {
  address=("tz1TiFzFCcwjv4pyYGTrnncqgq17p59CzAE2": address);
  publicKey=("edpkuoQnnWMys1uS2eJrDkhPnizRNyQYBcsBsyfX4K97jVEaWKTXat" : key);
  privateKey="edskS7YYeT85SiRZEHPFjDpCAzCuUaMwYFi39cWPfguovTuNqxU3U9hXo7LocuJmr7hxkesUFkmDJh26ubQGehwXY8YiGXYCvU"
}

let sign_hash (data_hash : bytes) : signature = 
  Test.Next.Crypto.sign localsigner.privateKey data_hash


/////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTS
/////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////
//              THIS TEST MUST BE DONE ON TESTNET
// !!!! The signature provided cannot be built if the contract address is not stable !!! 
// In this test we do:
// - DEPLOY SignerManager -> SignerManager address is used in the initial storage of NFTMINTER
// - DEPLOY NFTMINTER -> NFTMINTER address (WARNING: address is not stable) 
// - use script to forge signature , and replace (copy/paste) it in the test
// - re-launch test  
////////////////////////////////////////////////////////////////////////////////////
let test_proxy =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
 
    // DEPLOY FA2_FOR_PROXY
    let nft_extension_initial = { 
        admin = owner1;
        proxyAddress = localsigner.address; // unused will be overritten
    } in
    let orig_fa2 = FA2Helper.boot_fa2_for_proxy(nft_extension_initial, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = fa2_taddr; code = _ ; size = _} = orig_fa2 in 
    let fa2_contract = Test.Next.Typed_address.to_contract fa2_taddr in
    let fa2_address : address = Tezos.address fa2_contract in

   // DEPLOY proxy
    let initial_storage = {
        admin = owner1;
        signerAddress = localsigner.address;
        nonces = (Big_map.empty: (address, nat) big_map)
    } in
    let {taddr = proxy_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of PROXY.ProxyVerifier) initial_storage 0tez in
    let proxy_contract = Test.Next.Typed_address.to_contract proxy_taddr in
    let proxy_address : address = Tezos.address proxy_contract in

    // SET PROXY entrypoint call on FA2 contract
    let r = Test.transfer_to_contract fa2_contract (SetProxy proxy_address) 0tez in
    // let () = Test.Next.IO.log(r) in
    let () = AssertHelper.tx_success r in

    // PREPARE parameter for EXEC_GATED_CALLDATA call 
    let inputs: NFTMINTER.NftMinterForProxy.mint raw_payload = {
      public_key = localsigner.publicKey;
      chain_id = (Tezos.get_chain_id());
      user = owner3;
      nonce = 0n;
      expiration = 100n;
      functioncall_contract = fa2_address;
      functioncall_name = "%mint";
      functioncall_params = ({
        owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
        token_id=6n
      }: NFTMINTER.NftMinterForProxy.mint)
    } in
    let data_hash, functioncall_params_bytes = compute_hash inputs in 
    let my_sig : signature = sign_hash data_hash in
    // let my_sig : signature = ("edsigtdkwMWWDMXGPWMm8S78PDjZwCXKZSsj81itgWfnNLB6fdkdqQW6VNiS8bGmdtgGuT2ksST1QBXFqBDqMJ7n3xzcA4AeJoV" : signature) in

    let p: PROXY.ProxyVerifier.txAuthData = {
      userAddress = inputs.user;   // user address (used to check nonce)
      expiration = inputs.expiration;  // expiration date
      contractAddress = inputs.functioncall_contract;  // calldata contract address
      name = inputs.functioncall_name;   // name of the entrypoint of the calldata (for example "%mint")
      args = functioncall_params_bytes;   // arguments for the entrypoint of the calldata 
      publicKey = inputs.public_key;     // public key that signed the payload 
      signature = my_sig;   // signature of the payload signed by the given public key
    } in
    // EXEC_GATED_CALLDATA entrypoint call 
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract proxy_contract (Exec_gated_calldata p) 0tez in
    let () = Test.Next.IO.log("Proxy.Exec_gated_calldata", r) in
    let () = AssertHelper.tx_success r in
    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage fa2_taddr in
    let () = 
        match Big_map.find_opt 6n current_storage.ledger with
        | Some ownr6 -> Assert.assert (ownr6 = inputs.functioncall_params.owner) 
        | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
    in
    ()
