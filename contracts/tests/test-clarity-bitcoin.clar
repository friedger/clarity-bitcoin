;; list of tests to run (also includes unit tests)
(define-public (list-tests)
    (begin
       (ok (list
           "unit-tests"
       ))
    )
)

(define-private (test-parse-tx (tx (buff 1024)) (expected {
                                                    version: uint,
                                                    locktime: uint,
                                                    ins: (list 8 { outpoint: { hash: (buff 32), index: uint }, scriptSig: (buff 256), sequence: uint }),
                                                    outs: (list 8 { value: uint, scriptPubKey: (buff 128) })
                                                }))
    (match (contract-call? .clarity-bitcoin parse-tx tx)
        ok-tx
             (if (is-eq ok-tx expected)
                true
                (begin
                    (print "did not parse:")
                    (print tx)
                    (print "expected:")
                    (print expected)
                    (print "got:")
                    (print ok-tx)
                    false
                )
             )
        err-res
            (begin
                (print "failed to parse:")
                (print tx)
                (print "error code:")
                (print err-res)
                false
            )
    )
)

(define-private (test-parse-simple-bitcoin-txs)
    (begin
        (print "test-parse-simple-bitcoin-txs 0")
        (asserts! (test-parse-tx
            0x02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700
            {
                ins: (list
                    {
                        outpoint: {
                            hash: 0xebe4a9f567fb6b130bd4a7eb0c00124ef9dc30663c0b61de4311ea601525699b, 
                            index: u0
                        }, 
                        scriptSig: 0x483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5, 
                        sequence: u4294967294
                    }
                ),
                locktime: u509243, 
                outs: (list
                    {
                        scriptPubKey: 0x76a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788ac, 
                        value: u66217000
                    }
                    {
                        scriptPubKey: 0x76a9149049b676cf05040103135c7342bcc713a816700688ac, 
                        value: u1429803185
                    }
                ),
                version: u2
            })
            (err u0))

        (print "test-parse-simple-bitcoin-txs 1")
        (asserts! (test-parse-tx
            0x01000000011111111111111111111111111111111111111111111111111111111111111112000000006b483045022100eba8c0a57c1eb71cdfba0874de63cf37b3aace1e56dcbd61701548194a79af34022041dd191256f3f8a45562e5d60956bb871421ba69db605716250554b23b08277b012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d000000000040000000000000000536a4c5069645b22222222222222222222222222222222222222222222222222222222222222223333333333333333333333333333333333333333333333333333333333333333404142435051606162637071fa39300000000000001976a914000000000000000000000000000000000000000088ac39300000000000001976a914000000000000000000000000000000000000000088aca05b0000000000001976a9140be3e286a15ea85882761618e366586b5574100d88ac00000000
            {
                version: u1,
                locktime: u0,
                ins: (list
                    {
                        outpoint: {
                            hash: 0x1211111111111111111111111111111111111111111111111111111111111111,
                            index: u0
                        },
                        scriptSig: 0x483045022100eba8c0a57c1eb71cdfba0874de63cf37b3aace1e56dcbd61701548194a79af34022041dd191256f3f8a45562e5d60956bb871421ba69db605716250554b23b08277b012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d0,
                        sequence: u0
                    }
                ),
                outs: (list
                    {
                        scriptPubKey: 0x6a4c5069645b22222222222222222222222222222222222222222222222222222222222222223333333333333333333333333333333333333333333333333333333333333333404142435051606162637071fa,
                        value: u0
                    }
                    {
                        scriptPubKey: 0x76a914000000000000000000000000000000000000000088ac,
                        value: u12345
                    }
                    {
                        scriptPubKey: 0x76a914000000000000000000000000000000000000000088ac,
                        value: u12345
                    }
                    {
                        scriptPubKey: 0x76a9140be3e286a15ea85882761618e366586b5574100d88ac,
                        value: u23456
                    }
                )
            })
            (err u1))

        (print "test-parse-simple-bitcoin-txs 2")
        (asserts! (test-parse-tx
            0x01000000011111111111111111111111111111111111111111111111111111111111111112000000006a473044022037d0b9d4e98eab190522acf5fb8ea8e89b6a4704e0ac6c1883d6ffa629b3edd30220202757d710ec0fb940d1715e02588bb2150110161a9ee08a83b750d961431a8e012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d000000000020000000000000000396a3769645e2222222222222222222222222222222222222222a366b51292bef4edd64063d9145c617fec373bceb0758e98cd72becd84d54c7a39300000000000001976a9140be3e286a15ea85882761618e366586b5574100d88ac00000000
            {
                version: u1,
                locktime: u0,
                ins: (list
                    {
                        outpoint: {
                            hash: 0x1211111111111111111111111111111111111111111111111111111111111111,
                            index: u0
                        }, 
                        scriptSig: 0x473044022037d0b9d4e98eab190522acf5fb8ea8e89b6a4704e0ac6c1883d6ffa629b3edd30220202757d710ec0fb940d1715e02588bb2150110161a9ee08a83b750d961431a8e012102d8015134d9db8178ac93acbc43170a2f20febba5087a5b0437058765ad5133d0, 
                        sequence: u0
                    }
                ),
                outs: (list
                    {
                        scriptPubKey: 0x6a3769645e2222222222222222222222222222222222222222a366b51292bef4edd64063d9145c617fec373bceb0758e98cd72becd84d54c7a, 
                        value: u0
                    } 
                    {
                        scriptPubKey: 0x76a9140be3e286a15ea85882761618e366586b5574100d88ac, 
                        value: u12345
                    }
                )
            })
            (err u2))
           
        (ok true)
    )
)

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

(define-private (test-parse-bitcoin-headers)
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

(define-private (test-get-txid)
    (begin
        (print "test-get-txid")
        (asserts! (is-eq
            0x74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f
            (contract-call? .clarity-bitcoin get-txid 0x02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700))
            (err u0))

        (ok true)
    )
)

(define-private (test-verify-merkle-proof)
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
        (asserts! (is-ok (test-parse-simple-bitcoin-txs))
            (err u5))
        (asserts! (is-ok (test-parse-bitcoin-headers))
            (err u6))
        (asserts! (is-ok (test-get-txid))
            (err u7))
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
