import { hexToBytes } from '@noble/hashes/utils.js';
import { Cl } from '@stacks/transactions';

const contractName = 'clarity-bitcoin';

export function parseTx(tx: string, deployer: string) {
  return simnet.callReadOnlyFn(contractName, 'parse-tx', [Cl.bufferFromHex(tx)], deployer);
}

export function parseWtx(wtx: string, calculateTxid: boolean, deployer: string) {
  return simnet.callReadOnlyFn(
    contractName,
    'parse-wtx',
    [Cl.bufferFromHex(wtx), Cl.bool(calculateTxid)],
    deployer
  );
}

export function parseBlockHeader(headerBuff: Uint8Array, deployer: string) {
  return simnet.callReadOnlyFn(
    contractName,
    'parse-block-header',
    [Cl.buffer(headerBuff)],
    deployer
  );
}

export function verifyMerkleProof(
  txId: Uint8Array,
  merkleRoot: Uint8Array,
  merkleProof: {
    hashes: Uint8Array[];
    txIndex: number;
    txCount: number;
  },
  deployer: string
) {
  const reverseTxId = txId.reverse();
  // verify-merkle-proof is a Clarity 6 native builtin, not a contract function.
  // The `helper` contract exposes it via the tuple-proof `verify-mp` wrapper.
  return simnet.callReadOnlyFn(
    'helper',
    'verify-mp',
    [
      Cl.buffer(reverseTxId),
      Cl.buffer(merkleRoot),
      Cl.tuple({
        hashes: Cl.list(merkleProof.hashes.map(h => Cl.buffer(h))),
        'tx-index': Cl.uint(merkleProof.txIndex),
        'tx-count': Cl.uint(merkleProof.txCount),
      }),
    ],
    deployer
  );
}

export function wasTxMinedCompact(
  bitcoinHeight: number,
  txHex: string,
  headerHex: string,
  merkleProof: {
    hashes: Uint8Array[];
    txIndex: number;
    txCount: number;
  },
  sender: string
) {
  return simnet.callReadOnlyFn(
    contractName,
    'was-tx-mined-compact',
    [
      Cl.uint(bitcoinHeight),
      Cl.buffer(hexToBytes(txHex)),
      Cl.buffer(hexToBytes(headerHex)),
      Cl.tuple({
        hashes: Cl.list(merkleProof.hashes.map(h => Cl.buffer(h))),
        'tx-index': Cl.uint(merkleProof.txIndex),
        'tx-count': Cl.uint(merkleProof.txCount),
      }),
    ],
    sender
  );
}

export function wasSegwitTxMinedCompact(
  bitcoinHeight: number,
  txHex: string,
  headerHex: string,
  txIndex: number,
  txCount: number,
  wproof: Uint8Array[],
  witnessMerkleRoot: string,
  witnessReservedValue: string,
  coinbaseTxHex: string,
  coinbaseCommitmentVout: number,
  coinbaseProof: Uint8Array[],
  sender: string
) {
  return simnet.callReadOnlyFn(
    contractName,
    'was-segwit-tx-mined-compact',
    [
      Cl.uint(bitcoinHeight),
      Cl.buffer(hexToBytes(txHex)),
      Cl.buffer(hexToBytes(headerHex)),
      Cl.uint(txIndex),
      Cl.uint(txCount),
      Cl.list(wproof.map(Cl.buffer)),
      Cl.buffer(hexToBytes(witnessMerkleRoot)),
      Cl.buffer(hexToBytes(witnessReservedValue)),
      Cl.buffer(hexToBytes(coinbaseTxHex)),
      Cl.uint(coinbaseCommitmentVout),
      Cl.list(coinbaseProof.map(Cl.buffer)),
    ],
    sender
  );
}
