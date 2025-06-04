(define-public (test-parse-raw-coinbase-transaction (txbuff (buff 4096)))
  (match
     (parse-tx txbuff)
        parsed-tx (let ((encoded-tx (contract-call? .clarity-bitcoin-helper concat-tx 
          {ins: (list), ;;(get ins parsed-tx),
           outs: (list), ;;(get outs parsed-tx),
           locktime: (to-buff-4 (get locktime parsed-tx)),
           version: (to-buff-4 (get version parsed-tx)),
          })))
          (asserts! (is-eq encoded-tx txbuff) (err 999))
          (ok true))
        error (ok false)
  )
)

(define-private (to-buff-4 (value uint))
  (unwrap-panic (as-max-len? (unwrap-panic (slice? (unwrap-panic (to-consensus-buff? value)) u5 u9)) u4)))