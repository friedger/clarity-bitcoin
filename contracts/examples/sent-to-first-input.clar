(define-constant SATS-PER-STX u1000)
(define-constant err-not-found (err u404))

;; TODO get price from miners
(define-read-only (sats-to-stx (sats uint))
    (/ sats SATS-PER-STX))

(define-read-only (p2pkh-to-principal (scriptSig (buff 256)))
    ;; FIXME
    (as-contract tx-sender))

(define-public (send-to-first-input (height uint) (tx (buff 1024)) (header (buff 80)) (proof { tx-index: uint, hashes: (list 12 (buff 32)), tree-depth: uint }))
    (let (
        ;; extract parts of Bitcoin transaction
        (tx-obj (try! (contract-call? .clarity-bitcoin parse-tx tx)))
        (was-mined (try! (contract-call? .clarity-bitcoin was-tx-mined-header-buff header height tx proof)))
        (first-output (unwrap! (element-at (get outs tx-obj) u0) err-not-found))
        (first-input (unwrap! (element-at (get ins tx-obj) u0) err-not-found))
        )
        ;; TODO check whether the tx-sender is the same as the first output
        
        ;; transfer stx to first-input
        (if was-mined
            (stx-transfer? (sats-to-stx (get value first-output)) tx-sender (p2pkh-to-principal (get scriptSig first-input)))
            err-not-found
        )))