# Introduction

## Clarity Functions

### Was Tx Mined?
These are the main functions that can be used to verify that a tx was mined in a given bitcoin block.

The block header can be provided as an object with the header details or as a buffer.

* was-tx-mined-header
* was-tx-mined-header-buff

### Verification Functions for Block
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
3. Wait for the transaction to be confirmed
4. open bitcoin explorer at localhost:8000 and search for the block with the transaction. 
5. Inspect the block details and edit generateMerkleProof.ts
6. Generate merkle proof for the tx by running 
```
npx deno src/generateMerkleProof.ts
``` 
7. edit sent-to-first-input.ts with 
   * the block height
   * the hex value of the transaction from the json of the block in the block explorer.
   * the block header as hex created using learnmeabitcoin.com/tools
   * the proof from generate proof script 
