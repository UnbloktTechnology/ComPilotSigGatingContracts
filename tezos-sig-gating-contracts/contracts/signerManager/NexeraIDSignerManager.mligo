module SignerManager = struct
    type storage = {
        owner: address; // should be multisig
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

    [@entry]
    let setSigner(newSigner: address) (s: storage) : ret =
        let _ = Assert.Error.assert (Tezos.get_sender() = s.owner) Errors.only_owner in
        let op = Tezos.emit "%setSigner" newSigner in
        [op], { s with signerAddress = newSigner}

    [@view]
    let isValidSignature (p: key * bytes * signature)(s: storage) : bool =
        let (k, _data, _signature) = p in
        let kh : key_hash = Crypto.hash_key k in
        let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
        let () = Assert.Error.assert (s.signerAddress = signer_address_from_key) Errors.invalid_signer in
        true
end