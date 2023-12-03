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

;; @name concat header
;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
(define-public (test-concat-header)
   (let ((result (contract-call? .clarity-bitcoin-helper concat-header
      {merkle-root: 0x9160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f,
      version: 0x0000a020,
      nbits: 0x88a12719,
      nonce: 0x9842cec7,
      timestamp: 0x18b84864,
      parent: 0x65bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d00000000000000
      })))
    (asserts! (is-eq result 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7) (err result))
    (ok true)))
