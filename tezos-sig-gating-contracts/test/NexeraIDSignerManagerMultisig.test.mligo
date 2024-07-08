#import "./helper/bootstrap.mligo" "Bootstrap"
#import "./helper/assert.mligo" "AssertHelper"
#import "../contracts/signerManager/NexeraIDSignerManagerMultisig.mligo" "NexeraIDSignerManager"

#import "../contracts/examples/gatedNftMinterSimple.mligo" "NFTMINTER"
#import "./helper/gatedNftMinterSimple.mligo" "NftMinterHelper"
#import "@nexeraid/sig-gating/lib/main.mligo" "SigGatedExtendable"
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
let test_signermanagermultisig_pause =
    let (owner1, _owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = owner3;
        pause = false;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Pause ()) 0tez in
    let () = AssertHelper.tx_success r in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause) in
    ()

let test_signermanagermultisig_failure_pause_only_owner =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = owner3;
        pause = false;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;

    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (Pause ()) 0tez in
    let () = AssertHelper.string_failure r NexeraIDSignerManager.SignerManagerMultisig.Errors.only_owner in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = false) in
    ()

let test_signermanagermultisig_failure_pause_already_paused =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = owner3;
        pause = true;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Pause ()) 0tez in
    let () = AssertHelper.string_failure r NexeraIDSignerManager.SignerManagerMultisig.Errors.already_paused in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = true) in
    ()

let test_signermanagermultisig_unpause =
    let (owner1, _owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = owner3;
        pause = true;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Unpause ()) 0tez in
    let () = AssertHelper.tx_success r in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = false) in
    ()

let test_signermanagermultisig_failure_unpause_only_owner =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = owner3;
        pause = true;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (Unpause ()) 0tez in
    let () = AssertHelper.string_failure r NexeraIDSignerManager.SignerManagerMultisig.Errors.only_owner in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = true) in
    ()

let test_signermanagermultisig_failure_unpause_already_unpaused =
    let (owner1, owner2, owner3, _, _, _, _) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = owner3;
        pause = false;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let _signer_manager_address : address = Tezos.address signer_manager_contract in
    // PAUSE fails
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (Unpause ()) 0tez in
    let () = AssertHelper.string_failure r NexeraIDSignerManager.SignerManagerMultisig.Errors.already_unpaused in
    // VERIFY 
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = Test.Next.Assert.assert (current_storage.pause = false) in
    ()

