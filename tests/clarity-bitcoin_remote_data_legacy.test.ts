import { hexToBytes } from "@stacks/common";
import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";
import {
  verifyMerkleProof,
  wasTxMinedCompact,
} from "./clients/clarity-bitcoin-client.ts";
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;

// stacks height = 595050
const bitcoinHeight = 883230;
const bitcoinBlockHeaderHash =
  "00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679";

// https://mempool.space/api/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679/header
const headerHex =
  "040060208c8b71956e408769453d40275830b83856bc0d8afaf60000000000000000000069167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac31379aa672677021707a18259";

// https://bitcoinexplorer.org/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679#JSON
const merkleRoot =
  "c3ea93871597bb4d026d52c450971cf70ac0bf8fa435ea1ad1049b32977b1669";

const wMerkleRoot =
  "d46461bd8a483c8ad0acaa9d72e54b2c04bfa7c19dc37a7b0805c2f959e832cd";

describe("Bitcoin library with remote data", () => {
  it("Ensure that remote data is as expected", () => {
    const bbh = simnet.execute("burn-block-height");
    expect(bbh.result).toBeUint(bitcoinHeight);

    var bbhh = simnet.execute(
      "(get-burn-block-info? header-hash burn-block-height)"
    );
    expect(bbhh.result).toBeSome(Cl.bufferFromHex(bitcoinBlockHeaderHash));
  });

  it("Ensure that block header is correct", () => {
    const blockHeaderVerify = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "verify-block-header",
      [Cl.buffer(hexToBytes(headerHex)), Cl.uint(bitcoinHeight)],
      deployer
    );
    expect(blockHeaderVerify.result).toBeBool(true);
  });

  it("Ensure that mined legacy tx can be verified ", () => {
    const txId =
      "f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73";

    /**
     * Collect proof data
     */

    // transaction as hex
    // https://mempool.space/api/tx/f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73/hex
    const txHex =
      "0100000001fb031611b675eb06e0d94f4d668d95f4ad4bc74ffe70bcefa035c1ab89e5c121000000006a47304402207ce0dcbdb1b3790831fc294a451bfc329b129588bef8766697f589c37666d85f0220135b39800f5d1ec2c329fd125be71cba4132b429cb3827815a2af9c21ee36f69012103e6a7489ea5fe06f9363830466067e34c574b44c485cb8ee9a4fc98276dc5a5c8ffffffff01ffb60000000000001976a9147bb1218a48c58c35c3537e6560e804023ee7310688ac00000000";

    // merkle proof
    // https://mempool.space/api/tx/f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73/merkle-proof
    const merkleProof = {
      block_height: 883230,
      merkle: [
        "d59c146d5f87b8c14fbeffb4189fe173aa4c8d6633f4597e3fab2591594af1a4",
        "498ea075e8ab8f6d4a678d6c24bc8a82304c31744e3067326ca9c242a275f604",
        "c52bc8ec72395e90646d5cc96cd17ff080c4f4af7ef6f01ea3b7ecfaa49b25cd",
        "a0a36ab643cabd74c6c9445a4c069c6c7c0ea5ac85f92342c28d8f91d487ab76",
        "15310842f6e9f419dd6860fae1cff45db709040d46cff8e736aa66a57f275b40",
        "ca377ffe8805556d45d75f2e64d92984ac8edeac661cb841c0ec198f34af7e16",
        "85b7e2affe4b61fa1dd69e3f6713afa22a58e224769e8f245c4e9b62be6ffb01",
        "0e04534a2cabf0bc42044de898c65fa283b2d661f76b4e227aa79ba390e7da70",
        "fea2965f0cf6e2c2cc1542b985565c9e2af281c14a396a3f62c57954977872e5",
        "51a1c02147ab62b9a5f67582536e4e7913d944660722b8f78a83158440752c85",
      ],
      pos: 6,
    };

    const proof = {
      txIndex: merkleProof.pos,
      hashes: merkleProof.merkle.map(hexToBytes).map((h) => h.reverse()),
      treeDepth: merkleProof.merkle.length,
    };

    /**
     * Verify
     *
     * 1. verify-block-header (done above)
     * 2. verify-merkle-proof
     * 3. was-tx-mined-compact
     */

    // 2. verify merkle proof using tx id
    const verify = verifyMerkleProof(
      hexToBytes(txId),
      hexToBytes(merkleRoot).reverse(),
      proof,
      deployer
    );
    expect(verify.result).toBeOk(Cl.bool(true));

    // 3. verify that tx was mined
    const result = wasTxMinedCompact(
      bitcoinHeight,
      txHex,
      headerHex,
      proof,
      deployer
    );
    expect(result.result).toBeOk(Cl.buffer(hexToBytes(txId)));
  });
});
