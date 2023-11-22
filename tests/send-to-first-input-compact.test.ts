import { describe, expect, it } from "vitest";
import { hexToBytes } from "./utils.ts";
import { Cl, makeContractCall, principalCV } from "@stacks/transactions";
import { tx as Tx } from "@hirosystems/clarinet-sdk";

const accounts = simnet.getAccounts();
const chain = simnet;

describe("Send to first input compact", () => {
  it("Ensure that scriptSig is converted to principal", () => {
    const deployer = accounts.get("deployer")!;
    const response = chain.callReadOnlyFn(
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
      principalCV("ST2X7X1A0649S3BJR0DEB58NQ73E24FVWPPVK11WA")
    );
  });

  it("Ensure that users can't sent incomplete proofs", () => {
    const deployer = accounts.get("deployer")!;
    const block = chain.mineBlock([
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
});
