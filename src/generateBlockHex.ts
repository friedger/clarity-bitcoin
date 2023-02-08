import { sha256, SHA256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";
import { hexReverse, hexToBytes } from "../tests/utils.ts";

const block = {
  hash: "1bdd1aa720455b2f39f6d63a0c4bc5bac0053c3cdbb6b939196704c81838f3f7",
  confirmations: 3,
  strippedsize: 759,
  size: 795,
  weight: 3072,
  height: 107,
  version: 536870912,
  versionHex: "20000000",
  merkleroot:
    "a47798e9f8ac709944a48f4c384e6d3cbfd0578b24668c4f13ab2da7d8312f4f",
  tx: "See 'Transaction IDs'",
  time: 1675883116,
  mediantime: 1675883107,
  nonce: 0,
  bits: "207fffff",
  difficulty: "4.656542373906925e-10",
  chainwork: "00000000000000000000000000000000000000000000000000000000000000d8",
  nTx: 3,
  previousblockhash:
    "2991344a683c48fd9beb896269c8d17364e0274267ea18732580c1f41aa168bf",
  nextblockhash:
    "67892168dff9028460bcd82e6d9593357dd0885be9024612bb9a9f76ad73b295",
};

const headerHex =
  hexReverse(block.versionHex) +
  hexReverse(block.previousblockhash) +
  hexReverse(block.merkleroot) +
  hexReverse(block.time.toString(16).padStart(8, "0")) +
  hexReverse(block.bits) +
  hexReverse(block.nonce.toString(16).padStart(8, "0"));

console.log("header hex :", headerHex);
console.log(
  "header hash:",
  hexReverse(sha256(sha256(headerHex, "hex", "hex"), "hex", "hex") as string)
);
