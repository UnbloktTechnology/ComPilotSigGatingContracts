module Verifier = struct
    type storage = {
        owner: address;
        signerAddress: address; 
        result: bool option;    // TODO - remove    
        nonces: (address, nat) big_map 
    }
    type ret = operation list * storage

    module Errors = struct
        let only_owner = "OnlyOwner"
        // let zero_address  = "BaseTxAuthDataVerifier: new signer is the zero address"
        let block_expired = "BlockExpired"
        let invalid_signature = "InvalidSignature"
        let unmatch_expiration_date = "UnmatchExpirationDate"
        let invalid_nonce = "InvalidNonce"
        let parameter_missmatch = "hash of given parameters (nonce, expiration, key, functioncall) does not match the payload hash"
    end

    type txAuthData = {
        // chainID: nat;
        nonce: nat;
        blockExpiration: timestamp;
        contractAddress: address;
        userAddress: address;
        functionCallData: bytes
    }

    let is_implicit (elt : address) : bool =
        let pack_elt : bytes = Bytes.pack elt in
        let is_imp : bytes = Bytes.sub 6n 1n pack_elt in
        (is_imp = 0x00)

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
    // let getMessageHash(authData: txAuthData) : bytes =
    //     Crypto.keccak (
    //             Bytes.pack authData
    //             // (
    //             //     _txAuthData.chainID,
    //             //     _txAuthData.nonce,
    //             //     _txAuthData.blockExpiration,
    //             //     _txAuthData.contractAddress,
    //             //     _txAuthData.userAddress,
    //             //     _txAuthData.functionCallData
    //             // )
    //         )


    type verifyTxAuthData_param = {
        msgData: bytes * nat * timestamp * bytes * key * signature;
        // msgData: bytes;
        userAddress: address; 
    }
    [@entry]
    let verifyTxAuthData (p: verifyTxAuthData_param)(s: storage) : ret = 

        
        let (payload, nonce, expiration, functioncall, k, signature) : bytes * nat * timestamp * bytes * key * signature = p.msgData in
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

        // VERIFY parameters correspond to payload hash
        let nonce_b = Bytes.pack nonce in
        let expiration_b = Bytes.pack expiration in
        let key_b = Bytes.pack k in
        let functioncall_b = functioncall in
        let expected_bytes = Bytes.concat nonce_b (Bytes.concat expiration_b (Bytes.concat key_b functioncall_b)) in
        let expected_payload = Crypto.keccak(expected_bytes) in
        let () = Assert.Error.assert (expected_payload = payload) Errors.parameter_missmatch in

        // Retrieve signer address from public key
        let kh : key_hash = Crypto.hash_key k in
        let signer_address_from_key = Tezos.address(Tezos.implicit_account kh) in

        // NONCE
        let current_nonce, new_nonces = match Big_map.find_opt p.userAddress s.nonces with
        | None -> (0n, Big_map.update p.userAddress (Some(1n)) s.nonces)
        | Some nse -> (nse, Big_map.update p.userAddress (Some(nse + 1n)) s.nonces)
        in
        let () = Assert.Error.assert (nonce = current_nonce) Errors.invalid_nonce in

        // // EXPIRATION DATE
        // let expiration_date = Bytes.slice 0n 4n payload in
        // let exp_timestamp: timestamp = match (Bytes.unpack expiration_date: timestamp option) with
        // | None -> failwith "Wrong time format" 
        // | Some tt -> tt
        // in
        // let _ = Assert.Error.assert (exp_timestamp = expiration) Errors.unmatch_expiration_date in
        let _ = Assert.Error.assert (Tezos.get_now() < expiration) Errors.block_expired in

        // // PUBLIC KEY
        // let dataKey = Bytes.slice 4n 39n payload in // 050a0000002100988e7ca0d3e87fd497699d2a757f6f2e6f7b63de2e0440b9df6a2cc87e184c2e
        // let key: key = match (Bytes.unpack dataKey: key option) with
        // | None -> failwith "Wrong key format" 
        // | Some k -> k
        // in
        // let () = Assert.Error.assert (key = k) "missmatch key" in

        // // FUCNTIONCALL - TODO
        // // let payload_size = Bytes.size payload in
        // // let dataFunctionCall = Bytes.slice 43n (abs(payload_size - 43n)) payload in
        // let dataFunctionCall = Bytes.slice 43n 4n payload in // 01020304
        // let () = Assert.Error.assert (dataFunctionCall = functioncall) "missmatch functioncall" in




        
        // VERIFY signer key corresponds to signerAddress 
        let () = if (not is_implicit(s.signerAddress)) then // case signerAddress is a smart contract
            //calls isValidSignature of the smart contract             
            let r = Tezos.call_view "isValidSignature" (k, payload, signature) s.signerAddress in
            match r with
            | None -> failwith "ERROR: unknown isValidSignature view in the smart contract"
            | Some status -> Assert.assert (status)
        else   // case signerAddress is a implicit account

            Assert.Error.assert (signer_address_from_key = s.signerAddress) "missmatch key and signerAddress"
        in

        let is_valid = Crypto.check k signature payload in 
        let _ = Assert.Error.assert (is_valid) Errors.invalid_signature in
        // Verify Signature - SignatureChecker TODO
            // !SignatureChecker.isValidSignatureNow(
            //     s.signerAddress,
            //     messageHash,
            //     signature
            // )
        // let op : operation = Tezos.get_entrypoint_opt 
        [], { s with result=Some(true); nonces=new_nonces }
end