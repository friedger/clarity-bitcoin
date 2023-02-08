(define-constant SATS-PER-STX u1000)
(define-constant err-not-found (err u404))
(define-constant err-unsupported-tx (err u500))
(define-constant err-out-not-found (err u501))
(define-constant err-in-not-found (err u502))


;; TODO get price from miners
(define-read-only (sats-to-stx (sats uint))
    (/ sats SATS-PER-STX))

(define-read-only (p2pkh-to-principal (scriptSig (buff 256)))
  (let ((pk (unwrap! (as-max-len? (unwrap! (slice? scriptSig u73 u106) none) u33) none)))
    (some (unwrap! (principal-of? pk) none))))

(define-public (send-to-first-input (height uint) (tx (buff 1024)) (header (buff 80)) (proof { tx-index: uint, hashes: (list 14 (buff 32)), tree-depth: uint}))
    (let (
        ;; extract parts of Bitcoin transaction
          (tx-obj (try! (contract-call? .clarity-bitcoin parse-tx tx))))
        (send-to-first-input-internal height tx tx-obj header proof)))

;; must be call with tx-obj of the tx
(define-private (send-to-first-input-internal (height uint) (tx (buff 1024)) (tx-obj {version: uint,
                                                                                      ins: (list 8
                                                                                            {outpoint: {hash: (buff 32), index: uint}, scriptSig: (buff 256), sequence: uint}),
                                                                                      outs: (list 8
                                                                                             {value: uint, scriptPubKey: (buff 128)}),
                                                                                      locktime: uint}) (header (buff 80)) (proof { tx-index: uint, hashes: (list 14 (buff 32)), tree-depth: uint}))
    (let ((was-mined (try! (contract-call? .clarity-bitcoin was-tx-mined-compact height tx header proof)))
          (first-output (unwrap! (element-at (get outs tx-obj) u0) err-out-not-found))
          (first-input (unwrap! (element-at (get ins tx-obj) u0) err-in-not-found)))
        ;; TODO check whether the tx-sender is the same as the first output

        ;; transfer stx to first-input
        (if was-mined
            (stx-transfer? (sats-to-stx (get value first-output)) tx-sender (unwrap! (p2pkh-to-principal (get scriptSig first-input)) err-unsupported-tx))
            err-not-found)))