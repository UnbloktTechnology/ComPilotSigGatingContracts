import { Parser, packDataBytes, MichelsonData, MichelsonType } from '@taquito/michel-codec';

export function convert_timestamp(tt : string) {
    const data: MichelsonData = {
        string: tt
    };
    const typ: MichelsonType = {
        prim: "timestamp"
    };
    const packed = packDataBytes(data, typ);
    return packed.bytes;
}
    
export function convert_key(key_str : string) {
    const data: MichelsonData = {
        string: key_str
    };
    const typ: MichelsonType = {
        prim: "key"
    };
    const packed = packDataBytes(data, typ);
    return packed.bytes;
}
    
export function convert_nat(nat_str : string) {
    const data: MichelsonData = {
        int: nat_str
    };
    const typ: MichelsonType = {
        prim: "nat"
    };
    const packed = packDataBytes(data, typ);
    return packed.bytes;
}
    
export function convert_string(str : string) {
    const data: MichelsonData = {
        string: str
    };
    const typ: MichelsonType = {
        prim: "string"
    };
    const packed = packDataBytes(data, typ);
    return packed.bytes;
}
    
export function convert_address(addr_str : string) {
    const data: MichelsonData = {
        string: addr_str
    };
    const typ: MichelsonType = {
        prim: "address"
    };
    const packed = packDataBytes(data, typ);
    return packed.bytes;
}

export function convert_mint(owner_str : string, token_id : string ) {
    const data: MichelsonData = [{
        string: owner_str,
        int: token_id
    }];
    const typ: MichelsonType = {
        prim: 'pair',
        args: [
            { prim: 'address' },
            { prim: 'nat' }
        ]
    };
    const packed = packDataBytes(data, typ);
    return packed.bytes;
    // const type = `(pair address nat)`;
    // // We first use the `Parser` class and its `parseMichelineExpression` method to transform the Michelson data and type into their JSON representation
    // const p = new Parser();
    // const dataJSON = p.parseMichelineExpression(data);
    // const typeJSON = p.parseMichelineExpression(type);
    // console.log(dataJSON)
}