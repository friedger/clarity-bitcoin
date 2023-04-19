(define-public (parse-block-header (header (buff 80)))
    (contract-call? .clarity-bitcoin parse-block-header header))

(define-public (parse-tx (tx (buff 1024)))
    (contract-call? .clarity-bitcoin parse-tx tx))

(define-public (verify-bh (header (buff 80)) (bh uint))
    (ok (contract-call? .clarity-bitcoin verify-block-header header bh)))

(define-public (verify-mp (reverse-tx-id (buff 32)) (merkle-root (buff 32)) (proof { tx-index: uint, hashes: (list 14 (buff 32)), tree-depth: uint}))
    (contract-call? .clarity-bitcoin verify-merkle-proof reverse-tx-id merkle-root proof))

(define-public (was-tx-mined (height uint) (tx (buff 1024)) (header { version: (buff 4), parent: (buff 32), merkle-root: (buff 32), timestamp: (buff 4), nbits: (buff 4), nonce: (buff 4) }) (proof { tx-index: uint, hashes: (list 14 (buff 32)), tree-depth: uint}))
    (contract-call? .clarity-bitcoin was-tx-mined height tx header proof))

(define-public (was-tx-mined-compact (height uint) (tx (buff 1024)) (header (buff 80)) (proof { tx-index: uint, hashes: (list 14 (buff 32)), tree-depth: uint}))
    (contract-call? .clarity-bitcoin was-tx-mined-compact height tx header proof))

(define-public (concat-header (header { version: (buff 4), parent: (buff 32), merkle-root: (buff 32), timestamp: (buff 4), nbits: (buff 4), nonce: (buff 4) }))
  (ok (contract-call? .clarity-bitcoin-helper concat-header header)))

(define-public (get-rewards (height uint))
    (ok (contract-call? .stx-oracle get-rewards height)))

(define-public (get-sats-stx-price (height uint))
    (ok (contract-call? .stx-oracle get-sats-stx-price height)))
