import { Cl } from "@stacks/transactions";
import { bytesToHex, hexToBytes } from "../utils";

export const Error = {
  ERR_PROOF_TOO_SHORT: 8,
};

export function parseTx(tx: string, deployer: string) {
  return simnet.callReadOnlyFn(
    "clarity-bitcoin",
    "parse-tx",
    [Cl.bufferFromHex(tx)],
    deployer
  );
}

export function parseWtx(
  wtx: string,
  calculateTxid: boolean,
  deployer: string
) {
  return simnet.callReadOnlyFn(
    "clarity-bitcoin",
    "parse-wtx",
    [Cl.bufferFromHex(wtx), Cl.bool(calculateTxid)],
    deployer
  );
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

export function wasTxMinedCompact(
  bitcoinHeight: number,
  txHex: string,
  headerHex: string,
  merkleProof: {
    hashes: Uint8Array[];
    txIndex: number;
    treeDepth: number;
  },
  sender: string
) {
  return simnet.callReadOnlyFn(
    "clarity-bitcoin",
    "was-tx-mined-compact",
    [
      Cl.uint(bitcoinHeight),
      Cl.buffer(hexToBytes(txHex)),
      Cl.buffer(hexToBytes(headerHex)),
      Cl.tuple({
        hashes: Cl.list(merkleProof.hashes.map((h) => Cl.buffer(h))),
        "tx-index": Cl.uint(merkleProof.txIndex),
        "tree-depth": Cl.uint(merkleProof.treeDepth),
      }),
    ],
    sender
  );
}

export function wasSegwitTxMinedCompact(
  bitcoinHeight: number,
  txHex: string,
  headerHex: string,
  txIndex: number,
  treeDepth: number,
  wproof: Uint8Array[],
  witnessMerkleRoot: string,
  witnessReservedValue: string,
  coinbaseTxHex: string,
  coinbaseProof: Uint8Array[],
  sender: string
) {
  return simnet.callReadOnlyFn(
    "clarity-bitcoin",
    "was-segwit-tx-mined-compact",
    [
      Cl.uint(bitcoinHeight),
      Cl.buffer(hexToBytes(txHex)),
      Cl.buffer(hexToBytes(headerHex)),
      Cl.uint(txIndex),
      Cl.uint(treeDepth),
      Cl.list(wproof.map(Cl.buffer)),
      Cl.buffer(hexToBytes(witnessMerkleRoot)),
      Cl.buffer(hexToBytes(witnessReservedValue)),
      Cl.buffer(hexToBytes(coinbaseTxHex)),
      Cl.list(coinbaseProof.map(Cl.buffer)),
    ],
    sender
  );
}
