# Introduction
A Clarity library for parsing Bitcoin transactions and verifying Merkle proofs 

Based on work from (Jude Nelson)[https://github.com/jcnelson/clarity-bitcoin] and from the team at (Trust Maschine)[https://github.com/Trust-Machines/stacks-sbtc/tree/main/sbtc-mini].

Deployments on mainnet:
* (Version 4)[https://explorer.hiro.so/txid/0x7442d23307f2d7e9ec67eb1d63d643321cdc8bb603a375888f9c1f5bed9fb5d8?chain=mainnet]: Added support for segwit transactions
* (Version 3)[https://explorer.hiro.so/txid/0xd493b9ada8899be8773d3f55b21d300ef83ac5c0dd38c8a4dd52a295bd71d539?chain=mainnet]: Uses get-burn-block-info of Clarity V2 to verify txs in flash blocks
* Version 2: Buggy - Do not use 
* (Version 1)[https://explorer.hiro.so/txid/0x8b112f2b50c1fa864997b7496aaad1e3940700309a3fdcc6c07f1c6f8b9cfb7b?chain=mainnet]: Initial version with no verification for tx in flash blocks

## Clarity Functions

The main function is about verifying that a transaction was mined in a certain bitcoin block. The verification happens in two steps:
1. compare the provided block header information with the actual chain
2. compare the merkle root from the provided merkle proof with the merkle root of the provided block header

### Was Tx Mined?
These are the main functions that can be used to verify that a tx was mined in a given bitcoin block.

The block header can be provided as an object with the header details or as a buffer.

* was-tx-mined-compact (header as a buffer)
* was-tx-mined (header as an object)
* was-segwit-tx-mined-compact (header as buffer) 

The two functions for non-segwit transaction take the following arguments in the same order:
1. Bitcoin block height
2. Raw tx hex
3. Bitcoin block header either as hex or as a tuple
4. Merkle proof

The header object has the following properties using the reverse hex of the shown values in the bitcoin explorer:
- version: (buff 4)
- parent: (buff 32)
- merkle-root: (buff 32)
- timestamp: (buff 4)
- nbits: (buff 4)
- nonce: (buff 4) 
  
The function for segwit transaction takes the following arguments:
1. Bitcoin block height
2. Raw tx hex
3. Bitcoin block header either as hex
4. The index of the tx in the block
5. The Merkle tree depth of the block
6. The Merkle proof for witness data
7. The Merkle root for witness data stored in the coinbase tx of the block
8. The reserved data value used in the coinbase tx
9. The coinbase tx in non-segwit format
10. The Merkle proof of the coinbase tx

### Verification Functions for Non-Segwit Transactions in Bitcoin Block

The verification happens in two steps:
1. verify that the hash of the given header is equal to the header hash of the given block height.
2. verify that the given merkle proof for the given transaction id results in the merkle root contained in the header.
  
* verify-block-header
* verify-merkle-proof

### Verification Functions for Segwit Transactions in Bitcoin Block

The verification happens in two steps:
1. verify that the coinbase tx was mined using the verification for non-segwit transactions as decribed above.
2. verify that the Merkle root for witness data is contained in the coinbase tx.
3. verify that the Merkle proof for witness data is valid for the wtxid of the transaction.
   
* get-commitment-scriptPubKey
  
### Helper Function for Tx Verification
Once the tx id was confirmed to be mined in the given block, the inputs and outputs of the tx can be used to trigger certain actions in a smart contract. To verify e.g. that an input is indeed an input of the verified tx id, the hash of a transaction buffer must match the tx id. Then the inputs and outputs of the transaction can be used either
* by parsing the transaction buffer into an object with inputs, outputs, timelock, etc. or
* by concatinating the transaction object to a buffer with the correct hash.

## Examples

As requirements, `clarinet` and `deno` needs to be installed.
### Send to First Input
This example sends an amount of STX to the sender of a bitcoin transaction using p2pkh addresses. It exists in two version, one using the header object, the other the header buffer (compact).

1. Deploy all contracts 
```
clarinet integrate
```
2. Call deployment plan to send 0.1 BTC
```
clarinet deployments apply -p deployments/send-btc.devnet-plan.yaml --no-dashboard
```
3. Confirm to continue
4. Copy the tx hex from the Transaction
5. Press N to mine the block in the clarinet dashboard
6. Generate deployment plan for the stacks transaction by running the following command with the copied tx hex (replace `01..txhex`). (The generation script takes care of reversing the properties of the block header.)
```
deno run --allow-net ./src/generatePlan.ts 01..txhex > deployments/send-to-first-input-plan.yaml
```
7. Call deployment plan to send STX to the bitcoin sender
```
clarinet deployments apply -p deployments/sent-to-first-input-plan.yaml
```
8.  Check the stacks explorer at localhost: 8001 about the result for the transactions of the two versions
