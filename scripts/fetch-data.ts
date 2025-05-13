import { BitcoinRPCConfig } from 'bitcoin-tx-proof';
import { BitcoinRPC } from 'bitcoin-tx-proof/dist/rpc';

const btcRPCConfig: BitcoinRPCConfig = {
  url: 'http://localhost:8332',
};

const btcRPC = new BitcoinRPC(btcRPCConfig);

const fetchData = async () => {
  const blockHeight = 895500;
  const blockHash = await btcRPC.call('getblockhash', [blockHeight]);
  const block = await btcRPC.call('getblock', [blockHash, 2]);
  console.log(block);
  const tx = await btcRPC.call('getrawtransaction', [
    '5686431d06c258997e6e34f0a1d6a87e35978c4d65d263cf9bc0467f855b4063',
    1,
    blockHash,
  ]);
  console.log(tx);
};

fetchData();
