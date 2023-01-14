import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types,
    assertEquals,
  } from "./deps.ts";
  
  Clarinet.test({
    name: "Ensure that tests run",
    async fn(chain: Chain, accounts: Map<string, Account>) {
      const deployer = accounts.get("deployer")!;
      let block = chain.mineBlock([
        Tx.contractCall("test-clarity-bitcoin", "unit-tests", [], deployer.address)
      ])

      block.receipts[0].result.expectOk();
    }
})