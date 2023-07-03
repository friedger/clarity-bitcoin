// Code generated using `clarinet run ./scripts/generate-tests.ts`
// Manual edits will be lost.

import { Clarinet, Tx, Chain, Account, types, assertEquals, bootstrap } from './deps.ts';

Clarinet.test({
	name: "test-was-wtx-mined-internal-6: verify segwit transaction where OP_RETURN is in output[1]",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-was-wtx-mined-internal-6', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});

Clarinet.test({
	name: "test-was-wtx-mined-internal-5: OP_RETURN is too large. Fails to parse segwit transaction",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-was-wtx-mined-internal-5', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});

Clarinet.test({
	name: "test-was-wtx-mined-internal-4: verify segwit transaction where there is only the coinbase transaction. should fail",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-was-wtx-mined-internal-4', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});

Clarinet.test({
	name: "test-was-wtx-mined-internal-3: verify segwit transaction where OP_RETURN is in output[0]",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-was-wtx-mined-internal-3', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});

Clarinet.test({
	name: "test-was-wtx-mined-internal-2: verify segwit transaction where OP_RETURN is in output[0]",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-was-wtx-mined-internal-2', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});

Clarinet.test({
	name: "test-was-wtx-mined-internal-1: verify segwit transaction where OP_RETURN is in output[1]",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-was-wtx-mined-internal-1', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});

Clarinet.test({
	name: "test-parse-wtx-on-non-segwit-1: parse-wtx is unable to parse a non-segwit transaction (returns unpredictable values)",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = accounts.get('deployer')!.address;
		let block = chain.mineBlock([
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'prepare', [], deployer.address),
			Tx.contractCall('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin_test', 'test-parse-wtx-on-non-segwit-1', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});
