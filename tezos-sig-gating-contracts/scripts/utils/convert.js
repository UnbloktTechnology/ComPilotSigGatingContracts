"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert_mint = exports.convert_chain_id = exports.convert_address = exports.convert_string = exports.convert_nat = exports.convert_key = exports.convert_timestamp = void 0;
const michel_codec_1 = require("@taquito/michel-codec");
function convert_timestamp(tt) {
    const data = {
        string: tt
    };
    const typ = {
        prim: "timestamp"
    };
    const packed = (0, michel_codec_1.packDataBytes)(data, typ);
    return packed.bytes;
}
exports.convert_timestamp = convert_timestamp;
function convert_key(key_str) {
    const data = {
        string: key_str
    };
    const typ = {
        prim: "key"
    };
    const packed = (0, michel_codec_1.packDataBytes)(data, typ);
    return packed.bytes;
}
exports.convert_key = convert_key;
function convert_nat(nat_str) {
    const data = {
        int: nat_str
    };
    const typ = {
        prim: "nat"
    };
    const packed = (0, michel_codec_1.packDataBytes)(data, typ);
    return packed.bytes;
}
exports.convert_nat = convert_nat;
function convert_string(str) {
    const data = {
        string: str
    };
    const typ = {
        prim: "string"
    };
    const packed = (0, michel_codec_1.packDataBytes)(data, typ);
    return packed.bytes;
}
exports.convert_string = convert_string;
function convert_address(addr_str) {
    const data = {
        string: addr_str
    };
    const typ = {
        prim: "address"
    };
    const packed = (0, michel_codec_1.packDataBytes)(data, typ);
    return packed.bytes;
}
exports.convert_address = convert_address;
function convert_chain_id(addr_str) {
    const data = {
        string: addr_str
    };
    const typ = {
        prim: "chain_id"
    };
    const packed = (0, michel_codec_1.packDataBytes)(data, typ);
    return packed.bytes;
}
exports.convert_chain_id = convert_chain_id;
function convert_mint(owner_str, token_id) {
    const data = `(Pair "${owner_str}" ${token_id})`;
    const type = `(pair address nat)`;
    const p = new michel_codec_1.Parser();
    const dataJSON = p.parseMichelineExpression(data);
    const typeJSON = p.parseMichelineExpression(type);
    const packed = (0, michel_codec_1.packDataBytes)(dataJSON, typeJSON);
    return packed.bytes;
}
exports.convert_mint = convert_mint;
// export function convert_mint(owner_str : string, token_id : string ) {
//     const data: MichelsonData = [{
//         string: owner_str,
//         int: token_id
//     }];
//     const typ: MichelsonType = {
//         prim: 'pair',
//         args: [
//             { prim: 'address',annots:["%owner"] },
//             { prim: 'nat',annots:["%token_id"] }
//         ],
//         annots: ["%mint"]
//     };
//     const packed = packDataBytes(data, typ);
//     return packed.bytes;
// }
