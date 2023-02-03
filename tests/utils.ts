export function hexToBytes(hexString: string) {
  return Uint8Array.from(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

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

export function expectHeaderObject(
  block: any,
  expectedHeaderObject: {
    version: number;
    parent: string;
    merkleRoot: string;
    timestamp: number;
    nbits: number;
    nonce: number;
  }
) {
  const headerObject = block.receipts[0].result.expectOk().expectTuple();
  headerObject.version.expectUint(expectedHeaderObject.version);
  headerObject.parent.expectBuff(hexToBytes(expectedHeaderObject.parent));
  headerObject["merkle-root"].expectBuff(
    hexToBytes(expectedHeaderObject.merkleRoot)
  );
  headerObject.timestamp.expectUint(expectedHeaderObject.timestamp);
  headerObject.nbits.expectUint(expectedHeaderObject.nbits);
  headerObject.nonce.expectUint(expectedHeaderObject.nonce);
}

export function expectTxObject(block: any, expectedTxObject: TxObject) {
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
