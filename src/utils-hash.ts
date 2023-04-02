import { sha256 } from "https://deno.land/x/sha256@v1.0.2/mod.ts";
import { hexReverse } from "../tests/utils.ts";

export const reversedTxId = (txHex: string) =>
  sha256(sha256(txHex, "hex", "hex"), "hex", "hex") as string;

export const headerHash = (headerHex: string) =>
  hexReverse(sha256(sha256(headerHex, "hex", "hex"), "hex", "hex") as string);
