module SignerManager = struct
    type storage = {
        owner: address; // should be multisig
        signerAddress: address;
    }
    type ret = operation list * storage

    module Errors = struct
        let only_owner = "OnlyOwner"
        let invalid_signer = "InvalidSigner"
    end

    [@entry]
    let setSigner(newSigner: address) (s: storage) : ret =
        let _ = Assert.Error.assert (Tezos.get_sender() = s.owner) Errors.only_owner in
        // let _ = assert_with_error (newSigner <> 0) zero_address in  
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