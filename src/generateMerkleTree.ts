import { MerkleTree } from "./merkleTree.ts";
import { hexReverse } from "../tests/utils.ts";
import { SHA256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";

const txIds = [
  "fa5a48c40ff2a465cbd6508c21e3d74899d39cb489ec3a1914b603d2fcce27c0",
  "7edc3a1cca5f3ec28b20d3fc2ae14aece5f46cfc1dc501eeaa615dd6c5832e45",
  "cb2e23bc96049cb71489f7e98817888a927b618e9d21700120c59b4f762f16f1",
];

// const txIds = [
//   "bcdc61cbecf6137eec5c8ad4047fcdc36710e77e404b17378a33ae605920afe1",
//   "f7f4c281ee20ab8d1b00734b92b60582b922211a7e470accd147c6d70c9714a3",
//   "b5f6e3b217fa7f6d58081b5d2a9a6607eebd889ed2c470191b2a45e0dcb98eb0",
//   "4206f171f06913b1d40597edcaf75780559231fb504c49ba85a4a9ae949e8b95",
//   "a1a6ad6ff321c76496a89b6a4eb9bcfb76b9e068b677d5c7d427c51ca08c273d",
//   "89c82039452c14a9314b5834e5d2b9241b1fdccdb6e4f4f68e49015540faaf95",
//   "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9",
//   "57eef4da5edacc1247e71d3a93ed2ccaae69c302612e414f98abf8db0b671eae",
//   "8d30eb0f3e65b8d8a9f26f6f73fc5aafa5c0372f9bb38aa38dd4c9dd1933e090",
//   "13e3167d46334600b59a5aa286dd02147ac33e64bfc2e188e1f0c0a442182584"
// ];

const txIndex = 2; // starting with 0

const reversedTxIds = txIds.map(hexReverse);
const sha256 = new SHA256();

const hexStringBtcHash = (valueToBeHashed: string) => {
  // hash twice
  const hash1 = sha256.init().update(valueToBeHashed, "hex").digest();
  return sha256.init().update(hash1).digest("hex");
};

const merkleTree = new MerkleTree(reversedTxIds, hexStringBtcHash);
console.log(merkleTree);
console.log(merkleTree.getRootHash());

//console.log(merkleTree.getProofElements(txIndex).map((h) => hexReverse(h)));
console.log(merkleTree.getProofElements(txIndex));

/*
const investigatedEntry = hexReverse(
  "d779e7b2954d13973046d3bcb6764dbf894497907d177f5765ab3cae8471d869"
);
const proofElements = merkleTree.getProofElements(
  txIds.indexOf(investigatedEntry)
);
const investigatedEntryHashed = txIds[0];
const rootHash = merkleTree.getRootHash();
const isValid = merkleTree.verify(
  proofElements,
  investigatedEntryHashed,
  rootHash,
  txIds.indexOf(investigatedEntry)
);

if (isValid) {
  console.log(
    `we can be pretty sure that ${investigatedEntry} is in the array at index: ${txIds.indexOf(
      investigatedEntry
    )}`
  );
}
*/
