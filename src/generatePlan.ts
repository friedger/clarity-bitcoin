import { SHA256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";
import { hexReverse } from "../tests/utils.ts";
import { hexStringBtcHash, MerkleTree } from "./merkleTree.ts";
import { block } from "./data_block.ts";
import { txIds } from "./data_txIds.ts";
import { txHex } from "./data_txHex.ts";


generatePlan(txIds, txHex);

export function generatePlan(txIds: string[], txHex: string) {
  const reversedTxIds = txIds.map(hexReverse);
  const sha256 = new SHA256();
  const txId = hexStringBtcHash(sha256)(txHex);
  const txIndex = reversedTxIds.findIndex((t) => t === txId);
  const merkleTree = new MerkleTree(reversedTxIds, hexStringBtcHash(sha256));
  const proofElements = merkleTree.getProofElements(txIndex);
  const proof = `(tuple (tx-index u${txIndex}) (hashes (list 0x${proofElements.join(
    " 0x"
  )})) (tree-depth u${merkleTree.getTreeDepth()}))`;
  // generate header hex
  const headerHex =
    hexReverse(block.versionHex) +
    hexReverse(block.previousblockhash) +
    hexReverse(block.merkleroot) +
    hexReverse(block.time.toString(16).padStart(8, "0")) +
    hexReverse(block.bits) +
    hexReverse(block.nonce.toString(16).padStart(8, "0"));

  console.log(`---
id: 0
name: Devnet deployment
network: devnet
stacks-node: "http://localhost:20443"
bitcoin-node: "http://devnet:devnet@localhost:18443"
plan:
  batches:
    - id: 0
      transactions:
        - contract-call:
            contract-id: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.send-to-first-input
            expected-sender: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
            method: send-to-first-input
            parameters:
              - u${block.height}
              - 0x${txHex}
              - 0x${headerHex}
              - ${proof}
            cost: 10000
      epoch: "2.1"
`);
}
