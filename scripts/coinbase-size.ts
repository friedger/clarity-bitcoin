import { BitcoinRPCConfig } from 'bitcoin-tx-proof';
import { BitcoinRPC } from 'bitcoin-tx-proof/dist/rpc';

const btcRPCConfig: BitcoinRPCConfig = {
  url: 'http://localhost:8332',
};

const btcRPC = new BitcoinRPC(btcRPCConfig);
const maxTxSize = 4096; // Maximum transaction size in bytes
const maxInputs = 50; // Maximum number of inputs
const maxOutputs = 50; // Maximum number of outputs
const maxScriptSigSize = 520; // Maximum scriptSig size in bytes
const maxScriptPubKeySize = 520; // Maximum scriptPubKey size in bytes
const maxWitnessItems = 12; // Maximum number of witness items
const maxWitnessItemSize = 520; // Maximum witness item size in bytes

const main = async () => {
  for (let i = 895500; i < 900000; i++) {
    try {
      const blockHash = await btcRPC.call('getblockhash', [i]);
      const block = await btcRPC.call('getblock', [blockHash, 2]);

      block.tx.forEach((tx, txIndex) => {
        if (tx.size > maxTxSize) {
          return; // Skip transactions larger than 4096 bytes
        }

        const violations: string[] = [];

        // Check max inputs
        if (tx.vin.length > maxInputs) {
          violations.push(`Too many inputs: ${tx.vin.length}`);
        }

        // Check max outputs
        if (tx.vout.length > maxOutputs) {
          //violations.push(`Too many outputs: ${tx.vout.length}`);
        }

        // Check scriptSig size
        for (const input of tx.vin) {
          if (input.scriptSig && input.scriptSig.hex.length / 2 > maxScriptSigSize) {
            violations.push(`scriptSig too large: ${input.scriptSig.hex.length / 2} bytes`);
          }
        }

        // Check scriptPubKey size
        for (const output of tx.vout) {
          if (output.scriptPubKey.hex.length / 2 > maxScriptPubKeySize) {
            violations.push(`scriptPubKey too large: ${output.scriptPubKey.hex.length / 2} bytes`);
          }
        }

        // Check witness constraints
        if (tx.vin.some(input => input.txinwitness)) {
          for (const input of tx.vin) {
            if (input.txinwitness) {
              if (input.txinwitness.length > maxWitnessItems) {
                violations.push(`Too many witness items: ${input.txinwitness.length}`);
              }
              for (const witness of input.txinwitness) {
                if (witness.length / 2 > maxWitnessItemSize) {
                  // violations.push(`Witness item too large: ${witness.length / 2} bytes`);
                }
              }
            }
          }
        }

        // Log violations
        if (violations.length > 0) {
          if (txIndex === 0) {
            console.log('**** Coinbase transaction violations:');
          }
          console.log('Block height:', i);
          console.log('Block hash:', blockHash);
          console.log('Transaction Index', txIndex);
          console.log('Transaction:', tx.txid);
          console.log('Violations:', violations);
          console.log('-----------------------------------');
        }
      });

      if (i % 1000 === 0) {
        console.log('Checked block height:', i);
      }
    } catch (error) {
      console.error(`Error processing block ${i}:`, error.message);
    }
  }
};

main();
