import { Clarinet, Contract, Account } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';

const targetFolder = '.test';

const warningText = `// Code generated using \`clarinet run ./scripts/generate-tests.ts\`
// Manual edits will be lost.`;

function getContractName(contractId: string) {
	return contractId.split('.')[1];
}

function isTestContract(contractName: string) {
	return contractName.substring(contractName.length - 5) === "_test";
}

const functionRegex = /^([ \t]{0,};;[ \t]{0,}@[\s\S]+?)\n[ \t]{0,}\(define-public[\s]+\((.+?)[ \t|)]/gm;
const metadataRegex = /^;;[ \t]{1,}@([a-z-]+)(?:$|[ \t]+?(.+?))$/;

function extractTestMetadata(contractSource: string) {
	const functionMeta = {};
	const matches = contractSource.replace(/\r/g, "").matchAll(functionRegex);
	for (const [, comments, functionName] of matches) {
		functionMeta[functionName] = {};
		const lines = comments.split("\n");
		for (const line of lines) {
			const [, prop, value] = line.match(metadataRegex) || [];
			if (prop)
				functionMeta[functionName][prop] = value ?? true;
		}
	}
	return functionMeta;
}

Clarinet.run({
	async fn(accounts: Map<string, Account>, contracts: Map<string, Contract>) {
		Deno.writeTextFile(`${targetFolder}/deps.ts`, generateDeps());

		for (const [contractId, contract] of contracts) {
			const contractName = getContractName(contractId);
			if (!isTestContract(contractName))
				continue;

			const hasDefaultPrepareFunction = contract.contract_interface.functions.reduce(
				(a, v) => a || (v.name === 'prepare' && v.access === 'public' && v.args.length === 0),
				false);
			const meta = extractTestMetadata(contract.source);

			const code: string[][] = [];
			code.push([
				warningText,
				``,
				`import { Clarinet, Tx, Chain, Account, types, assertEquals, bootstrap } from './deps.ts';`,
				``
			]);

			for (const { name, access, args } of contract.contract_interface.functions.reverse()) {
				if (access !== 'public' || name.substring(0, 5) !== 'test-')
					continue;
				if (args.length > 0)
					throw new Error(`Test functions cannot take arguments. (Offending function: ${name})`);
				const functionMeta = meta[name] || {};
				if (hasDefaultPrepareFunction && !functionMeta.prepare)
					functionMeta.prepare = 'prepare';
				if (functionMeta['no-prepare'])
					delete functionMeta.prepare;
				code.push([generateTest(contractId, name, functionMeta)]);
			}

			Deno.writeTextFile(`${targetFolder}/${contractName}.ts`, code.flat().join("\n"));
		}
	}
});

function generateTest(contractPrincipal: string, testFunction: string, meta: { [key: string]: string | boolean }) {
	return `Clarinet.test({
	name: "${meta.name ? testFunction + ': ' + (meta.name as string).replace(/"/g, '\\"') : testFunction}",
	async fn(chain: Chain, accounts: Map<string, Account>) {
		const deployer = accounts.get("deployer")!;
		bootstrap(chain, deployer);
		let callerAddress = ${meta.caller ? (meta.caller[0] === "'" ? `"${(meta.caller as string).substring(1)}"` : `accounts.get('${meta.caller}')!.address`) : `accounts.get('deployer')!.address`};
		let block = chain.mineBlock([
			${meta['prepare'] ? `Tx.contractCall('${contractPrincipal}', '${meta['prepare']}', [], deployer.address),` : ''}
			Tx.contractCall('${contractPrincipal}', '${testFunction}', [], callerAddress)
		]);
		block.receipts.map(({result}) => result.expectOk());
	}
});
`;
}

function generateDeps() {
	return `${warningText}

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

export { Clarinet, Tx, Chain, types, assertEquals };
export type { Account };

export const bootstrapContracts = [
];

export function bootstrap(chain: Chain, deployer: Account) {
}`;
}
