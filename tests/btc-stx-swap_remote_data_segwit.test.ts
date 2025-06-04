import { tx } from '@hirosystems/clarinet-sdk';
import { hexToBytes } from '@noble/hashes/utils';
import { intToBytes } from '@stacks/common';
import {
  boolCV,
  bufferCV,
  listCV,
  principalCV,
  someCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { describe, expect, test } from 'vitest';
import { txs } from './btc-stx-swap_cachedData';
import { cachedProof } from './cachedProofs';
import { proofToArray } from './conversion';

const accounts = simnet.getAccounts();
const alice = accounts.get('wallet_1')!;
const bob = accounts.get('wallet_2')!;

describe('User can finalize btc-stx swap', () => {
  const txid = 'c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc';
  // https://mempool.space/api/tx/c1de234c01ecc47906117d012865ce3dabbbb081dc0309a74dbbae45e427aadc/hex
  const txHex =
    '02000000000101f6e86a2b938453e199836ad4e2ba751c5ded24f4e1c2934b3434cd00f9bce61d0100000000fdffffff02856e00000000000017a914c5beca99b2b4c558b297ed9134142f4a3873f4e987d0b8390100000000160014b84ef1e7e398d56fa88a356df3139ff997114f040247304402205edad21077602766ffbce1276b6a3b69577a521b28dc18d8062303723ac91cc802200ec9ea72f62069b1e5817a999fa3d31acf0f655a159691feb8161fb33b93f3fa012103997651fec067eda2c430bfe548f65575737c9b892d8b529ae9dc0dfcb5c5898a00000000';

  const blockHeight = 883230;
  const bitcoinBlockHeaderHash = '00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679';

  // https://mempool.space/api/block/00000000000000000001c55626b85b4b3ecb33f67645356a2b01f4dfba893679/header
  const headerHex =
    '040060208c8b71956e408769453d40275830b83856bc0d8afaf60000000000000000000069167b97329b04d11aea35a48fbfc00af71c9750c4526d024dbb97158793eac31379aa672677021707a18259';

  test('Ensure that remote data is as expected', () => {
    const bbh = simnet.execute('burn-block-height');
    expect(bbh.result).toBeUint(blockHeight);

    var bbhh = simnet.execute('(get-burn-block-info? header-hash burn-block-height)');
    expect(bbhh.result).toBeSome(bufferCV(hexToBytes(bitcoinBlockHeaderHash)));
  });

  test("that Bob can complete Alice' swap using a segwit btc tx", async () => {
    const swapAmount = 10000;
    const rate = 1000;

    // get transaction object
    // const blockHash = await btcRPC.call('getblockhash', [blockHeight]);
    const txObject = txs[txid]; //await btcRPC.call('getrawtransaction', [txid, true, blockHash]);
    const tx2 = tupleCV({
      version: bufferCV(intToBytes(txObject.version, 4).reverse()),
      locktime: bufferCV(intToBytes(txObject.locktime, 4).reverse()),
      ins: listCV(
        txObject.vin.map((input: any) => {
          return tupleCV({
            outpoint: tupleCV({
              hash: bufferCV(hexToBytes(input.txid).reverse()),
              index: bufferCV(intToBytes(input.vout, 4).reverse()),
            }),
            scriptSig: bufferCV(hexToBytes(input.scriptSig.hex)),
            sequence: bufferCV(intToBytes(input.sequence, 4).reverse()),
          });
        })
      ),
      outs: listCV(
        txObject.vout.map((output: any) => {
          return tupleCV({
            value: bufferCV(intToBytes(Math.round(output.value * 100_000_000), 8).reverse()),
            scriptPubKey: bufferCV(hexToBytes(output.scriptPubKey.hex)),
          });
        })
      ),
    });

    let hasWitnessData = false;
    const witnessData: number[] = [];
    for (let vin of txObject.vin) {
      if (!vin.txinwitness) {
        continue;
      }
      hasWitnessData = true;
      witnessData.push(vin.txinwitness.length);
      for (let item of vin.txinwitness || []) {
        const b = hexToBytes(item);
        witnessData.push(b.length);
        witnessData.push(...b);
      }
    }

    // create swap and submit a btc tx in the same block
    const block = simnet.mineBlock([
      tx.callPublicFn(
        'btc-stx-swap',
        'create-swap',
        [
          uintCV(swapAmount),
          bufferCV(hexToBytes('a914c5beca99b2b4c558b297ed9134142f4a3873f4e987')), // receiver script
          uintCV((swapAmount / rate) * 1e6),
          someCV(principalCV(bob)),
          uintCV(0),
        ],
        alice
      ),

      // submit
      // (id uint)
      // (height uint)
      // (wtx {version: (buff 4),
      //   ins: (list 8
      //     {outpoint: {hash: (buff 32), index: (buff 4)}, scriptSig: (buff 256), sequence: (buff 4)}),
      //   outs: (list 8
      //     {value: (buff 8), scriptPubKey: (buff 128)}),
      //   locktime: (buff 4)})
      // (witness-data (buff 1650))
      // (header (buff 80))
      // (tx-index uint)
      // (tree-depth uint)
      // (wproof (list 14 (buff 32)))
      // (witness-merkle-root (buff 32))
      // (witness-reserved-value (buff 32))
      // (ctx (buff 1024))
      // (cproof (list 14 (buff 32))))

      tx.callPublicFn(
        'btc-stx-swap',
        'submit-swap-segwit',
        [
          uintCV(0),
          uintCV(blockHeight),
          tx2,
          bufferCV(new Uint8Array(witnessData)),
          bufferCV(hexToBytes(headerHex)),
          uintCV(cachedProof.txIndex),
          uintCV(cachedProof.merkleProofDepth),
          listCV(proofToArray(cachedProof.witnessMerkleProof).map(bufferCV)),
          bufferCV(hexToBytes(cachedProof.witnessMerkleRoot)),
          bufferCV(hexToBytes(cachedProof.witnessReservedValue)),
          bufferCV(hexToBytes(cachedProof.legacyCoinbaseTxHex)),
          listCV(proofToArray(cachedProof.coinbaseMerkleProof).map(bufferCV)),
        ],
        bob
      ),
    ]);
    expect(block[0].result).toBeOk(uintCV(0));
    expect(block[1].result).toBeOk(boolCV(true));
    expect(block[1].events[0]).toStrictEqual({
      event: 'stx_transfer_event',
      data: {
        amount: '10000000', // 10 STX = 10k sats / 1000 * 1e6
        memo: '',
        recipient: bob,
        sender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.btc-stx-swap',
      },
    });
  });
});
