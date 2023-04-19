# Clarity Functions

The main function is about verifying that a transaction was mined in a certain bitcoin block. The verification happens in two steps:

1. compare the provided block header information with the actual chain
2. compare the merkle root from the provided merkle proof with the merkle root of the provided block header

### Was Tx Mined

These are the main functions that can be used to verify that a tx was mined in a given bitcoin block.

The block header can be provided as an object with header details or as a buffer.

* `was-tx-mined-compact` (header as a buffer)
* `was-tx-mined` (header as an object) Both functions take the following arguments in the same order:

1. Bitcoin block height
2. Raw tx hex
3. Bitcoin block header either as hex or as a tuple
4. Merkle proof&#x20;

The header object has the following properties using the reverse hex of the shown values in the bitcoin explorer:

* version: (buff 4)
* parent: (buff 32)
* merkle-root: (buff 32)
* timestamp: (buff 4)
* nbits: (buff 4)
* nonce: (buff 4)

### Verification Functions for Transactions in Bitcoin Block

The verification in the main function happens in two steps:

1. verify that the hash of the given header is equal to the header hash of the given block height
2. verify that the given merkle proof for the given transaction id results in the merkle root contained in the header

* `verify-block-header`
* `verify-merkle-proof`

### Helper Function for Tx Verification

Once the tx id was confirmed to be mined in the given block, the inputs and outputs of the tx can be used to trigger certain actions in a smart contract. To verify e.g. that an input is indeed an input of the verified tx id, the hash of a transaction buffer must match the tx id. Then the inputs and outputs of the transaction can be used either

* by parsing the transaction buffer into an object with inputs, outputs, timelock, etc. or
* by concatinating the transaction object to a buffer with the correct hash.
