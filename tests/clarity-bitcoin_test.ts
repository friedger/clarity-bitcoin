import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";

Clarinet.test({
  name: "Ensure that simple bitcoin txs can be parsed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "test-clarity-bitcoin",
        "test-parse-simple-bitcoin-txs",
        [],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk();
  },
});


Clarinet.test({
    name: "Ensure that bitcoin headers can be parsed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get("deployer")!;
      let block = chain.mineBlock([
        Tx.contractCall("test-clarity-bitcoin", "test-parse-bitcoin-headers", [], deployer.address)
      ])

      block.receipts[0].result.expectOk();
    }

})

Clarinet.test({
    name: "Ensure that tx ids are correctly constructed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get("deployer")!;
      let block = chain.mineBlock([
        Tx.contractCall("test-clarity-bitcoin", "test-get-txid", [], deployer.address)
      ])

      block.receipts[0].result.expectOk();
    }

})

Clarinet.test({
    name: "Ensure that merkle proof can be validated",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get("deployer")!;
      let block = chain.mineBlock([
        Tx.contractCall("test-clarity-bitcoin", "test-verify-merkle-proof", [], deployer.address)
      ])

      block.receipts[0].result.expectOk();
    }

})
