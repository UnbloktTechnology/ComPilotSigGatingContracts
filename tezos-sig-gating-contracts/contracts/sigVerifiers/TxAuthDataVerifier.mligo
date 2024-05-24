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
        let unmatch_expiration_date = "UnmatchExpirationDate"
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
        let (payload, expiration, k, signature) : bytes * timestamp * key * signature = p.msgData in
        // let () = failwith payload in
                // // let data_size = Bytes.size data in
        // let data = Bytes.slice 32n data_size data in

        // EXPIRATION DATE
        let expiration_date = Bytes.slice 0n 4n payload in
        let exp_timestamp: timestamp = match (Bytes.unpack expiration_date: timestamp option) with
        | None -> failwith "Wrong time format" 
        | Some tt -> tt
        in
        let _ = Assert.Error.assert (exp_timestamp = expiration) Errors.unmatch_expiration_date in
        let _ = Assert.Error.assert (Tezos.get_now() < expiration) Errors.block_expired in

        // PUBLIC KEY
        let dataKey = Bytes.slice 4n 39n payload in // 050a0000002100988e7ca0d3e87fd497699d2a757f6f2e6f7b63de2e0440b9df6a2cc87e184c2e
        let key: key = match (Bytes.unpack dataKey: key option) with
        | None -> failwith "Wrong key format" 
        | Some k -> k
        in
        let () = assert_with_error (key = k) "missmatch key" in

        // FUCNTIONCALL - TODO
        let dataFunctionCall = Bytes.slice 43n 4n payload in // 050a0000002100988e7ca0d3e87fd497699d2a757f6f2e6f7b63de2e0440b9df6a2cc87e184c2e
        // let key: key = match (Bytes.unpack dataKey: key option) with
        // | None -> failwith "Wrong key format" 
        // | Some k -> k
        // in
        let () = assert_with_error (dataFunctionCall = 0x01020304) "missmatch functioncall" in


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
        let is_valid = Crypto.check k signature payload in 
        let _ = Assert.Error.assert (is_valid) Errors.invalid_signature in
        // Verify Signature
            // !SignatureChecker.isValidSignatureNow(
            //     s.signerAddress,
            //     messageHash,
            //     signature
            // )

        [], { s with result=Some(true) }
end