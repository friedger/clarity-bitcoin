import { MerkleTree } from "./merkleTree.ts";
import { hexReverse } from "../tests/utils.ts";
import { SHA256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";

const txIds = [
  hexReverse(
    "2af89c752622dc3997621151efafe6f2f9f971f5b46bab94a9a70fd227fa9a76"
  ),
  hexReverse(
    "c91a8192af96b6d1faaea802eaf502f63df23fffdb7e1794638e4f8b235e1daf"
  ),
  hexReverse(
    "d779e7b2954d13973046d3bcb6764dbf894497907d177f5765ab3cae8471d869"
  ),
];
const sha256 = new SHA256();

const hexStringBtcHash = (valueToBeHashed: string) => {
  // hash twice
  const hash1 = sha256.init().update(valueToBeHashed, "hex").digest();
  return sha256.init().update(hash1).digest("hex");
};

const merkleTree = new MerkleTree(txIds, hexStringBtcHash);
console.log(merkleTree);
console.log(hexReverse(merkleTree.getRootHash()));

console.log(merkleTree.getProofElements(3).map(h => hexReverse(h)));
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