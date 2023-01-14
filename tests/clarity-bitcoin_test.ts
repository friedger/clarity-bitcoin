import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";

function hexToBytes(hexString: string) {
  return Uint8Array.from(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

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
      Tx.contractCall(
        "test-clarity-bitcoin",
        "test-parse-bitcoin-headers",
        [],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk();
  },
});

Clarinet.test({
  name: "Ensure that tx ids are correctly constructed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "clarity-bitcoin",
        "get-txid",
        [
          "0x02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700",
        ],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectBuff(hexToBytes("74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f"));
  },
});

Clarinet.test({
  name: "Ensure that merkle proof can be validated",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "test-clarity-bitcoin",
        "test-verify-merkle-proof",
        [],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectOk();
  },
});
