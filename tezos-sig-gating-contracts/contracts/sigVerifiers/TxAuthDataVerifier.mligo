module Verifier = struct
    type storage = {
        owner: address;
        signerAddress: address;
        result: bool option;
    }
    type ret = operation list * storage

    module Errors = struct
        let only_owner = "OnlyOwner"
        let zero_address  = "BaseTxAuthDataVerifier: new signer is the zero address"
        let block_expired = "BlockExpired"
        let invalid_signature = "InvalidSignature"
    end

    type txAuthData = {
        // chainID: nat;
        // nonce: nat;
        blockExpiration: timestamp;
        contractAddress: address;
        userAddress: address;
        functionCallData: bytes
    }

    [@entry]
    let setSigner(newSigner: address) (s: storage) : ret =
        let _ = Assert.Error.assert (Tezos.get_sender() = s.owner) Errors.only_owner in
        // let _ = assert_with_error (newSigner <> 0) zero_address in  
        let op = Tezos.emit "%setSigner" newSigner in
        [op], { s with signerAddress = newSigner}

    [@view]
    let txAuthDataSignerAddress(_p: unit)(s: storage) : address = 
        s.signerAddress

    /// @notice Generates a hash of the given `TxAuthData`
    /// @param _txAuthData The transaction authentication data to hash
    /// @return The keccak256 hash of the encoded `TxAuthData`
    let getMessageHash(authData: txAuthData) : bytes =
        Crypto.keccak (
                Bytes.pack authData
                // (
                //     _txAuthData.chainID,
                //     _txAuthData.nonce,
                //     _txAuthData.blockExpiration,
                //     _txAuthData.contractAddress,
                //     _txAuthData.userAddress,
                //     _txAuthData.functionCallData
                // )
            )


    type verifyTxAuthData_param = {
        msgData: bytes * timestamp * key * signature;
        // msgData: bytes;
        userAddress: address; 
    }
    [@entry]
    let verifyTxAuthData (p: verifyTxAuthData_param)(s: storage) : ret = 
        let (data, expiration, k, signature) : bytes * timestamp * key * signature = p.msgData in
        let _ = Assert.Error.assert (Tezos.get_now() < expiration) Errors.block_expired in
        // let message : txAuthData = {
        //     // chainID = block.chainid,
        //     // nonce = userNonce,
        //     blockExpiration = expiration;
        //     contractAddress = Tezos.get_self_address();
        //     userAddress = p.userAddress;
        //     functionCallData = data; //argsWithSelector;
        // } in
        // /// Get Hash
        // let messageHash = getMessageHash(message) in
        // change format ?
        // let ethSignedMessageHash = toEthSignedMessageHash(messageHash) in
        let kh : key_hash = Crypto.hash_key k in
        let _signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in
        let is_valid = Crypto.check k signature data in 
        let _ = Assert.Error.assert (is_valid) Errors.invalid_signature in
        // Verify Signature
            // !SignatureChecker.isValidSignatureNow(
            //     s.signerAddress,
            //     messageHash,
            //     signature
            // )

        [], { s with result=Some(true) }
end