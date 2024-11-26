BIP39 seeds phrase for devnet program
priority cake jelly coconut asset degree wage garden input obey drama predict

When I update a program, sometimes I have an error like this ""account data too small for instruction" (If I have added more instruction in my program), please execute this command:
```sh
  ./extend-program.sh 2to1m9qHAKQ8WdcKdKAhZJm6UkFACPgLqso3FPsuHe3M ./target/deploy/solana_movie.so
```

If an error occurs during the deploy like this 
```sh
  =================================================================================
Recover the intermediate account's ephemeral keypair file with
`solana-keygen recover` and the following 12-word seed phrase:
=================================================================================
stairs humble toy shadow random circle matter buffalo wage timber tobacco initial
=================================================================================
To resume a deploy, pass the recovered keypair as the
[BUFFER_SIGNER] to `solana program deploy` or `solana program write-buffer'.
Or to recover the account's lamports, pass it as the
[BUFFER_ACCOUNT_ADDRESS] argument to `solana program close`.
=================================================================================
Error: Deploying program failed: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: account data too small for instruction [3 log messages]
There was a problem deploying: Output { status: ExitStatus(unix_wait_status(256)), stdout: "", stderr: "" }.
```
Please execute this commands:
```sh
  # Enter the passphrase above and generate the file buffer-keypair.json
  solana-keygen recover -o buffer-keypair.json

  # Close the account to retrieve my SOL
  solana program close buffer-keypair.json
```