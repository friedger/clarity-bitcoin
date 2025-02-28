import { hexToBytes } from "@noble/hashes/utils";

export function proofToArray(proof: string) {
  const cbChunks = proof.match(/.{1,64}/g);
  const cbProofs = cbChunks?.map((c) => hexToBytes(c)) || [];
  return cbProofs;
}
