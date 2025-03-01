import { hexToBytes } from '@noble/hashes/utils';
import { bytesToHex } from '@stacks/common';
import { Cl } from '@stacks/transactions';
import {
  ClarityType,
  ClarityValue,
  ListCV,
  ResponseCV,
  TupleCV,
} from '@stacks/transactions/dist/clarity/index.js';
import { expect } from 'vitest';

const byteToHexCache: string[] = new Array(0xff);
for (let n = 0; n <= 0xff; ++n) {
  byteToHexCache[n] = n.toString(16).padStart(2, '0');
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
  txid?: string;
}

export function expectHeaderObject(
  result: ClarityValue,
  expectedHeaderObject: {
    version: number;
    parent: string;
    merkleRoot: string;
    timestamp: number;
    nbits: number;
    nonce: number;
  }
) {
  expect(result).toBeOk(
    Cl.tuple({
      version: Cl.uint(expectedHeaderObject.version),
      parent: Cl.buffer(hexToBytes(expectedHeaderObject.parent)),
      'merkle-root': Cl.buffer(hexToBytes(expectedHeaderObject.merkleRoot)),
      timestamp: Cl.uint(expectedHeaderObject.timestamp),
      nbits: Cl.uint(expectedHeaderObject.nbits),
      nonce: Cl.uint(expectedHeaderObject.nonce),
    })
  );
}

export function expectTxObject(result: ResponseCV, expectedTxObject: TxObject) {
  expect(result.type).toBe(ClarityType.ResponseOk);
  const resultTxObject = (result.value as TupleCV).data;

  expect(resultTxObject.version).toBeUint(expectedTxObject.version);
  expect(resultTxObject.locktime).toBeUint(expectedTxObject.locktime);

  for (let index = 0; index < expectedTxObject.ins.length; index++) {
    expect((resultTxObject.ins as ListCV).list[index]).toBeTuple({
      outpoint: Cl.tuple({
        hash: Cl.buffer(hexToBytes(expectedTxObject.ins[index].outpoint.hash)),
        index: Cl.uint(expectedTxObject.ins[index].outpoint.index),
      }),
      scriptSig: Cl.buffer(hexToBytes(expectedTxObject.ins[index].scriptSig)),
      sequence: Cl.uint(expectedTxObject.ins[index].sequence),
    });
  }

  for (let index = 0; index < expectedTxObject.outs.length; index++) {
    expect((resultTxObject.outs as ListCV).list[index]).toBeTuple({
      scriptPubKey: Cl.buffer(hexToBytes(expectedTxObject.outs[index].scriptPubKey)),
      value: Cl.uint(expectedTxObject.outs[index].value),
    });
  }

  if (expectedTxObject.txid) {
    expect(resultTxObject.txid).toBeSome(Cl.buffer(hexToBytes(expectedTxObject.txid)));
  }
}
