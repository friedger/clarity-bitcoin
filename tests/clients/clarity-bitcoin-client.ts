import { Tx, Account, types } from "../deps.ts";

export const Error = {
  ERR_PROOF_TOO_SHORT: 8,
};

export function parseTx(tx: string, deployer: Account) {
  return Tx.contractCall("clarity-bitcoin", "parse-tx", [tx], deployer.address);
}

export function parseWtx(wtx: string, calculateTxid: boolean, deployer: Account) {
  return Tx.contractCall("clarity-bitcoin", "parse-wtx", [wtx, types.bool(calculateTxid)], deployer.address);
}

export function parseBlockHeader(headerBuff: Uint8Array, deployer: Account) {
  return Tx.contractCall(
    "clarity-bitcoin",
    "parse-block-header",
    [types.buff(headerBuff)],
    deployer.address
  );
}

export function verifyMerkleProof(
  txId: Uint8Array,
  merkleRoot: Uint8Array,
  merkleProof: {
    hashes: Uint8Array[];
    txIndex: number;
    treeDepth: number;
  },
  deployer: Account
) {
  const reverseTxId = txId.reverse();
  return Tx.contractCall(
    "clarity-bitcoin",
    "verify-merkle-proof",
    [
      types.buff(reverseTxId),
      types.buff(merkleRoot),
      types.tuple({
        hashes: types.list(merkleProof.hashes.map((h) => types.buff(h))),
        "tx-index": types.uint(merkleProof.txIndex),
        "tree-depth": types.uint(merkleProof.treeDepth),
      }),
    ],
    deployer.address
  );
}
