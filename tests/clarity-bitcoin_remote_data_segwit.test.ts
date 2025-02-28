import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, hexToBytes } from "@stacks/common";
import { Cl, cvToString } from "@stacks/transactions";
import * as bitcoinjs from "bitcoinjs-lib";
import { describe, expect, it } from "vitest";
import { cachedProof, manualProofData } from "./cachedProofs.ts";
import {
  verifyMerkleProof,
  wasSegwitTxMinedCompact,
  wasTxMinedCompact,
} from "./clients/clarity-bitcoin-client.ts";
import { proofToArray } from "./conversion.ts";
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

// stacks height = 595050
const blockHeight = 883230;
const bitcoinBlockHeaderHash =
  "00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679";

// https://mempool.space/api/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679/header
const blockHeader =
  "040060208c8b71956e408769453d40275830b83856bc0d8afaf60000000000000000000069167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac31379aa672677021707a18259";

describe("Bitcoin library with remote data", () => {
  it("Ensure that remote data is as expected", () => {
    const bbh = simnet.execute("burn-block-height");
    expect(bbh.result).toBeUint(blockHeight);

    var bbhh = simnet.execute(
      "(get-burn-block-info? header-hash burn-block-height)"
    );
    expect(bbhh.result).toBeSome(Cl.bufferFromHex(bitcoinBlockHeaderHash));
  });

  it("Ensure that block header is correct", () => {
    const blockHeaderVerify = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "verify-block-header",
      [Cl.buffer(hexToBytes(blockHeader)), Cl.uint(blockHeight)],
      deployer
    );
    expect(blockHeaderVerify.result).toBeBool(true);
  });

  it("Ensure that mined segwit tx can be verified ", async () => {
    const txId =
      "c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc";

    /**
     * Collect proof data
     */

    // use bitcoinTxProof to create txProof automatically
    // const txProof = await bitcoinTxProof(txId, blockHeight, {
    //   url: "http://localhost:8332",
    // }).then((r) => {
    //   console.log(JSON.stringify(txProof));
    //   return r;
    // });
    const txProof = cachedProof;

    /**
     * Verify
     *
     * 1. was-tx-mined-compact for coinbase tx in legacy format
     * 1.1. verify-block-header (done above)
     * 1.2. verify-merkle-proof for coinbase tx in legacy format
     * 2. verify commitment
     * 3. verify-merkle-proof for witness tx hashes
     * 4. was-segwit-tx-mined-compact for tx
     */

    // verify merkle proof using tx id (not used in proof)
    const verify = verifyMerkleProof(
      hexToBytes(txId),
      hexToBytes(manualProofData.merkleRoot).reverse(),
      manualProofData.proof,
      deployer
    );
    expect(verify.result).toBeOk(Cl.bool(true));

    // 1.2 verify merkle proof using coinbase tx id
    const coinbaseTxId = sha256(
      sha256(hexToBytes(txProof.legacyCoinbaseTxHex))
    ).reverse();
    expect(bytesToHex(coinbaseTxId)).toBe(manualProofData.coinbaseTxId);
    const cbHashes = proofToArray(txProof.coinbaseMerkleProof);

    const verifyCoinbase = verifyMerkleProof(
      coinbaseTxId,
      hexToBytes(manualProofData.merkleRoot).reverse(),
      {
        hashes: cbHashes,
        txIndex: 0,
        treeDepth: cbHashes.length,
      },
      deployer
    );
    expect(verifyCoinbase.result).toBeOk(Cl.bool(true));

    // 1. verify that coinbase tx was mined
    const hashes = proofToArray(txProof.coinbaseMerkleProof);
    const resultCB = wasTxMinedCompact(
      txProof.blockHeight, // bitcoinHeight,
      txProof.legacyCoinbaseTxHex,
      txProof.blockHeader, //headerHex,
      {
        hashes,
        treeDepth: hashes.length,
        txIndex: 0,
      },
      deployer
    );
    expect(resultCB.result).toBeOk(
      Cl.buffer(hexToBytes(manualProofData.coinbaseTxId))
    );

    // verify parsed coinbase tx (not used in proof)
    const parseCBTx = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "parse-tx",
      [Cl.buffer(hexToBytes(txProof.legacyCoinbaseTxHex))],
      deployer
    );
    expect(cvToString(parseCBTx.result)).toBe(
      "(ok (tuple (ins (list (tuple (outpoint (tuple (hash 0x0000000000000000000000000000000000000000000000000000000000000000) (index u4294967295))) (scriptSig 0x031e7a0d041379aa672f53424943727970746f2e636f6d20506f6f6c2f0e8f08296459410349b85901) (sequence u4294967295)))) (locktime u0) (outs (list (tuple (scriptPubKey 0x00141843e47a9034732c7d904b5cae76e2c5d64e799c) (value u313078430)) (tuple (scriptPubKey 0x6a24aa21a9edf97f7d667a4e75a8b7235f1f66648bc2262d2dd5253e811ac1c257ae03d1d3b2) (value u0)))) (version u2)))"
    );

    // verify merkle root (not used in proof)
    const reversedMerkleRoot =
      "69167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac3";
    expect(
      bytesToHex(hexToBytes(manualProofData.merkleRoot).reverse())
    ).toStrictEqual(reversedMerkleRoot);

    // 3. verify commitment, i.e. scriptPubkey of output of coinbase tx
    const commitment =
      "6a24aa21a9edf97f7d667a4e75a8b7235f1f66648bc2262d2dd5253e811ac1c257ae03d1d3b2";
    expect(
      "6a24aa21a9ed" +
        bytesToHex(
          sha256(
            sha256(
              hexToBytes(
                txProof.witnessMerkleRoot + txProof.witnessReservedValue
              )
            )
          )
        )
    ).toStrictEqual(commitment);

    // comapre txProof data with manually collected data
    expect(txProof.blockHeight).toBe(blockHeight);
    expect(txProof.transaction).toBe(manualProofData.txHex);
    expect(txProof.blockHeader).toBe(blockHeader);
    expect(txProof.txIndex).toBe(manualProofData.proof.txIndex);
    expect(txProof.merkleProofDepth).toBe(manualProofData.proof.treeDepth);
    expect(txProof.witnessReservedValue).toBe(
      manualProofData.witnessReservedValue
    );
    expect(txProof.legacyCoinbaseTxHex).toBe(
      manualProofData.legacyCoinbaseTxHex
    );

    // 4. verify segwit tx was mined
    const result = wasSegwitTxMinedCompact(
      txProof.blockHeight,
      txProof.transaction,
      txProof.blockHeader,
      txProof.txIndex,
      txProof.merkleProofDepth,
      proofToArray(txProof.witnessMerkleProof),
      txProof.witnessMerkleRoot,
      txProof.witnessReservedValue,
      txProof.legacyCoinbaseTxHex,
      proofToArray(txProof.coinbaseMerkleProof),
      deployer
    );

    // calculate expected wtxid
    const bitcoinjsTx = bitcoinjs.Transaction.fromHex(manualProofData.txHex);
    const expectedWtxid = bitcoinjsTx.getHash(true).reverse().toString("hex");
    expect(result.result).toBeOk(Cl.buffer(hexToBytes(expectedWtxid)));
  }, 100_000); // using bitcoinTxProof might take longer
});
