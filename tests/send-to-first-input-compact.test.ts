import { tx as Tx } from "@hirosystems/clarinet-sdk";
import { hexToBytes } from "@noble/hashes/utils";
import { bufferCV, Cl, principalCV } from "@stacks/transactions";
import { describe, expect, it } from "vitest";
import { cachedProof } from "./cachedProofs";

const accounts = simnet.getAccounts();

describe("Send to first input compact", () => {
  it("Ensure that scriptSig is converted to principal", () => {
    const deployer = accounts.get("deployer")!;
    const response = simnet.callReadOnlyFn(
      "send-to-first-input-compact",
      "p2pkh-to-principal",
      [
        Cl.bufferFromHex(
          "473044022017e2af6e1308d431365deeb5739d41a909cf0d61a9c0e48f3ae5b0bd6544bfc5022066e73dd26d71d824552b034b322603cce8b936912b99f4f3df512e502bd7c11e012103d7b3bc2d0b4b72a845c469c9fee3c8cf475a2f237e379d7f75a4f463f7bd6ebd"
        ),
      ],
      deployer
    );

    expect(response.result).toBeSome(
      principalCV("SP2X7X1A0649S3BJR0DEB58NQ73E24FVWPMNXGRAJ")
    );
  });

  it("Ensure that users can't sent incomplete proofs", () => {
    const deployer = accounts.get("deployer")!;
    const block = simnet.mineBlock([
      Tx.callPublicFn(
        "send-to-first-input-compact",
        "send-to-first-input",
        [
          Cl.uint(1),
          Cl.buffer(hexToBytes("00")),
          Cl.buffer(hexToBytes("01")),
          Cl.tuple({
            "tx-index": Cl.uint(1),
            hashes: Cl.list([]),
            "tree-depth": Cl.uint(1),
          }),
        ],
        deployer
      ),
    ]);

    expect(block[0].result).toBeErr(Cl.uint(1));
  });

  it("Ensure that bitcoin tx can trigger stx transfer", () => {
    const deployer = accounts.get("deployer")!;

    // use legacy tx
    // txid: "f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73";

    // https://mempool.space/api/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679/header
    const headerHex =
      "040060208c8b71956e408769453d40275830b83856bc0d8afaf60000000000000000000069167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac31379aa672677021707a18259";

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

    const block = simnet.mineBlock([
      Tx.callPublicFn(
        "send-to-first-input-compact",
        "send-to-first-input",
        [
          Cl.uint(merkleProof.block_height),
          Cl.buffer(hexToBytes(txHex)),
          Cl.buffer(hexToBytes(headerHex)),
          Cl.tuple({
            "tx-index": Cl.uint(merkleProof.pos),
            hashes: Cl.list(
              merkleProof.merkle
                .map(hexToBytes)
                .map((b) => b.reverse())
                .map(bufferCV)
            ),
            "tree-depth": Cl.uint(merkleProof.merkle.length),
          }),
        ],
        deployer
      ),
    ]);

    expect(block[0].result).toBeOk(Cl.bool(true));
    expect(block[0].events[0]).toStrictEqual({
      data: {
        amount: "46", // 46847 sats / 1000
        memo: "",
        recipient: "SPYG8WEQGBP7KWMCYZ55CAHNHEB65B17VDQE98NF", // random stx address based on scriptSig
        sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      },
      event: "stx_transfer_event",
    });
  });
});
