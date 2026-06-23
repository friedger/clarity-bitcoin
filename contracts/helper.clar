(define-public (parse-block-header (header (buff 80)))
  (contract-call? .clarity-bitcoin parse-block-header header)
)

(define-public (parse-tx (tx (buff 1024)))
  (contract-call? .clarity-bitcoin parse-tx tx)
)

(define-public (verify-bh
    (header (buff 80))
    (bh uint)
  )
  (ok (contract-call? .clarity-bitcoin verify-block-header header bh))
)

;; verify-merkle-proof is a Clarity 6 native builtin, so it cannot be reached through
;; contract-call?. Call it directly. The proof carries the block's real tx-count, which
;; the native needs for Bitcoin's "duplicate the last node on odd rows" rule.
(define-read-only (verify-mp
    (reverse-tx-id (buff 32))
    (merkle-root (buff 32))
    (proof {
      tx-index: uint,
      hashes: (list 14 (buff 32)),
      tx-count: uint,
    })
  )
  (ok (verify-merkle-proof reverse-tx-id merkle-root (get tx-index proof)
    (get tx-count proof) (get hashes proof)
  ))
)

(define-public (was-tx-mined-compact
    (height uint)
    (tx (buff 1024))
    (header (buff 80))
    (proof {
      tx-index: uint,
      hashes: (list 14 (buff 32)),
      tx-count: uint,
    })
  )
  (contract-call? .clarity-bitcoin was-tx-mined-compact height tx header proof)
)

(define-public (concat-header (header {
  version: (buff 4),
  parent: (buff 32),
  merkle-root: (buff 32),
  timestamp: (buff 4),
  nbits: (buff 4),
  nonce: (buff 4),
}))
  (ok (contract-call? .clarity-bitcoin-helper concat-header header))
)
