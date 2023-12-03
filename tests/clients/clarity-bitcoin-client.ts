import { tx as Tx} from "@hirosystems/clarinet-sdk";
import { Cl, callReadOnlyFunction } from "@stacks/transactions";

export const Error = {
  ERR_PROOF_TOO_SHORT: 8,
};

export function parseTx(tx: string, deployer: string) {
  return simnet.callReadOnlyFn("clarity-bitcoin", "parse-tx", [Cl.bufferFromHex(tx)], deployer);
}

export function parseWtx(wtx: string, calculateTxid: boolean, deployer: string) {
  return simnet.callReadOnlyFn("clarity-bitcoin", "parse-wtx", [Cl.bufferFromHex(wtx), Cl.bool(calculateTxid)], deployer);
}

export function parseBlockHeader(headerBuff: Uint8Array, deployer: string) {
  return simnet.callReadOnlyFn(
    "clarity-bitcoin",
    "parse-block-header",
    [Cl.buffer(headerBuff)],
    deployer
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
  deployer: string
) {
  const reverseTxId = txId.reverse();
  return simnet.callReadOnlyFn(
    "clarity-bitcoin",
    "verify-merkle-proof",
    [
      Cl.buffer(reverseTxId),
      Cl.buffer(merkleRoot),
      Cl.tuple({
        hashes: Cl.list(merkleProof.hashes.map((h) => Cl.buffer(h))),
        "tx-index": Cl.uint(merkleProof.txIndex),
        "tree-depth": Cl.uint(merkleProof.treeDepth),
      }),
    ],
    deployer
  );
}
