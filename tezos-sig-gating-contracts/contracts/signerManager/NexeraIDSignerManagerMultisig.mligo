module SignerManagerMultisig = struct

    type status = Pending | Executed

    type proposal = {
        proposal_id: nat;
        signer: address;
        expiration: timestamp;
        agreements: (address, bool) map;
        status: status
    }
    
    type storage = {
        owner: address; // should be multisig
        owners: (address, bool) big_map;
        proposals: (nat, proposal) big_map;
        next_proposal_id: nat;
        threshold: nat;
        pauser: address;
        signerAddress: address;
        pause: bool
    }
    type ret = operation list * storage

    module Errors = struct
        let only_owner = "OnlyOwner"
        let not_pauser = "OnlyPauser"
        let already_paused= "AlreadyPaused"
        let already_unpaused= "AlreadyUnpaused"
        let invalid_signer = "InvalidSigner"

        let unknown_proposal = "UnknownProposal"
        let expired = "Expired"
        let already_answered = "AlreadyAnswered"
        let already_executed = "AlreadyExecuted"
    end

    [@entry]
    let pause(_p: unit) (s: storage) : ret =
        let _ = Assert.Error.assert (Tezos.get_sender() = s.pauser) Errors.not_pauser in
        let _ = Assert.Error.assert (s.pause = false) Errors.already_paused in
        let op = Tezos.emit "%pause" true in
        [op], { s with pause = true}

    [@entry]
    let unpause(_p: unit) (s: storage) : ret =
        let _ = Assert.Error.assert (Tezos.get_sender() = s.pauser) Errors.not_pauser in
        let _ = Assert.Error.assert (s.pause = true) Errors.already_unpaused in
        let op = Tezos.emit "%pause" false in
        [op], { s with pause = false}

    [@view]
    let isValidSignature (p: key * bytes * signature)(s: storage) : bool =
        let (k, _data, _signature) = p in
        let kh : key_hash = Crypto.hash_key k in
        let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
        let () = Assert.Error.assert (s.signerAddress = signer_address_from_key) Errors.invalid_signer in
        true
    
    [@entry]
    let addOwner(newOwner: address) (s: storage) : ret =
        let () = match Big_map.find_opt (Tezos.get_sender()) s.owners with 
        | None -> failwith Errors.only_owner
        | Some auth -> Assert.Error.assert auth Errors.only_owner in
        let op = Tezos.emit "%addOwner" newOwner in
        [op], { s with owners = Big_map.update newOwner (Some(true)) s.owners }

    [@entry]
    let removeOwner(newOwner: address) (s: storage) : ret =
        let () = match Big_map.find_opt (Tezos.get_sender()) s.owners with 
        | None -> failwith Errors.only_owner
        | Some auth -> Assert.Error.assert auth Errors.only_owner in
        let op = Tezos.emit "%removeOwner" newOwner in
        [op], { s with owners = Big_map.remove newOwner s.owners }

    [@entry]
    let createProposal(newSigner: address) (s: storage) : ret =
        let () = match Big_map.find_opt (Tezos.get_sender()) s.owners with 
        | None -> failwith Errors.only_owner
        | Some auth -> Assert.Error.assert auth Errors.only_owner in
        let res : proposal = {
            proposal_id=s.next_proposal_id;
            signer=newSigner;
            expiration=Tezos.get_now() + 86400;
            agreements=(Map.empty: (address, bool) map);
            status=Pending
        } in
        let new_proposals = Big_map.add s.next_proposal_id res s.proposals in
        let op = Tezos.emit "%proposalCreated" s.next_proposal_id in
        [op], { s with next_proposal_id = s.next_proposal_id + 1n; proposals = new_proposals }

    [@entry]
    let validateProposal(proposal_id, agreement: nat * bool) (s: storage) : ret =
        let () = match Big_map.find_opt (Tezos.get_sender()) s.owners with 
        | None -> failwith Errors.only_owner
        | Some auth -> Assert.Error.assert auth Errors.only_owner in
        let p = match Big_map.find_opt proposal_id s.proposals with 
        | None -> failwith Errors.unknown_proposal
        | Some p -> p
        in
        let () = Assert.Error.assert (p.status = Pending) Errors.already_executed in
        let () = Assert.Error.assert (Tezos.get_now() < p.expiration) Errors.expired in
        let new_agreements = match Map.find_opt (Tezos.get_sender()) p.agreements with
        | Some _x -> failwith Errors.already_answered
        | None -> Map.update (Tezos.get_sender()) (Some(agreement)) p.agreements
        in
        let new_proposal = { p with agreements=new_agreements } in
        let accepted_ones (acc, elt: nat * (address * bool)) = if elt.1 then acc + 1n else acc in 
        let nb_answers = Map.fold accepted_ones new_agreements 0n in
        if nb_answers < s.threshold then
        let new_proposals= 
            Big_map.update proposal_id (Some(new_proposal)) s.proposals in
            let op = Tezos.emit "%signProposal" (proposal_id, (Tezos.get_sender()), agreement) in
            [op], { s with proposals = new_proposals }
        else
            let new_proposal = { new_proposal with status=Executed } in
            let new_proposals = Big_map.update proposal_id (Some(new_proposal)) s.proposals in
            let op = Tezos.emit "%executeProposal" (proposal_id, (Tezos.get_sender()), p.signer) in
            [op], { s with proposals = new_proposals; signerAddress=p.signer }

end