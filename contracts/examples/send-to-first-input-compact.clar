(define-constant SATS_PER_STX u1000)
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_UNSUPPORTED_TX (err u500))
(define-constant ERR_OUT_NOT_FOUND (err u501))
(define-constant ERR_IN_NOT_FOUND (err u502))

;; TODO get price from miners
(define-read-only (sats-to-stx (sats uint))
  (/ sats SATS_PER_STX)
)

;; for compressed public keys
(define-read-only (p2pkh-to-principal (scriptSig (buff 1376)))
  (let ((pk (unwrap!
      (as-max-len?
        (unwrap! (slice? scriptSig (- (len scriptSig) u33) (len scriptSig)) none)
        u33
      )
      none
    )))
    (some (unwrap! (principal-of? pk) none))
  )
)

(define-public (send-to-first-input
    (height uint)
    (tx (buff 4096))
    (header (buff 80))
    (proof {
      tx-index: uint,
      hashes: (list 14 (buff 32)),
      tx-count: uint,
    })
  )
  (let (
      ;; extract parts of Bitcoin transaction
      (tx-obj (try! (contract-call? .clarity-bitcoin parse-tx tx)))
      (tx-id-of-mined-tx (try! (contract-call? .clarity-bitcoin was-tx-mined-compact height tx header
        proof
      )))
      (first-output (unwrap! (element-at (get outs tx-obj) u0) ERR_OUT_NOT_FOUND))
      (first-input (unwrap! (element-at (get ins tx-obj) u0) ERR_IN_NOT_FOUND))
    )
    ;; TODO check whether the tx-sender is the same as the first output

    ;; transfer stx to first-input
    (stx-transfer? (sats-to-stx (get value first-output)) tx-sender
      (unwrap! (p2pkh-to-principal (get scriptSig first-input))
        ERR_UNSUPPORTED_TX
      ))
  )
)
