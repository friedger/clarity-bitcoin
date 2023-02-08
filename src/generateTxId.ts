import { sha256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";
import { hexReverse } from "../tests/utils.ts";

const txHex =
  "010000000146bf0fcf8d6de8ed53811ff7ebe88fb238b15af3dce70aa9fa41fa705c5cb0be000000006a47304402204c4ef8cb6feda1d18858ada285e304d81332529e03529d77a424b08deadae927022070731c84a194bde7896b67c473d0ed5538942162d8792c7b54b1ca2ed1c9855c012102add319140c528a8955d76d4afe32c4d3143fea57ea353a31ce793cffb77ef861fdffffff0280969800000000001976a9147321b74e2b6a7e949e6c4ad313035b166509501788ac10446d29010000001976a9142b19bade75a48768a5ffc142a86490303a95f41388ac00000000";

const reversedTxId = sha256(sha256(txHex, "hex", "hex"), "hex", "hex") as string;

console.log("reversed txid:          ", reversedTxId);
console.log("txid:                   ", hexReverse(reversedTxId));
