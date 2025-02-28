import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";
import { Error, verifyMerkleProof } from "./clients/clarity-bitcoin-client.ts";
import { hexToBytes } from "@noble/hashes/utils";
const accounts = simnet.getAccounts();

describe("Bitcoin library", () => {
  it("Ensure that tx ids are correctly constructed", () => {
    const deployer = accounts.get("deployer")!;
    let response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "get-txid",
      [
        Cl.bufferFromHex(
          "02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700"
        ),
      ],
      deployer
    );

    expect(response.result).toBeBuff(
      hexToBytes(
        "74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f"
      )
    );
  });

  it("Ensure that buffers are correctly reversed", () => {
    const deployer = accounts.get("deployer")!;
    let response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "reverse-buff32",
      [
        Cl.bufferFromHex(
          "74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f"
        ),
      ],
      deployer
    );
    expect(response.result).toBeBuff(
      hexToBytes(
        "1f7f8fa67090fd7958898e2eb7b8b223a0f90188b9743264f424c344ca50d374"
      )
    );
    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "reverse-buff32",
      [
        Cl.bufferFromHex(
          "0000000000000000000000000000000000000000000000000000000000000000"
        ),
      ],
      deployer
    );
    expect(response.result).toBeBuff(
      hexToBytes(
        "0000000000000000000000000000000000000000000000000000000000000000"
      )
    );

    try {
      simnet.callReadOnlyFn(
        "clarity-bitcoin",
        "reverse-buff32",
        [Cl.bufferFromHex("01")],
        deployer
      );
    } catch (e: any) {
      expect(e.toString()).toBe(
        'Call contract function error: clarity-bitcoin::reverse-buff32(0x01) -> Error calling contract function: Runtime error while interpreting ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin: Runtime(UnwrapFailure, Some([FunctionIdentifier { identifier: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.clarity-bitcoin:reverse-buff32" }, FunctionIdentifier { identifier: "_native_:special_as_max_len" }, FunctionIdentifier { identifier: "_native_:special_concat" }, FunctionIdentifier { identifier: "_native_:special_as_max_len" }, FunctionIdentifier { identifier: "_native_:native_unwrap" }]))'
      );
    }
  });

  it("Ensure that merkle proof can be validated", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
      // txid
      hexToBytes(
        "cb2e23bc96049cb71489f7e98817888a927b618e9d21700120c59b4f762f16f1"
      ),
      // reversed merkle root
      hexToBytes(
        "c9c02be3c9d6a3d97f048d19ffff34817ffa54e7eec51bac79bca5807f64375a"
      ),
      {
        hashes: [
          // sibling txid (in block 150000)
          hexToBytes(
            "f1162f764f9bc5200170219d8e617b928a881788e9f78914b79c0496bc232ecb"
          ),
          // 1 intermediate double-sha256 hashes
          hexToBytes(
            "7614716e165ae0cada0d4cd994bb195ca8010fd17c388825ca4c81843d14f9d8"
          ),
        ],
        txIndex: 2, // this transaction is at index 6 in the block (starts from 0)
        treeDepth: 2, // merkle tree depth (must be given because we can't infer leaf/non-leaf nodes)
      },
      deployer
    );

    expect(response.result).toBeOk(Cl.bool(true));
  });
  it("Ensure that merkle proof can be validated", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
      hexToBytes(
        "25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9"
      ),
      hexToBytes(
        "b152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe"
      ),
      {
        hashes: [
          // reversed sibling txid (in block 150000)
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
    );

    expect(response.result).toBeOk(Cl.bool(true));
  });
  it("Ensure that merkle proof with wrong txid is detected", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
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
    );

    expect(response.result).toBeOk(Cl.bool(false));
  });
  it("Ensure that merkle proof with wrong merkle root is detected", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
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
    );

    expect(response.result).toBeOk(Cl.bool(false));
  });

  it("Ensure that merkle proof with wrong tree is detected", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
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
    );

    expect(response.result).toBeOk(Cl.bool(false));
  });

  it("Ensure that merkle proof with wrong tx index is detected", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
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
    );

    expect(response.result).toBeOk(Cl.bool(false));
  });

  it("Ensure that merkle proof with smaller tree depth is detected", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
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
    );

    expect(response.result).toBeOk(Cl.bool(false));
  });
  it("Ensure that merkle proof with larger tree depth is detected", () => {
    const deployer = accounts.get("deployer")!;
    let response = verifyMerkleProof(
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
    );

    expect(response.result).toBeErr(Cl.uint(Error.ERR_PROOF_TOO_SHORT));
  });
  it("Ensure is-bit-set determines if the bit in a uint is set to 1", () => {
    const deployer = accounts.get("deployer")!;
    let response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(10), Cl.uint(0)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(10), Cl.uint(1)],
      deployer
    );
    expect(response.result).toBeBool(true);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(51), Cl.uint(2)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(51), Cl.uint(3)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(255), Cl.uint(7)],
      deployer
    );
    expect(response.result).toBeBool(true);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(0), Cl.uint(0)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(255), Cl.uint(0)],
      deployer
    );
    expect(response.result).toBeBool(true);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(255), Cl.uint(7)],
      deployer
    );
    expect(response.result).toBeBool(true);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(128), Cl.uint(7)],
      deployer
    );
    expect(response.result).toBeBool(true);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(240), Cl.uint(4)],
      deployer
    );
    expect(response.result).toBeBool(true);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(42), Cl.uint(2)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(255), Cl.uint(8)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(1), Cl.uint(1)],
      deployer
    );
    expect(response.result).toBeBool(false);

    response = simnet.callReadOnlyFn(
      "clarity-bitcoin",
      "is-bit-set",
      [Cl.uint(1), Cl.uint(0)],
      deployer
    );
    expect(response.result).toBeBool(true);
  });
});
