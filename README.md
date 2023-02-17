# Introduction

## Clarity Functions

The main function is about verifying that a transaction was mined in a certain bitcoin block. The verification happens in two steps:
1. compare the provided block header information with the actual chain
2. compare the merkle root from the provided merkle proof with the merkle root of the provided block header

### Was Tx Mined?
These are the main functions that can be used to verify that a tx was mined in a given bitcoin block.

The block header can be provided as an object with the header details or as a buffer.

* was-tx-mined-compact (header as a buffer)
* was-tx-mined (header as an object)

Both functions take the following arguments in the same order:
1. Bitcoin block height
2. Raw tx hex
3. Bitcoin block header either as hex or as a tuple
4. Merkle proof

### Verification Functions for Transactions in Bitcoin Block

The verification happens in two steps:
1. verify that the hash of the given header is equal to the header hash of the given block height
2. verify that the given merkle proof for the given transaction id results in the merkle root contained in the header
   
* verify-block-header
* verify-merkle-proof

### Helper Function for Tx Verification
Once the tx id was confirmed to be mined in the given block, the inputs and outputs of the tx can be used to trigger certain actions in a smart contract. To verify e.g. that an input is indeed an input of the verified tx id, the hash of a transaction buffer must match the tx id. Then the inputs and outputs of the transaction can be used either 
* by parsing the transaction buffer into an object with inputs, outputs, timelock, etc. or
* by concatinating the transaction object to a buffer with the correct hash.

## Examples

### Send to First Input
This example sends an amount of STX to the sender of a bitcoin transaction using p2pkh addresses

1. Deploy all contracts  
```
clarinet integrate
```
2. Call deployment plan to send 0.1 BTC
```
clarinet deployments apply -p deployments/sent-btc.devnet-plan.yaml
```
3. Copy the shown tx hex and paste it in data_txHex.ts
4. Wait for the transaction to be confirmed.
5. Open bitcoin explorer at localhost:8000 and search for the block with the transaction. There is only 1 block with 3 transactions, that is yours.
6. Inspect the block details as JSON and copy the block details to data_block.ts
7. Copy the transactions ids to data_txIds.ts
8. Generate deployment plan for the stacks transaction by running 
```
npx deno src/generatePlan.ts > deployments/send-to-first-input-plan.yaml
``` 
9. Call deployment plan to send STX to the bitcoin sender
```
clarinet deployments apply -p deployments/sent-to-first-input-plan.yaml
```
10. Check the stacks explorer at localhost: 8001 about the result