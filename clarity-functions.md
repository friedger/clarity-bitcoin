# Clarity Functions

The main function is about verifying that a non-segwit transaction was mined in a certain bitcoin block. The verification happens in two steps:

1. compare the provided block header information with the actual chain
2. compare the merkle root from the provided merkle proof with the merkle root of the provided block header

### Was Tx Mined

These are the main functions that can be used to verify that a tx was mined in a given bitcoin block.

The block header can be provided as an object with the header details or as a buffer.

* `was-tx-mined-compact` (header as a buffer)
* `was-tx-mined` (header as an object)
* `was-segwit-tx-mined-compact` (header as buffer)

The two functions for non-segwit transaction take the following arguments in the same order:

1. Bitcoin block height
2. Raw tx hex
3. Bitcoin block header either as hex or as a tuple
4. Merkle proof

The header object has the following properties using the reverse hex of the shown values in the bitcoin explorer:

* version: (buff 4)
* parent: (buff 32)
* merkle-root: (buff 32)
* timestamp: (buff 4)
* nbits: (buff 4)
* nonce: (buff 4)

The function for segwit transaction takes the following arguments:

1. Bitcoin block height
2. Raw tx hex
3. Bitcoin block header either as hex
4. Index of the tx in the block
5. Merkle tree depth of the block
6. Merkle proof for witness data
7. Merkle root for witness data stored in the coinbase tx of the block
8. Reserved data value used in the coinbase tx
9. Coinbase tx in non-segwit format
10. Merkle proof of the coinbase tx

### Verification Functions for Non-Segwit Transactions in Bitcoin Block

The verification in the main function happens in two steps:

1. verify that the hash of the given header is equal to the header hash of the given block height
2. verify that the given merkle proof for the given transaction id results in the merkle root contained in the header

* `verify-block-header`
* `verify-merkle-proof`

### Verification Functions for Segwit Transactions in Bitcoin Block

The verification happens in three steps:

1. verify that the coinbase tx was mined using the verification for non-segwit transactions as described above.
2. verify that the Merkle root for witness data is contained in the coinbase tx.
3. verify that the Merkle proof for witness data is valid for the wtxid of the transaction.

* `get-commitment-scriptPubKey`

### Helper Function for Tx Verification

Once the tx id was confirmed to be mined in the given block, the inputs and outputs of the tx can be used to trigger certain actions in a smart contract. To verify e.g. that an input is indeed an input of the verified tx id, the hash of a transaction buffer must match the tx id. Then the inputs and outputs of the transaction can be used either

* by parsing the transaction buffer into an object with inputs, outputs, timelock, etc. or
* by concatenating the transaction object to a buffer with the correct hash.
