import { BitcoinRPCConfig, bitcoinTxProof } from 'bitcoin-tx-proof';
import { BitcoinRPC } from 'bitcoin-tx-proof/dist/rpc';
import fs from 'fs';
const btcRPCConfig: BitcoinRPCConfig = {
  url: 'http://fivemonkeys:stackstacks@192.168.129.114:8332',
};

const btcRPC = new BitcoinRPC(btcRPCConfig);

// const blockheight = 899697;
// const txid = 'abe500e863dda30e69bd02328a638140f162736ecf27361a56692258399a84d7';
const blockheight = 906982;
const txid = 'a54f313f68172ac996c37d36baa885486dfea900cce4debca3fcdea7ea45f64f';

const fetchData = async () => {
  const blockHash = await btcRPC.call('getblockhash', [blockheight]);
  // const block = await btcRPC.call('getblock', [blockHash, 2]);
  // console.log(block);
  const tx = await btcRPC.call('getrawtransaction', [txid, 1, blockHash]);
  fs.writeFileSync('tx.json', JSON.stringify(tx, null, 2));
};

fetchData();

bitcoinTxProof(txid, blockheight, btcRPCConfig).then(proof => {
  fs.writeFileSync('proof.json', JSON.stringify(proof, null, 2));
});