////////////////////////////////////////////////////////////////////////////////////
let test_signermanagermultisig_mint_gated =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = localsigner.address;
        pause = false;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=2n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let signer_manager_address : address = Tezos.address signer_manager_contract in

    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(owner3, localsigner.address, owner3, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in

    // Set Signer Manager 
    let () = Test.set_source owner3 in
    let r = Test.transfer_to_contract nftminter_contract (SetSigner signer_manager_address) 0tez in
    let () = AssertHelper.tx_success r in

    let () = Test.set_source owner1 in
    let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    // PREPARE parameter for EXEC_GATED_CALLDATA call 
    let inputs: NFTMINTER.NftMinterSimple.mint raw_payload = {
      public_key = localsigner.publicKey;
      chain_id = (Tezos.get_chain_id());
      user = owner3;
      nonce = 0n;
      expiration = 100n;
      functioncall_contract = nftminter_address;
      functioncall_name = "%mint_gated";
      functioncall_params = ({
        owner=("tz1fon1Hp3eRff17X82Y3Hc2xyokz33MavFF": address);
        token_id=6n
      }: NFTMINTER.NftMinterSimple.mint)
    } in
    let data_hash, functioncall_params_bytes = compute_hash inputs in 
    let my_sig : signature = sign_hash data_hash in

    let p: NFTMINTER.NftMinterSimple.txAuthInput = {
      userAddress = inputs.user;   // user address (used to check nonce)
      expirationBlock = inputs.expiration;  // expiration date
      //contractAddress = inputs.functioncall_contract;  // calldata contract address
      // functionName = inputs.functioncall_name;   // name of the entrypoint of the calldata (for example "%mint")
      functionArgs = functioncall_params_bytes;   // arguments for the entrypoint of the calldata 
      signerPublicKey = inputs.public_key;     // public key that signed the payload 
      signature = my_sig;   // signature of the payload signed by the given public key
    } in
    // EXEC_GATED_CALLDATA entrypoint call 
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract nftminter_contract (Mint_gated p) 0tez in
    let () = AssertHelper.tx_success r in
    // VERIFY modified storage
    let current_storage = Test.Next.Typed_address.get_storage nftminter_taddr in
    let () = Assert.assert (current_storage.admin = owner3) in
    let () = 
        match Big_map.find_opt 6n current_storage.siggated_extension.ledger with
        | Some ownr6 -> Assert.assert (ownr6 = inputs.functioncall_params.owner) 
        | None -> Test.Next.Assert.failwith "Wrong owner ! Mint did not work"
    in
    ()

let test_signermanagermultisig_change_signer =
    let (owner1, owner2, owner3, owner4, op1, op2, op3) = Bootstrap.boot_accounts() in
    // DEPLOY SignerManager
    let initial_storage = { 
        signerAddress = localsigner.address;
        pause = false;
        owners= Big_map.literal([(owner1, true)]);
        proposals= (Big_map.empty : (nat, NexeraIDSignerManager.SignerManagerMultisig.proposal) big_map);
        next_proposal_id=0n;
        threshold=1n;
    } in
    let {taddr = signer_manager_taddr; code = _ ; size = _} = Test.Next.Originate.contract (contract_of NexeraIDSignerManager.SignerManagerMultisig) initial_storage 0tez in
    let signer_manager_contract = Test.Next.Typed_address.to_contract signer_manager_taddr in
    let signer_manager_address : address = Tezos.address signer_manager_contract in

    // DEPLOY NFTMINTER
    let orig_nftminter = NftMinterHelper.boot_nftminter(owner3, localsigner.address, owner3, owner1, owner2, owner3, owner4, op1, op2, op3) in
    let {taddr = nftminter_taddr; code = _ ; size = _} = orig_nftminter in 
    let nftminter_contract = Test.Next.Typed_address.to_contract nftminter_taddr in
    let nftminter_address : address = Tezos.address nftminter_contract in

    // Set Signer Manager 
    let () = Test.set_source owner3 in
    let r = Test.transfer_to_contract nftminter_contract (SetSigner signer_manager_address) 0tez in
    let () = AssertHelper.tx_success r in

    // [Signer Manager] Add Owner in multisig  =>  PROPOSAL 0
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let next_proposal_id = current_storage.next_proposal_id in
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (CreateAddOwnerProposal owner2) 0tez in
    let () = AssertHelper.tx_success r in
    let r = Test.transfer_to_contract signer_manager_contract (ValidateProposal (next_proposal_id, true)) 0tez in
    let () = AssertHelper.tx_success r in


    // [Signer Manager] Add Owner in multisig  => PROPOSAL 1
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let next_proposal_id = current_storage.next_proposal_id in
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (CreateAddOwnerProposal owner4) 0tez in
    let () = AssertHelper.tx_success r in
    let r = Test.transfer_to_contract signer_manager_contract (ValidateProposal (next_proposal_id, true)) 0tez in
    let () = AssertHelper.tx_success r in

    // [Signer Manager] Change threshold in multisig  => PROPOSAL 2
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let next_proposal_id = current_storage.next_proposal_id in
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (CreateSetThresholdProposal 2n) 0tez in
    let () = AssertHelper.tx_success r in
    let r = Test.transfer_to_contract signer_manager_contract (ValidateProposal (next_proposal_id, true)) 0tez in
    let () = AssertHelper.tx_success r in

    // [Signer Manager] ChangeSigner proposal in multisig  => PROPOSAL 3
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let next_proposal_id = current_storage.next_proposal_id in
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (CreateNewSignerProposal owner1) 0tez in
    let () = AssertHelper.tx_success r in

    // VERIFY proposal status
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = 
        match Big_map.find_opt next_proposal_id current_storage.proposals with
        | Some prop -> Assert.assert (prop.status = Pending) 
        | None -> Test.Next.Assert.failwith "createNewSignerProposal did not work"
    in

    // [Signer Manager] Create proposal in multisig  
    let () = Test.set_source owner4 in
    let r = Test.transfer_to_contract signer_manager_contract (ValidateProposal (next_proposal_id, true)) 0tez in
    let () = AssertHelper.tx_success r in

    // VERIFY proposal status
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = 
        match Big_map.find_opt next_proposal_id current_storage.proposals with
        | Some prop -> 
            let () = Assert.assert (prop.status = Pending) in
            let () = match Map.find_opt owner4 prop.agreements with
            | None -> Test.Next.Assert.failwith "validateProposal did not work"
            | Some x -> Assert.assert x 
            in
            ()
        | None -> Test.Next.Assert.failwith "createNewSignerProposal did not work"
    in

    // [Signer Manager] Validate proposal in multisig  
    let () = Test.set_source owner2 in
    let r = Test.transfer_to_contract signer_manager_contract (ValidateProposal (next_proposal_id, true)) 0tez in
    let () = AssertHelper.tx_success r in

    // VERIFY proposal status & Sum(areements) = threshold
    let current_storage = Test.Next.Typed_address.get_storage signer_manager_taddr in
    let () = 
        match Big_map.find_opt next_proposal_id current_storage.proposals with
        | Some prop -> 
            let () = Assert.assert (prop.status = Executed) in
            let accepted_ones (acc, elt: nat * (address * bool)) = if elt.1 then acc + 1n else acc in 
            let nb_answers = Map.fold accepted_ones prop.agreements 0n in
            let () = Assert.assert (nb_answers = current_storage.threshold) in
            ()
        | None -> Test.Next.Assert.failwith "createNewSignerProposal did not work"
    in

    // [Signer Manager] Validate already executed) proposal  
    let () = Test.set_source owner1 in
    let r = Test.transfer_to_contract signer_manager_contract (ValidateProposal (next_proposal_id, true)) 0tez in
    let () = AssertHelper.string_failure r NexeraIDSignerManager.SignerManagerMultisig.Errors.already_executed in
    // let exp_date : timestamp = ("1970-01-01t00:10:00Z" : timestamp) in
    ()
