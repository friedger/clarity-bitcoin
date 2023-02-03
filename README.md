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