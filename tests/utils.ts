import { ParsedTransactionResult } from "@hirosystems/clarinet-sdk";
import {
  Cl,
  ClarityType,
  ClarityValue,
  ListCV,
  ResponseCV,
  ResponseOkCV,
  TupleCV,
} from "@stacks/transactions";
import { expect } from "vitest";

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
      "merkle-root": Cl.buffer(hexToBytes(expectedHeaderObject.merkleRoot)),
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
      scriptPubKey: Cl.buffer(
        hexToBytes(expectedTxObject.outs[index].scriptPubKey)
      ),
      value: Cl.uint(expectedTxObject.outs[index].value),
    });
  }

  if (expectedTxObject.txid) {
    expect(resultTxObject.txid).toBeSome(
      Cl.buffer(hexToBytes(expectedTxObject.txid))
    );
  }
}
