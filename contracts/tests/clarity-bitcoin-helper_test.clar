;; @name concat tx with empty data
(define-public (test-concat-tx-empty)
  (let ((result (contract-call? .clarity-bitcoin-helper concat-tx
                               {ins: (list), outs: (list), version: 0x, locktime: 0x})))
    (asserts! (is-eq result 0x0000) (err result))
    (ok true)))

;; @name concat tx with most data possible per in and out
(define-public (test-concat-tx-max-1)
  (let ((result (contract-call? .clarity-bitcoin-helper concat-tx
                               {ins: (list {outpoint: {hash: 0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00, index: 0x00112233}, scriptSig: 0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00, sequence: 0x11223344}
                               ),
                               outs: (list {value: 0x0011223344556677, scriptPubKey: 0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00}),
                               version: 0x11223344, locktime: 0x44332211})))
    (asserts! (is-eq result 0x1122334401112233445566778899aabbccddeeff00112233445566778899aabbccddeeff000011223380112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff001122334401001122334455667780112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff0044332211) (err result))
    (ok true)))

