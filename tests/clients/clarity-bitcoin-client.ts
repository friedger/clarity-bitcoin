import { Clarinet, Tx, Chain, Account, types, assertEquals } from "../deps.ts";
import { hexToBytes } from "../utils.ts";

export interface TxObject {
  locktime: number;
  version: number;
  ins: {
    outpoint: { hash: string; index: number };
    scriptSig: string;
    sequence: number;
  }[];
  outs: {
    scriptPubKey: string;
    value: number;
  }[];
}

export function expectParsedTx(
  chain: Chain,
  deployer: Account,
  tx: string,
  expectedTxObject: TxObject
) {
  const block = chain.mineBlock([
    Tx.contractCall("clarity-bitcoin", "parse-tx", [tx], deployer.address),
  ]);

  const resultTxObject = block.receipts[0].result.expectOk().expectTuple();
  resultTxObject.version.expectUint(expectedTxObject.version);
  resultTxObject.locktime.expectUint(expectedTxObject.locktime);

  for (let index = 0; index < expectedTxObject.ins.length; index++) {
    const insObject = resultTxObject.ins.expectList()[index].expectTuple();
    const outpoint = insObject.outpoint.expectTuple();
    outpoint.hash.expectBuff(
      hexToBytes(expectedTxObject.ins[index].outpoint.hash)
    );
    outpoint.index.expectUint(expectedTxObject.ins[index].outpoint.index);

    insObject.scriptSig.expectBuff(
      hexToBytes(expectedTxObject.ins[index].scriptSig)
    );
    insObject.sequence.expectUint(expectedTxObject.ins[index].sequence);
  }

  for (let index = 0; index < expectedTxObject.outs.length; index++) {
    const outObject = resultTxObject.outs.expectList()[index].expectTuple();
    outObject.scriptPubKey.expectBuff(
      hexToBytes(expectedTxObject.outs[index].scriptPubKey)
    );
    outObject.value.expectUint(expectedTxObject.outs[index].value);
  }
}
