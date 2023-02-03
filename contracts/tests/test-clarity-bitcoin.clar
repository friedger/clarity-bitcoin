
(define-private (test-parse-header (header (buff 80)) (expected {
                                                         version: uint,
                                                         parent: (buff 32),
                                                         merkle-root: (buff 32),
                                                         timestamp: uint,
                                                         nbits: uint,
                                                         nonce: uint
                                                      }))
    (match (contract-call? .clarity-bitcoin parse-block-header header)
        ok-header
             (if (is-eq ok-header expected)
                true
                (begin
                    (print "did not parse header:")
                    (print header)
                    (print "expected:")
                    (print expected)
                    (print "got:")
                    (print ok-header)
                    false
                )
             )
        err-res
            (begin
                (print "failed to parse header:")
                (print header)
                (print "error code:")
                (print err-res)
                false
            )
    )
)

(define-public (test-parse-bitcoin-headers)
    (begin
        (print "test-parse-bitcoin-headers 0")
        (asserts! (test-parse-header
            0x000000203c437224480966081c2b14afac79e58207d996c8ac9d32000000000000000000847a4c2c77c8ecf0416ca07c2dc038414f14135017e18525f85cacdeedb54244e0d6b958df620218c626368a
            {
                version: u536870912,
                parent: 0x000000000000000000329dacc896d90782e579acaf142b1c086609482472433c,
                merkle-root: 0x4442b5eddeac5cf82585e1175013144f4138c02d7ca06c41f0ecc8772c4c7a84,
                timestamp: u1488574176,
                nbits: u402809567,
                nonce: u2318804678
            })
            (err u0))

        (ok true)
    )
)

(define-public (test-verify-merkle-proof)
    (begin
        (print "test-verify-merkle-proof")
        (asserts! (try! (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9)      ;; txid (but big-endian)
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe      ;; merkle root (from block 150000)
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57  ;; sibling txid (in block 150000)
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9  ;; 3 intermediate double-sha256 hashes
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u6,                                                       ;; this transaction is at index 6 in the block (starts from 0)
                tree-depth: u4                                                      ;; merkle tree depth (must be given because we can't infer leaf/non-leaf nodes)
            }))
            (err u0))

        (asserts! (not (try! (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5aed46cf217ad9)      ;; CORRUPTED
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u6,
                tree-depth: u4
            })))
            (err u1))

        (asserts! (not (try! (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5afd46cf217ad9)
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2e6f130bbe                      ;; CORRUPTED
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u6,
                tree-depth: u4
            })))
            (err u2))

        (asserts! (not (try! (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5aed46cf217ad9)
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee58       ;; CORRUPTED
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u6,
                tree-depth: u4
            })))
            (err u3))

        (asserts! (not (try! (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5aed46cf217ad9)
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u7,                                                               ;; CORRUPTED
                tree-depth: u4
            })))
            (err u4))
        
        (asserts! (not (try! (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5aed46cf217ad9)
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u6,
                tree-depth: u3                                                              ;; CORRUPTED
            })))
            (err u5))

        (asserts! (is-eq ERR-PROOF-TOO-SHORT (unwrap-err-panic (contract-call? .clarity-bitcoin verify-merkle-proof
            (contract-call? .clarity-bitcoin reverse-buff32 0x25c6a1f8c0b5be2bee1e8dd3478b4ec8f54bbc3742eaf90bfb5aed46cf217ad9)
            0xb152eca4364850f3424c7ac2b337d606c5ca0a3f96f1554f8db33d2f6f130bbe
            {
                hashes: (list
                   0xae1e670bdbf8ab984f412e6102c369aeca2ced933a1de74712ccda5edaf4ee57
                   0xefc2b3db87ff4f00c79dfa8f732a23c0e18587a73a839b7710234583cdd03db9
                   0xf1b6fe8fc2ab800e6d76ee975a002d3e67a60b51a62085a07289505b8d03f149
                   0xe827331b1fe7a2689fbc23d14cd21317c699596cbca222182a489322ece1fa74
                ),
                tx-index: u6,                                                               ;; too long
                tree-depth: u5
            })))
            (err u6))
        (ok true)
    )
)

(define-public (unit-tests)
    (begin
        (print "unit tests")
        (asserts! (is-ok (test-parse-bitcoin-headers))
            (err u6))
        (asserts! (is-ok (test-verify-merkle-proof))
            (err u8))
        (ok u0)
    )
)

;; Error codes
(define-constant ERR-OUT-OF-BOUNDS u1)
(define-constant ERR-TOO-MANY-TXINS u2)
(define-constant ERR-TOO-MANY-TXOUTS u3)
(define-constant ERR-VARSLICE-TOO-LONG u4)
(define-constant ERR-BAD-HEADER u5)
(define-constant ERR-PROOF-TOO-SHORT u6)
