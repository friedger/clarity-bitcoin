# Introduction

Through Proof of Transfer the Stacks blockchain has a view on the Bitcoin network. It is limted to block header hashes of each Bitcoin block. This includes even those blocks that do not have a corresponding Stacks block e.g. for flash blocks.

The block header hash is sufficient to proof in a Clarity contract that a Bitcoin transaction was actually included in the Bitcoin block. It is just a question about providing enough information to re-build the hash. This also works for transaction with witness data.

Currently, a stateless contract is deployed on mainnet that helps to make use of this feature for transactions with and without witness data, but limited to transactions with a smaller number of inputs and outputs: https://explorer.hiro.so/txid/SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.clarity-bitcoin-lib-v4?chain=mainnet

The next sections describe the details of the library and its application.
