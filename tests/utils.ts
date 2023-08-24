export function hexToBytes(hexString: string) {
  if (hexString) {
    return Uint8Array.from(
      hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
  } else {
    return new Uint8Array(0);
  }
}

const byteToHexCache: string[] = new Array(0xff);
for (let n = 0; n <= 0xff; ++n) {
  byteToHexCache[n] = n.toString(16).padStart(2, "0");
}

export function bytesToHex(uint8a: Uint8Array) {
  const hexOctets = new Array(uint8a.length);
  for (let i = 0; i < uint8a.length; ++i)
    hexOctets[i] = byteToHexCache[uint8a[i]];
  return hexOctets.join("");
}

export function hexReverse(hexString: string) {
  return bytesToHex(hexToBytes(hexString).reverse());
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
