import { SHA256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";
import { hexReverse } from "../tests/utils.ts";
import { hexStringBtcHash, MerkleTree } from "./utils-merkleTree.ts";

const bitcoinExplorerUrl = "http://devnet:devnet@localhost:8001";

const txId = Deno.args[0];
generatePlan(txId);

export async function generatePlan(txId: string) {
  const txDetails = await fetch(`${bitcoinExplorerUrl}/api/tx/${txId}`).then(
    (r) => r.json()
  );
  const txHex = txDetails.hex;

  const blockhash = txDetails.blockhash;
  const block = await fetch(
    `${bitcoinExplorerUrl}/api/block/${blockhash}`
  ).then((r) => r.json());
  const txIds = block.tx as string[];
  const sha256 = new SHA256();

  const txIndex = txIds.findIndex((t) => t === txId);
  const reversedTxIds = txIds.map(hexReverse);
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
