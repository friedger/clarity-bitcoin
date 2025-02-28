import { tx } from "@hirosystems/clarinet-sdk";
import { hexToBytes } from "@noble/hashes/utils";
import { intToBytes } from "@stacks/common";
import {
  boolCV,
  bufferCV,
  listCV,
  principalCV,
  someCV,
  tupleCV,
  uintCV,
} from "@stacks/transactions";
import { BitcoinRPCConfig } from "bitcoin-tx-proof";
import { BitcoinRPC } from "bitcoin-tx-proof/dist/rpc";
import { describe, expect, test } from "vitest";

const accounts = simnet.getAccounts();
const alice = accounts.get("wallet_1")!;
const bob = accounts.get("wallet_2")!;

const btcRPCConfig: BitcoinRPCConfig = {
  url: "http://localhost:8332",
};

const btcRPC = new BitcoinRPC(btcRPCConfig);

describe("User can finalize btc-stx swap", () => {
  const txid =
    "f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73";
  const blockHeight = 883230;
  const bitcoinBlockHeaderHash =
    "00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679";

  // https://mempool.space/api/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679/header
  const headerHex =
    "040060208c8b71956e408769453d40275830b83856bc0d8afaf60000000000000000000069167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac31379aa672677021707a18259";

  test("Ensure that remote data is as expected", () => {
    const bbh = simnet.execute("burn-block-height");
    expect(bbh.result).toBeUint(blockHeight);

    var bbhh = simnet.execute(
      "(get-burn-block-info? header-hash burn-block-height)"
    );
    expect(bbhh.result).toBeSome(bufferCV(hexToBytes(bitcoinBlockHeaderHash)));
  });

  test("that Bob can complete Alice' swap using a legacy btc tx", async () => {
    const swapAmount = 10000;
    const rate = 1000;

    //  https://mempool.space/api/tx/f5a993361e1db33c3b2323e39eda6c8ee70bc08da1429d0a2f81063751e55c73/merkle-proof
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

    // get transaction object
    const blockHash = await btcRPC.call("getblockhash", [blockHeight]);
    const txObject = await btcRPC.call("getrawtransaction", [
      txid,
      true,
      blockHash,
    ]);

    const hashes = merkleProof.merkle.map(hexToBytes).map((h) => h.reverse());

    const tx2 = tupleCV({
      version: bufferCV(intToBytes(txObject.version, false, 4).reverse()),
      locktime: bufferCV(intToBytes(txObject.locktime, false, 4).reverse()),
      ins: listCV(
        txObject.vin.map((input: any) => {
          return tupleCV({
            outpoint: tupleCV({
              hash: bufferCV(hexToBytes(input.txid).reverse()),
              index: bufferCV(intToBytes(input.vout, false, 4).reverse()),
            }),
            scriptSig: bufferCV(hexToBytes(input.scriptSig.hex)),
            sequence: bufferCV(intToBytes(input.sequence, false, 4).reverse()),
          });
        })
      ),
      outs: listCV(
        txObject.vout.map((output: any) => {
          return tupleCV({
            value: bufferCV(
              intToBytes(output.value * 100_000_000, false, 8).reverse()
            ),
            scriptPubKey: bufferCV(hexToBytes(output.scriptPubKey.hex)),
          });
        })
      ),
    });

    // create swap and submit a btc tx in the same block
    const block = simnet.mineBlock([
      tx.callPublicFn(
        "btc-stx-swap",
        "create-swap",
        [
          uintCV(swapAmount),
          bufferCV(
            hexToBytes("76a9147bb1218a48c58c35c3537e6560e804023ee7310688ac")
          ), // receiver script
          uintCV((swapAmount / rate) * 1e6),
          someCV(principalCV(bob)),
          uintCV(0),
        ],
        alice
      ),

      // submit
      // (id uint)
      // (height uint)
      // (blockheader (buff 80))
      // (tx {version: (buff 4),
      //   ins: (list 8
      //     {outpoint: {hash: (buff 32), index: (buff 4)}, scriptSig: (buff 256), sequence: (buff 4)}),
      //   outs: (list 8
      //     {value: (buff 8), scriptPubKey: (buff 128)}),
      //   locktime: (buff 4)})
      // (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint }))

      tx.callPublicFn(
        "btc-stx-swap",
        "submit-swap",
        [
          uintCV(0),
          uintCV(blockHeight),
          bufferCV(hexToBytes(headerHex)),
          tx2,
          tupleCV({
            "tx-index": uintCV(merkleProof.pos),
            hashes: listCV(hashes.map(bufferCV)),
            "tree-depth": uintCV(hashes.length),
          }),
        ],
        bob
      ),
    ]);

    expect(block[0].result).toBeOk(uintCV(0));
    expect(block[1].result).toBeOk(boolCV(true));
    expect(block[1].events[0]).toStrictEqual({
      event: "stx_transfer_event",
      data: {
        amount: "10000000", // 10 STX = 10k sats / 1000 * 1e6
        memo: "",
        recipient: bob,
        sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.btc-stx-swap",
      },
    });
  });
});
