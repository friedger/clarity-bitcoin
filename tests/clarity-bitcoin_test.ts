import { Clarinet, Tx, Chain, Account, types, assertEquals } from "./deps.ts";
import { hexToBytes } from "./utils.ts";
import { verifyMerkleProof, Error } from "./clients/clarity-bitcoin-client.ts";

Clarinet.test({
  name: "Ensure that tx ids are correctly constructed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall(
        "clarity-bitcoin",
        "get-txid",
        [
          "0x02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700",
        ],
        deployer.address
      ),
    ]);

    block.receipts[0].result.expectBuff(
      hexToBytes(
        "74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f"
      )
    );
  },
});

Clarinet.test({
  name: "Ensure that merkle proof can be validated",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
        ),
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe"
        ),
        {
          hashes: [
            // sibling txid (in block 150000)
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57"
            ),
            // 3 intermediate double-sha256 hashes
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          txIndex: 6, // this transaction is at index 6 in the block (starts from 0)
          treeDepth: 4, // merkle tree depth (must be given because we can't infer leaf/non-leaf nodes)
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "Ensure that merkle proof with wrong txid is detected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        // CORRUPTED
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5aed46cf217ad9"
        ),
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2e6f130bbe"
        ),
        {
          hashes: [
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57"
            ),
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          txIndex: 6,
          treeDepth: 4,
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "Ensure that merkle proof with wrong merkle root is detected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
        ),
        // CORRUPTED
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2e6f130bbe"
        ),
        {
          hashes: [
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57"
            ),
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          txIndex: 6,
          treeDepth: 4,
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "Ensure that merkle proof with wrong tree is detected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
        ),
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe"
        ),
        {
          hashes: [
            // CORRUPTED
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee58"
            ),
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          txIndex: 6,
          treeDepth: 4,
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "Ensure that merkle proof with wrong tx index is detected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
        ),
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe"
        ),
        {
          hashes: [
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57"
            ),
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          // CORRUPTED
          txIndex: 7,
          treeDepth: 4,
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "Ensure that merkle proof with smaller tree depth is detected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
        ),
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe"
        ),
        {
          hashes: [
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57"
            ),
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          txIndex: 6,
          // CORRUPTED
          treeDepth: 3,
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "Ensure that merkle proof with larger tree depth is detected",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      verifyMerkleProof(
        hexToBytes(
          "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
        ),
        hexToBytes(
          "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe"
        ),
        {
          hashes: [
            hexToBytes(
              "ae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57"
            ),
            hexToBytes(
              "efc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9"
            ),
            hexToBytes(
              "f1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149"
            ),
            hexToBytes(
              "e827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74"
            ),
          ],
          txIndex: 6,
          // TOO LONG
          treeDepth: 5,
        },
        deployer
      ),
    ]);

    block.receipts[0].result.expectErr().expectUint(Error.ERR_TOO_SHORT);
  },
});
