import { Clarinet, Tx, Chain, Account, types } from "./deps.ts";
import { hexToBytes } from "./utils.ts";

Clarinet.test({
  name: "Ensure that scriptSig is converted to principal",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const response = chain.callReadOnlyFn(
      "send-to-first-input-compact",
      "p2pkh-to-principal",
      [
        "0x473044022017e2af6e1308d431365deeb5739d41a909cf0d61a9c0e48f3ae5b0bd6544bfc5022066e73dd26d71d824552b034b322603cce8b936912b99f4f3df512e502bd7c11e012103d7b3bc2d0b4b72a845c469c9fee3c8cf475a2f237e379d7f75a4f463f7bd6ebd",
      ],
      deployer.address
    );

    response.result
      .expectSome()
      .expectPrincipal("ST2X7X1A0649S3BJR0DEB58NQ73E24FVWPPVK11WA");
  },
});

Clarinet.test({
  name: "Ensure that users can't sent incomplete proofs",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const block = chain.mineBlock([
      Tx.contractCall(
        "send-to-first-input-compact",
        "send-to-first-input",
        [
          types.uint(1),
          types.buff(hexToBytes("00")),
          types.buff(hexToBytes("01")),
          types.tuple({
            "tx-index": types.uint(1),
            hashes: types.list([]),
            "tree-depth": types.uint(1),
          }),
        ],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(1);
  },
});
