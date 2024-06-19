(* Assert contract call results in failwith with given string *)
let string_failure (res : test_exec_result) (expected : string) : unit =
    let expected = Test.Next.Michelson.eval expected in
    match res with
        | Fail (Rejected (actual,_)) -> Test.Next.Assert.assert (actual = expected)
        | Fail (Balance_too_low _err) -> Test.Next.Assert.failwith "contract failed: balance too low"
        | Fail (Other s) -> Test.Next.Assert.failwith s
        | Success _ -> Test.Next.Assert.failwith "Transaction should fail"

        (* Assert contract result is successful *)
let tx_success (res: test_exec_result) : unit =
    match res with
        | Success(_) -> ()
        | Fail (Rejected (error,_)) ->
            let () = Test.Next.IO.log(error) in
            Test.Next.Assert.failwith "Transaction should not fail"
        | Fail _ -> Test.Next.Assert.failwith "Transaction should not fail"

(* Assert contract call results in failwith with given `<string_error_message> <extra_address_message>` format *)
let string_address_failure (res : test_exec_result) (expected : string) (expected_address : address) : unit =
    match res with
        | Fail (Rejected (actual,_)) -> 
            let ec : string * address = Test.Next.Michelson.decompile actual in
            let () = Test.Next.Assert.assert (ec.0 = expected) in
            Test.Next.Assert.assert (ec.1 = expected_address)
        | Fail (Balance_too_low _err) -> Test.Next.Assert.failwith "contract failed: balance too low"
        | Fail (Other s) -> Test.Next.Assert.failwith s
        | Success _ -> Test.Next.Assert.failwith "Transaction should fail"
