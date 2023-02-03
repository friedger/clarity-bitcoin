import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { hexToBytes } from "./utils.ts";
import { expectParsedTx } from "./clients/clarity-bitcoin-client.ts";

Clarinet.test({
  name: "Ensure that simple bitcoin txs can be parsed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    expectParsedTx(
      chain,
      deployer,
      "0x02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700",
      {
        ins: [
          {
            outpoint: {
              hash: "ebe4a9f567fb6b130bd4a7eb0c00124ef9dc30663c0b61de4311ea601525699b",
              index: 0,
            },
            scriptSig:
              "483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5",
            sequence: 4294967294,
          },
        ],
        locktime: 509243,
        outs: [
          {
            scriptPubKey:
              "76a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788ac",
            value: 66217000,
          },
          {
            scriptPubKey:
              "76a9149049b676cf05040103135c7342bcc713a816700688ac",
            value: 1429803185,
          },
        ],
        version: 2,
      }
    );

    expectParsedTx(
      chain,
      deployer,
      "0x01000000011111111111111111111111111111111111111111111111111111111111111112000000006b483045022100eba8c0a57c1eb71cdfba0874de63cf37b3aace1e56dcbd61701548194a79af34022041dd191256f3f8a45562e5d60956bb871421ba69db605716250554b23b08277b012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d000000000040000000000000000536a4c5069645b22222222222222222222222222222222222222222222222222222222222222223333333333333333333333333333333333333333333333333333333333333333404142435051606162637071fa39300000000000001976a914000000000000000000000000000000000000000088ac39300000000000001976a914000000000000000000000000000000000000000088aca05b0000000000001976a9140be3e286a15ea85882761618e366586b5574100d88ac00000000",
      {
        version: 1,
        locktime: 0,
        ins: [
          {
            outpoint: {
              hash: "1211111111111111111111111111111111111111111111111111111111111111",
              index: 0,
            },
            scriptSig:
              "483045022100eba8c0a57c1eb71cdfba0874de63cf37b3aace1e56dcbd61701548194a79af34022041dd191256f3f8a45562e5d60956bb871421ba69db605716250554b23b08277b012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d0",
            sequence: 0,
          },
        ],
        outs: [
          {
            scriptPubKey:
              "6a4c5069645b22222222222222222222222222222222222222222222222222222222222222223333333333333333333333333333333333333333333333333333333333333333404142435051606162637071fa",
            value: 0,
          },
          {
            scriptPubKey:
              "76a914000000000000000000000000000000000000000088ac",
            value: 12345,
          },
          {
            scriptPubKey:
              "76a914000000000000000000000000000000000000000088ac",
            value: 12345,
          },
          {
            scriptPubKey:
              "76a9140be3e286a15ea85882761618e366586b5574100d88ac",
            value: 23456,
          },
        ],
      }
    );

    expectParsedTx(
      chain,
      deployer,
      "0x01000000011111111111111111111111111111111111111111111111111111111111111112000000006a473044022037d0b9d4e98eab190522acf5fb8ea8e89b6a4704e0ac6c1883d6ffa629b3edd30220202757d710ec0fb940d1715e02588bb2150110161a9ee08a83b750d961431a8e012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d000000000020000000000000000396a3769645e2222222222222222222222222222222222222222a366b51292bef4edd64063d9145c617fec373bceb0758e98cd72becd84d54c7a39300000000000001976a9140be3e286a15ea85882761618e366586b5574100d88ac00000000",
      {
        version: 1,
        locktime: 0,
        ins: [
          {
            outpoint: {
              hash: "1211111111111111111111111111111111111111111111111111111111111111",
              index: 0,
            },
            scriptSig:
              "473044022037d0b9d4e98eab190522acf5fb8ea8e89b6a4704e0ac6c1883d6ffa629b3edd30220202757d710ec0fb940d1715e02588bb2150110161a9ee08a83b750d961431a8e012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d0",
            sequence: 0,
          },
        ],
        outs: [
          {
            scriptPubKey:
              "6a3769645e2222222222222222222222222222222222222222a366b51292bef4edd64063d9145c617fec373bceb0758e98cd72becd84d54c7a",
            value: 0,
          },
          {
            scriptPubKey:
              "76a9140be3e286a15ea85882761618e366586b5574100d88ac",
            value: 12345,
          },
        ],
      }
    );
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

    block.receipts[0].result.expectBuff(
      hexToBytes(
        "74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f"
      )
    );
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
