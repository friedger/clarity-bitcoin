import { Clarinet, Tx, Chain, Account, types, assertEquals } from "../deps.ts";
import { hexToBytes } from "../utils.ts";

export const Error = {
  ERR_TOO_SHORT: 6,
};

export function parseTx(tx: string, deployer: Account) {
  return Tx.contractCall("clarity-bitcoin", "parse-tx", [tx], deployer.address);
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
