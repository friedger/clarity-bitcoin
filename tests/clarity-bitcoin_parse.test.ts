import { describe, expect, it } from "vitest";
import { hexToBytes, expectHeaderObject, expectTxObject } from "./utils.ts";
import { parseTx, parseBlockHeader } from "./clients/clarity-bitcoin-client.ts";
import { ResponseCV } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const chain = simnet;

describe("Parse bitcoin txs", () => {
  it("Ensure that simple bitcoin txs can be parsed"),
    () => {
      const deployer = accounts.get("deployer")!;
      let response = parseTx(
        "02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700",
        deployer
      );

      expectTxObject(response.result as ResponseCV, {
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
            scriptPubKey: "76a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788ac",
            value: 66217000,
          },
          {
            scriptPubKey: "76a9149049b676cf05040103135c7342bcc713a816700688ac",
            value: 1429803185,
          },
        ],
        version: 2,
      });

      response = parseTx(
        "01000000011111111111111111111111111111111111111111111111111111111111111112000000006b483045022100eba8c0a57c1eb71cdfba0874de63cf37b3aace1e56dcbd61701548194a79af34022041dd191256f3f8a45562e5d60956bb871421ba69db605716250554b23b08277b012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d000000000040000000000000000536a4c5069645b22222222222222222222222222222222222222222222222222222222222222223333333333333333333333333333333333333333333333333333333333333333404142435051606162637071fa39300000000000001976a914000000000000000000000000000000000000000088ac39300000000000001976a914000000000000000000000000000000000000000088aca05b0000000000001976a9140be3e286a15ea85882761618e366586b5574100d88ac00000000",
        deployer
      );

      expectTxObject(response.result as ResponseCV, {
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
            scriptPubKey: "76a914000000000000000000000000000000000000000088ac",
            value: 12345,
          },
          {
            scriptPubKey: "76a914000000000000000000000000000000000000000088ac",
            value: 12345,
          },
          {
            scriptPubKey: "76a9140be3e286a15ea85882761618e366586b5574100d88ac",
            value: 23456,
          },
        ],
      });

      response = parseTx(
        "01000000011111111111111111111111111111111111111111111111111111111111111112000000006a473044022037d0b9d4e98eab190522acf5fb8ea8e89b6a4704e0ac6c1883d6ffa629b3edd30220202757d710ec0fb940d1715e02588bb2150110161a9ee08a83b750d961431a8e012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d000000000020000000000000000396a3769645e2222222222222222222222222222222222222222a366b51292bef4edd64063d9145c617fec373bceb0758e98cd72becd84d54c7a39300000000000001976a9140be3e286a15ea85882761618e366586b5574100d88ac00000000",
        deployer
      );

      expectTxObject(response.result as ResponseCV, {
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
            scriptPubKey: "76a9140be3e286a15ea85882761618e366586b5574100d88ac",
            value: 12345,
          },
        ],
      });
      response = parseTx(
        "02000000019f9069891e7c64089afc0fd54b58c2044a8f61dc23d0b70abd8a1a4eee3bb36e010000006a47304402204c882028c0eb0dde2297fe3b5873abb2c0868938d63141705bb89025b08130b302204d0cd527a0ef4260ca95babc977f9e97ba41f947a4d16dba8dee823dcaff790e0121030c82347d355523ff0a4ee5c45d8dea6423e3b41d5aecaf1372af7596002ea49afdffffff0838180000000000001976a91400eb31b8bd6003f946887129468a16570b68845288ac38180000000000001976a914124d44a6ddbee55099615560ba8d7d53fc02257a88ac38180000000000001976a91481ee7e1dcb06cd261a26e6309117568f0b5d9f4988ac38180000000000001976a914973945b46e1548d4da32d96e5e09c8aa02103ff888ac38180000000000001976a914dbd958d812af104b5501d242c5cda84b3549382888ac38180000000000001976a914e03a8ffbc18b05583f804b68de97ab683705ec7f88ac10270000000000001976a9140b650f021ff2ae2165594ae51c7b1fa88f719e5f88ac8cf11800000000001976a9144e1f6f57aa65cc6d394e227b665335cf07f897a888ac95f92400",
        deployer
      );

      expectTxObject(response.result as ResponseCV, {
        version: 2,
        locktime: 2423189,
        ins: [
          {
            outpoint: {
              hash: "6eb33bee4e1a8abd0ab7d023dc618f4a04c2584bd50ffc9a08647c1e8969909f",
              index: 1,
            },
            scriptSig:
              "47304402204c882028c0eb0dde2297fe3b5873abb2c0868938d63141705bb89025b08130b302204d0cd527a0ef4260ca95babc977f9e97ba41f947a4d16dba8dee823dcaff790e0121030c82347d355523ff0a4ee5c45d8dea6423e3b41d5aecaf1372af7596002ea49a",
            sequence: 4294967293,
          },
        ],
        outs: [
          {
            scriptPubKey: "76a91400eb31b8bd6003f946887129468a16570b68845288ac",
            value: 6200,
          },
          {
            scriptPubKey: "76a914124d44a6ddbee55099615560ba8d7d53fc02257a88ac",
            value: 6200,
          },
          {
            scriptPubKey: "76a91481ee7e1dcb06cd261a26e6309117568f0b5d9f4988ac",
            value: 6200,
          },
          {
            scriptPubKey: "76a914973945b46e1548d4da32d96e5e09c8aa02103ff888ac",
            value: 6200,
          },
          {
            scriptPubKey: "76a914dbd958d812af104b5501d242c5cda84b3549382888ac",
            value: 6200,
          },
          {
            scriptPubKey: "76a914e03a8ffbc18b05583f804b68de97ab683705ec7f88ac",
            value: 6200,
          },
          {
            scriptPubKey: "76a9140b650f021ff2ae2165594ae51c7b1fa88f719e5f88ac",
            value: 10000,
          },
          {
            scriptPubKey: "76a9144e1f6f57aa65cc6d394e227b665335cf07f897a888ac",
            value: 1634700,
          },
        ],
      });
    };

  it("Ensure that bitcoin headers can be parsed"),
    () => {
      const deployer = accounts.get("deployer")!;
      let response = parseBlockHeader(
        hexToBytes(
          "000000203c437224480966081c2b14afac79e58207d996c8ac9d32000000000000000000847a4c2c77c8ecf0416ca07c2dc038414f14135017e18525f85cacdeedb54244e0d6b958df620218c626368a"
        ),
        deployer
      );
      expectHeaderObject(response.result, {
        version: 536870912,
        parent:
          "000000000000000000329dacc896d90782e579acaf142b1c086609482472433c",
        merkleRoot:
          "4442b5eddeac5cf82585e1175013144f4138c02d7ca06c41f0ecc8772c4c7a84",
        timestamp: 1488574176,
        nbits: 402809567,
        nonce: 2318804678,
      });
      response = parseBlockHeader(
        hexToBytes(
          "0020952c929316de1469df3abaff26835b0e73f45317f437b431e5e53a000000000000005c10dbda435580e08e54cd53f1504ee02a147a5d3e646a75131f9eff2e732492e838a56226d5461972717cf7"
        ),
        deployer
      );
      expectHeaderObject(response.result, {
        version: 747970560,
        parent:
          "000000000000003ae5e531b437f41753f4730e5b8326ffba3adf6914de169392",
        merkleRoot:
          "9224732eff9e1f13756a643e5d7a142ae04e50f153cd548ee0805543dadb105c",
        timestamp: 1654995176,
        nbits: 424072486,
        nonce: 4152127858,
      });
    };
});
