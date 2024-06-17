let boot_accounts () =
    let () = Test.Next.State.reset 8n ([10000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez; 4000000tez] : tez list) in
    let accounts =
        Test.Next.Account.address 1n,
        Test.Next.Account.address 2n,
        Test.Next.Account.address 3n,
        Test.Next.Account.address 4n,
        Test.Next.Account.address 5n,
        Test.Next.Account.address 6n,
        Test.Next.Account.address 7n
    in
    accounts
