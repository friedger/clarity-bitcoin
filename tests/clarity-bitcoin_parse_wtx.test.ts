import { describe, expect, it } from "vitest";
import { hexToBytes, expectHeaderObject, expectTxObject } from "./utils.ts";
import {
  parseTx,
  parseBlockHeader,
  parseWtx,
} from "./clients/clarity-bitcoin-client.ts";
import { ResponseCV } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const chain = simnet;

describe("Parse bitcoin txs with whitness data", () => {
  it("Ensure that segwit bitcoin txs can be parsed", () => {
    const deployer = accounts.get("deployer")!;
    const response = parseWtx(
      "0200000000010218f905443202116524547142bd55b69335dfc4e4c66ff3afaaaab6267b557c4b030000000000000000e0dbdf1039321ab7a2626ca5458e766c6107690b1a1923e075c4f691cc4928ac0000000000000000000220a10700000000002200208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd14688188363c5f26010000000022512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d50140a50417be5a056f63e052294cb20643f83038d5cd90e2f90c1ad3f80180026cb99d78cd4480fadbbc5b9cad5fb2248828fb21549e7cb3f7dbd7aefd2d541bd34f0140acde555b7689eae41d5ccf872bb32a270893bdaa1defc828b76c282f6c87fc387d7d4343c5f7288cfd9aa5da0765c7740ca97e44a0205a1abafa279b530d5fe36d182500",
      true,
      deployer
    );

    expectTxObject(response.result as ResponseCV, {
      ins: [
        {
          outpoint: {
            hash: "4b7c557b26b6aaaaaff36fc6e4c4df3593b655bd42715424651102324405f918",
            index: 3,
          },
          scriptSig: "",
          sequence: 0,
        },
        {
          outpoint: {
            hash: "ac2849cc91f6c475e023191a0b6907616c768e45a56c62a2b71a323910dfdbe0",
            index: 0,
          },
          scriptSig: "",
          sequence: 0,
        },
      ],
      locktime: 2431085,
      outs: [
        {
          scriptPubKey:
            "00208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd1468818836",
          value: 500000,
        },
        {
          scriptPubKey:
            "512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d5",
          value: 19291964,
        },
      ],
      version: 2,
      txid: "3b3a7a31c949048fabf759e670a55ffd5b9472a12e748b684db5d264b6852084",
    });
  });
});
