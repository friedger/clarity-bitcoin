;; @contract stateless contract to verify bitcoin transaction
;; @version 6

;; version 6 increases the transactions limits
;; - max tx size is 4096 bytes (including coinbase tx)
;; - max 50 inputs
;; - max 50 outputs
;; - max size of scriptSig is 1376 bytes
;; - max size of scriptPubKey is 1376 bytes
;; - max 13 witness items per input
;; - max size of witness item is 1376 bytes
;;
;; version 6 also uses the Clarity 6 native builtins for the cost-heavy paths:
;; - `verify-merkle-proof` replaces the hand-rolled merkle verification. The native
;;   builtin needs the block's real transaction count to apply Bitcoin's "duplicate the
;;   last node on odd rows" rule, so the proof format carries `tx-count` (the number of
;;   transactions in the block) instead of `tree-depth`. A depth-derived value such as
;;   `2^tree-depth` is NOT correct: many tx-counts share a tree depth but produce
;;   different odd-row boundaries, so it fails for transactions past an odd boundary in
;;   any non-power-of-two block. The merkle tree depth is still recoverable as
;;   `(len hashes)` = `ceil(log2(tx-count))`.
;; - `get-bitcoin-tx-output?` replaces parsing the whole coinbase to find the BIP-141
;;   witness commitment; the caller passes the commitment output index instead.
;; As a result the user-defined `verify-merkle-proof` / `inner-merkle-proof-verify` and
;; the `*-commitment-scriptPubKey` helpers are removed from the contract API.

;; Error codes
(define-constant ERR_OUT_OF_BOUNDS (err u1))
(define-constant ERR_TOO_MANY_TXINS (err u2))
(define-constant ERR_TOO_MANY_TXOUTS (err u3))
(define-constant ERR_VARSLICE_TOO_LONG (err u4))
(define-constant ERR_BAD_HEADER (err u5))
(define-constant ERR_HEADER_HEIGHT_MISMATCH (err u6))
(define-constant ERR_INVALID_MERKLE_PROOF (err u7))
;; u8 (was ERR-PROOF-TOO-SHORT) is now owned by the native verify-merkle-proof error path
(define-constant ERR_TOO_MANY_WITNESSES (err u9))
(define-constant ERR_INVALID_COMMITMENT (err u10))
(define-constant ERR_WITNESS_TX_NOT_IN_COMMITMENT (err u11))
(define-constant ERR_NOT_SEGWIT_TRANSACTION (err u12))
(define-constant ERR_LEFTOVER_DATA (err u13))

;;
;; Helper functions to parse bitcoin transactions
;;

;; Create a list with n elments `true`. n must be not greater than 50.
(define-private (bool-list-of-len (n uint))
  (unwrap-panic (slice?
    (list
      true true true true true true true true true true true true true true
      true true true true true true true true true true true true true true
      true true true true true true true true true true true true true true
      true true true true true true true true
    )
    u0 n
  ))
)

;; Reads the next two bytes from txbuff as a little-endian 16-bit integer, and updates the index.
;; Returns (ok { uint16: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff
(define-read-only (read-uint8 (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (data (get txbuff ctx))
      (base (get index ctx))
    )
    (ok {
      uint8: (buff-to-uint-le (unwrap-panic (as-max-len?
        (unwrap! (slice? data base (+ base u1)) ERR_OUT_OF_BOUNDS) u1
      ))),
      ctx: {
        txbuff: data,
        index: (+ u1 base),
      },
    })
  )
)

;; Reads the next two bytes from txbuff as a little-endian 16-bit integer, and updates the index.
;; Returns (ok { uint16: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff
(define-read-only (read-uint16 (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (data (get txbuff ctx))
      (base (get index ctx))
    )
    (ok {
      uint16: (buff-to-uint-le (unwrap-panic (as-max-len?
        (unwrap! (slice? data base (+ base u2)) ERR_OUT_OF_BOUNDS) u2
      ))),
      ctx: {
        txbuff: data,
        index: (+ u2 base),
      },
    })
  )
)

;; Reads the next four bytes from txbuff as a little-endian 32-bit integer, and updates the index.
;; Returns (ok { uint32: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff
(define-read-only (read-uint32 (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (data (get txbuff ctx))
      (base (get index ctx))
    )
    (ok {
      uint32: (buff-to-uint-le (unwrap-panic (as-max-len?
        (unwrap! (slice? data base (+ base u4)) ERR_OUT_OF_BOUNDS) u4
      ))),
      ctx: {
        txbuff: data,
        index: (+ u4 base),
      },
    })
  )
)

;; Reads the next eight bytes from txbuff as a little-endian 64-bit integer, and updates the index.
;; Returns (ok { uint64: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff
(define-read-only (read-uint64 (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (data (get txbuff ctx))
      (base (get index ctx))
    )
    (ok {
      uint64: (buff-to-uint-le (unwrap-panic (as-max-len?
        (unwrap! (slice? data base (+ base u8)) ERR_OUT_OF_BOUNDS) u8
      ))),
      ctx: {
        txbuff: data,
        index: (+ u8 base),
      },
    })
  )
)

;; Reads the next varint from txbuff, and updates the index.
;; Returns (ok { varint: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
(define-read-only (read-varint (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (ptr (get index ctx))
      (tx (get txbuff ctx))
      (byte (buff-to-uint-le (unwrap! (element-at tx ptr) ERR_OUT_OF_BOUNDS)))
    )
    (if (<= byte u252)
      ;; given byte is the varint
      (ok {
        varint: byte,
        ctx: {
          txbuff: tx,
          index: (+ u1 ptr),
        },
      })
      (if (is-eq byte u253)
        (let (
            ;; next two bytes is the varint
            (parsed-u16 (try! (read-uint16 {
              txbuff: tx,
              index: (+ u1 ptr),
            })))
          )
          (ok {
            varint: (get uint16 parsed-u16),
            ctx: (get ctx parsed-u16),
          })
        )
        (if (is-eq byte u254)
          (let (
              ;; next four bytes is the varint
              (parsed-u32 (try! (read-uint32 {
                txbuff: tx,
                index: (+ u1 ptr),
              })))
            )
            (ok {
              varint: (get uint32 parsed-u32),
              ctx: (get ctx parsed-u32),
            })
          )
          (let (
              ;; next eight bytes is the varint
              (parsed-u64 (try! (read-uint64 {
                txbuff: tx,
                index: (+ u1 ptr),
              })))
            )
            (ok {
              varint: (get uint64 parsed-u64),
              ctx: (get ctx parsed-u64),
            })
          )
        )
      )
    )
  )
)

;; Reads a varint-prefixed byte slice from txbuff, and updates the index to point to the byte after the varint and slice.
;; Returns (ok { varslice: (buff 4096), ctx: { txbuff: (buff 4096), index: uint } }) on success, where varslice has the length of the varint prefix.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
(define-read-only (read-varslice (old-ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (parsed (try! (read-varint old-ctx)))
      (ctx (get ctx parsed))
      (slice-start (get index ctx))
      (target-index (+ slice-start (get varint parsed)))
      (txbuff (get txbuff ctx))
    )
    (ok {
      varslice: (unwrap! (slice? txbuff slice-start target-index) ERR_OUT_OF_BOUNDS),
      ctx: {
        txbuff: txbuff,
        index: target-index,
      },
    })
  )
)

(define-private (reverse-buff16 (input (buff 16)))
  (unwrap-panic (slice? (unwrap-panic (to-consensus-buff? (buff-to-uint-le input))) u1 u17))
)

(define-read-only (reverse-buff32 (input (buff 32)))
  (unwrap-panic (as-max-len?
    (concat
      (reverse-buff16 (unwrap-panic (as-max-len? (unwrap-panic (slice? input u16 u32)) u16)))
      (reverse-buff16 (unwrap-panic (as-max-len? (unwrap-panic (slice? input u0 u16)) u16)))
    )
    u32
  ))
)

;; Reads a little-endian hash -- consume the next 32 bytes, and reverse them.
;; Returns (ok { hashslice: (buff 32), ctx: { txbuff: (buff 4096), index: uint } }) on success, and updates the index.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
(define-read-only (read-hashslice (old-ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (slice-start (get index old-ctx))
      (target-index (+ u32 slice-start))
      (txbuff (get txbuff old-ctx))
      (hash-le (unwrap-panic (as-max-len?
        (unwrap! (slice? txbuff slice-start target-index) ERR_OUT_OF_BOUNDS)
        u32
      )))
    )
    (ok {
      hashslice: (reverse-buff32 hash-le),
      ctx: {
        txbuff: txbuff,
        index: target-index,
      },
    })
  )
)

;; Inner fold method to read the next tx input from txbuff.
;; The index in ctx will be updated to point to the next tx input if all goes well (or to the start of the outputs)
;; Returns (ok { ... }) on success.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptSig that's too long to parse.
;; Returns ERR_TOO_MANY_TXINS if there are more than eight inputs to read.
(define-read-only (read-next-txin
    (ignored bool)
    (result (response {
      ctx: {
        txbuff: (buff 4096),
        index: uint,
      },
      remaining: uint,
      txins: (list 50
        {
          outpoint: {
            hash: (buff 32),
            index: uint,
          },
          scriptSig: (buff 1376), ;; just big enough to hold a 3-of-5 multisig script
          sequence: uint,
        }
      ),
    }
      uint
    ))
  )
  (let ((state (unwrap! result result)))
    (let (
        (remaining (get remaining state))
        (ctx (get ctx state))
        (parsed-hash (try! (read-hashslice ctx)))
        (parsed-index (try! (read-uint32 (get ctx parsed-hash))))
        (parsed-scriptSig (try! (read-varslice (get ctx parsed-index))))
        (parsed-sequence (try! (read-uint32 (get ctx parsed-scriptSig))))
        (new-ctx (get ctx parsed-sequence))
      )
      (ok {
        ctx: new-ctx,
        remaining: (- remaining u1),
        txins: (unwrap!
          (as-max-len?
            (append (get txins state) {
              outpoint: {
                hash: (get hashslice parsed-hash),
                index: (get uint32 parsed-index),
              },
              scriptSig: (unwrap! (as-max-len? (get varslice parsed-scriptSig) u1376)
                ERR_VARSLICE_TOO_LONG
              ),
              sequence: (get uint32 parsed-sequence),
            })
            u50
          )
          ERR_TOO_MANY_TXINS
        ),
      })
    )
  )
)

;; Read a transaction's inputs.
;; Returns (ok { txins: (list { ... }), remaining: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success, and updates the index in ctx to point to the start of the tx outputs.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptSig that's too long to parse.
;; Returns ERR_TOO_MANY_TXINS if there are more than eight inputs to read.
(define-read-only (read-txins (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (parsed-num-txins (try! (read-varint ctx)))
      (num-txins (get varint parsed-num-txins))
      (new-ctx (get ctx parsed-num-txins))
    )
    (if (> num-txins u50)
      ERR_TOO_MANY_TXINS
      (fold read-next-txin (bool-list-of-len num-txins)
        (ok {
          ctx: new-ctx,
          remaining: num-txins,
          txins: (list),
        })
      )
    )
  )
)

;; Read the next transaction output, and update the index in ctx to point to the next output.
;; Returns (ok { ... }) on success
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptPubKey that's too long to parse.
;; Returns ERR_TOO_MANY_TXOUTS if there are more than eight outputs to read.
(define-read-only (read-next-txout
    (ignored bool)
    (result (response {
      ctx: {
        txbuff: (buff 4096),
        index: uint,
      },
      txouts: (list 50 {
        value: uint,
        scriptPubKey: (buff 1376),
      }),
    }
      uint
    ))
  )
  (let (
      (state (unwrap! result result))
      (parsed-value (try! (read-uint64 (get ctx state))))
      (parsed-script (try! (read-varslice (get ctx parsed-value))))
      (new-ctx (get ctx parsed-script))
    )
    (ok {
      ctx: new-ctx,
      txouts: (unwrap!
        (as-max-len?
          (append (get txouts state) {
            value: (get uint64 parsed-value),
            scriptPubKey: (unwrap! (as-max-len? (get varslice parsed-script) u1376)
              ERR_VARSLICE_TOO_LONG
            ),
          })
          u50
        )
        ERR_TOO_MANY_TXOUTS
      ),
    })
  )
)

;; Read all transaction outputs in a transaction.  Update the index to point to the first byte after the outputs, if all goes well.
;; Returns (ok { txouts: (list { ... }), remaining: uint, ctx: { txbuff: (buff 4096), index: uint } }) on success, and updates the index in ctx to point to the start of the tx outputs.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptPubKey that's too long to parse.
;; Returns ERR_TOO_MANY_TXOUTS if there are more than eight outputs to read.
(define-read-only (read-txouts (ctx {
  txbuff: (buff 4096),
  index: uint,
}))
  (let (
      (parsed-num-txouts (try! (read-varint ctx)))
      (num-txouts (get varint parsed-num-txouts))
      (new-ctx (get ctx parsed-num-txouts))
    )
    (if (> num-txouts u50)
      ERR_TOO_MANY_TXOUTS
      (fold read-next-txout (bool-list-of-len num-txouts)
        (ok {
          ctx: new-ctx,
          txouts: (list),
        })
      )
    )
  )
)

;; Read the stack item of the witness field, and update the index in ctx to point to the next item.
(define-read-only (read-next-item
    (ignored bool)
    (result (response {
      ctx: {
        txbuff: (buff 4096),
        index: uint,
      },
      items: (list 13 (buff 1376)),
    }
      uint
    ))
  )
  (let (
      (state (unwrap! result result))
      (parsed-item (try! (read-varslice (get ctx state))))
      (new-ctx (get ctx parsed-item))
    )
    (ok {
      ctx: new-ctx,
      items: (unwrap!
        (as-max-len?
          (append (get items state)
            (unwrap! (as-max-len? (get varslice parsed-item) u1376)
              ERR_VARSLICE_TOO_LONG
            ))
          u13
        )
        ERR_TOO_MANY_WITNESSES
      ),
    })
  )
)

;; Read the next witness data, and update the index in ctx to point to the next witness.
(define-read-only (read-next-witness
    (ignored bool)
    (result (response {
      ctx: {
        txbuff: (buff 4096),
        index: uint,
      },
      witnesses: (list 50 (list 13 (buff 1376))),
    }
      uint
    ))
  )
  (let (
      (state (unwrap! result result))
      (parsed-num-items (try! (read-varint (get ctx state))))
      (ctx (get ctx parsed-num-items))
      (varint (get varint parsed-num-items))
    )
    (if (> varint u0)
      ;; read all stack items for current txin and add to witnesses.
      (let ((parsed-items (try! (fold read-next-item (bool-list-of-len varint)
          (ok {
            ctx: ctx,
            items: (list),
          })
        ))))
        (ok {
          witnesses: (unwrap-panic (as-max-len? (append (get witnesses state) (get items parsed-items))
            u50
          )),
          ctx: (get ctx parsed-items),
        })
      )
      ;; txin has not witness data, add empty list to witnesses.
      (ok {
        witnesses: (unwrap-panic (as-max-len? (append (get witnesses state) (list)) u50)),
        ctx: ctx,
      })
    )
  )
)

;; Read all witness data in a transaction.  Update the index to point to the end of the tx, if all goes well.
;; Returns (ok {witnesses: (list 50 (list 13 (buff 1376))), ctx: { txbuff: (buff 4096), index: uint } }) on success, and updates the index in ctx to point after the end of the tx.
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptPubKey that's too long to parse.
;; Returns ERR_TOO_MANY_WITNESSES if there are more than eight witness data or stack items to read.
(define-read-only (read-witnesses
    (ctx {
      txbuff: (buff 4096),
      index: uint,
    })
    (num-txins uint)
  )
  (fold read-next-witness (bool-list-of-len num-txins)
    (ok {
      ctx: ctx,
      witnesses: (list),
    })
  )
)

;;
;; Parses a Bitcoin transaction, with up to 50 inputs and 50 outputs, with scriptSigs of up to 1376 bytes each, and with scriptPubKeys up to 1376 bytes.
;; It will also calculate and return the TXID if calculate-txid is set to true.
;; Returns a tuple structured as follows on success:
;; (ok {
;;      version: uint,                      ;; tx version
;;      segwit-marker: uint,
;;      segwit-version: uint,
;;      txid: (optional (buff 32))
;;      ins: (list 50
;;          {
;;              outpoint: {                 ;; pointer to the utxo this input consumes
;;                  hash: (buff 32),
;;                  index: uint
;;              },
;;              scriptSig: (buff 1376),      ;; spending condition script
;;              sequence: uint
;;          }),
;;      outs: (list 50
;;          {
;;              value: uint,                ;; satoshis sent
;;              scriptPubKey: (buff 1376)    ;; parse this to get an address
;;          }),
;;      witnesses: (list 50 (list 13 (buff 1376))),
;;      locktime: uint
;; })
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptPubKey or scriptSig that's too long to parse.
;; Returns ERR_TOO_MANY_TXOUTS if there are more than eight inputs to read.
;; Returns ERR_TOO_MANY_TXINS if there are more than eight outputs to read.
;; Returns ERR_NOT_SEGWIT_TRANSACTION if tx is not a segwit transaction.
;; Returns ERR_LEFTOVER_DATA if the tx buffer contains leftover data at the end.
(define-read-only (parse-wtx
    (tx (buff 4096))
    (calculate-txid bool)
  )
  (let (
      (ctx {
        txbuff: tx,
        index: u0,
      })
      (parsed-version (try! (read-uint32 ctx)))
      (parsed-segwit-marker (try! (read-uint8 (get ctx parsed-version))))
      (parsed-segwit-version (try! (read-uint8 (get ctx parsed-segwit-marker))))
      (parsed-txins (try! (read-txins (get ctx parsed-segwit-version))))
      (parsed-txouts (try! (read-txouts (get ctx parsed-txins))))
      (parsed-witnesses (try! (read-witnesses (get ctx parsed-txouts) (len (get txins parsed-txins)))))
      (parsed-locktime (try! (read-uint32 (get ctx parsed-witnesses))))
    )
    (asserts!
      (and (is-eq (get uint8 parsed-segwit-marker) u0) (is-eq (get uint8 parsed-segwit-version) u1))
      ERR_NOT_SEGWIT_TRANSACTION
    )
    (asserts! (is-eq (len tx) (get index (get ctx parsed-locktime)))
      ERR_LEFTOVER_DATA
    )
    (ok {
      version: (get uint32 parsed-version),
      segwit-marker: (get uint8 parsed-segwit-marker),
      segwit-version: (get uint8 parsed-segwit-version),
      ins: (get txins parsed-txins),
      outs: (get txouts parsed-txouts),
      txid: (if calculate-txid
        (some (reverse-buff32 (sha256 (sha256 (concat
          (unwrap-panic (slice? tx u0 u4))
          (unwrap-panic (slice? tx (get index (get ctx parsed-segwit-version))
            (get index (get ctx parsed-txouts))
          ))
          (unwrap-panic (slice? tx (get index (get ctx parsed-witnesses)) (len tx)))
        )))))
        none
      ),
      witnesses: (get witnesses parsed-witnesses),
      locktime: (get uint32 parsed-locktime),
    })
  )
)

;;
;; Parses a Bitcoin transaction, with up to 50 inputs and 50 outputs, with scriptSigs of up to 1376 bytes each, and with scriptPubKeys up to 1376 bytes.
;; Returns a tuple structured as follows on success:
;; (ok {
;;      version: uint,                      ;; tx version
;;      ins: (list 50
;;          {
;;              outpoint: {                 ;; pointer to the utxo this input consumes
;;                  hash: (buff 32),
;;                  index: uint
;;              },
;;              scriptSig: (buff 1376),      ;; spending condition script
;;              sequence: uint
;;          }),
;;      outs: (list 50
;;          {
;;              value: uint,                ;; satoshis sent
;;              scriptPubKey: (buff 1376)    ;; parse this to get an address
;;          }),
;;      locktime: uint
;; })
;; Returns ERR_OUT_OF_BOUNDS if we read past the end of txbuff.
;; Returns ERR_VARSLICE_TOO_LONG if we find a scriptPubKey or scriptSig that's too long to parse.
;; Returns ERR_TOO_MANY_TXOUTS if there are more than eight inputs to read.
;; Returns ERR_TOO_MANY_TXINS if there are more than eight outputs to read.
;; Returns ERR_LEFTOVER_DATA if the tx buffer contains leftover data at the end.
(define-read-only (parse-tx (tx (buff 4096)))
  (let (
      (ctx {
        txbuff: tx,
        index: u0,
      })
      (parsed-version (try! (read-uint32 ctx)))
      (parsed-txins (try! (read-txins (get ctx parsed-version))))
      (parsed-txouts (try! (read-txouts (get ctx parsed-txins))))
      (parsed-locktime (try! (read-uint32 (get ctx parsed-txouts))))
    )
    ;; check if it is a non-segwit transaction?
    ;; at least check what happens
    (asserts! (is-eq (len tx) (get index (get ctx parsed-locktime)))
      ERR_LEFTOVER_DATA
    )
    (ok {
      version: (get uint32 parsed-version),
      ins: (get txins parsed-txins),
      outs: (get txouts parsed-txouts),
      locktime: (get uint32 parsed-locktime),
    })
  )
)

;; Parse a Bitcoin block header.
;; Returns a tuple structured as folowed on success:
;; (ok {
;;      version: uint,                  ;; block version,
;;      parent: (buff 32),              ;; parent block hash,
;;      merkle-root: (buff 32),         ;; merkle root for all this block's transactions
;;      timestamp: uint,                ;; UNIX epoch timestamp of this block, in seconds
;;      nbits: uint,                    ;; compact block difficulty representation
;;      nonce: uint                     ;; PoW solution
;; })
(define-read-only (parse-block-header (headerbuff (buff 80)))
  (let (
      (ctx {
        txbuff: headerbuff,
        index: u0,
      })
      (parsed-version (try! (read-uint32 ctx)))
      (parsed-parent-hash (try! (read-hashslice (get ctx parsed-version))))
      (parsed-merkle-root (try! (read-hashslice (get ctx parsed-parent-hash))))
      (parsed-timestamp (try! (read-uint32 (get ctx parsed-merkle-root))))
      (parsed-nbits (try! (read-uint32 (get ctx parsed-timestamp))))
      (parsed-nonce (try! (read-uint32 (get ctx parsed-nbits))))
    )
    (ok {
      version: (get uint32 parsed-version),
      parent: (get hashslice parsed-parent-hash),
      merkle-root: (get hashslice parsed-merkle-root),
      timestamp: (get uint32 parsed-timestamp),
      nbits: (get uint32 parsed-nbits),
      nonce: (get uint32 parsed-nonce),
    })
  )
)

;; MOCK section
(define-constant DEBUG_MODE true)

(define-map mock-burnchain-header-hashes
  uint
  (buff 32)
)

(define-public (mock-add-burnchain-block-header-hash
    (burn-height uint)
    (hash (buff 32))
  )
  (ok (map-set mock-burnchain-header-hashes burn-height hash))
)

(define-read-only (get-bc-h-hash (bh uint))
  (if DEBUG_MODE
    (match (map-get? mock-burnchain-header-hashes bh)
      mock-data
      (some mock-data)
      ;; fall back to remote data if no mock data available
      (get-burn-block-info? header-hash bh)
    )
    (get-burn-block-info? header-hash bh)
  )
)

;; END MOCK section

;; Verify that a block header hashes to a burnchain header hash at a given height.
;; Returns true if so; false if not.
(define-read-only (verify-block-header
    (headerbuff (buff 80))
    (expected-block-height uint)
  )
  (match (get-bc-h-hash expected-block-height)
    bhh (is-eq bhh (reverse-buff32 (sha256 (sha256 headerbuff))))
    false
  )
)

;; Get the txid of a transaction, but little-endian.
;; This is the reverse of what you see on block explorers.
(define-read-only (get-reversed-txid (tx (buff 4096)))
  (sha256 (sha256 tx))
)

;; Get the txid of a transaction.
;; This is what you see on block explorers.
(define-read-only (get-txid (tx (buff 4096)))
  (reverse-buff32 (sha256 (sha256 tx)))
)

;; Determine if the ith bit in a uint is set to 1
(define-read-only (is-bit-set
    (val uint)
    (bit uint)
  )
  (> (bit-and val (bit-shift-left u1 bit)) u0)
)

;; Helper for wtxid commitments

;; Returns true if the scriptPubKey is a BIP-141 witness-commitment output, i.e. it
;; starts with the 6-byte commitment header 0x6a24aa21a9ed (OP_RETURN, 36-byte push,
;; and the 0xaa21a9ed magic). The 32 bytes following the header hold the commitment.
(define-read-only (is-commitment-pattern (scriptPubKey (buff 1024)))
  (is-eq (slice? scriptPubKey u0 u6) (some 0x6a24aa21a9ed))
)

;;
;; Top-level verification functions
;;

;; Determine whether or not a Bitcoin transaction without witnesses
;; was mined in a prior Bitcoin block.
;; It takes the block height, the transaction, the block header and a merkle proof, and determines that:
;; * the block header corresponds to the block that was mined at the given Bitcoin height
;; * the transaction's merkle proof links it to the block header's merkle root.

;; To verify that the merkle root is part of the block header there are two options:
;; a) read the merkle root from the header buffer
;; b) build the header buffer from its parts including the merkle root
;;
;; The merkle proof is a list of sibling merkle tree nodes that allow us to calculate the parent node from two children nodes in each merkle tree level,
;; the depth of the block's merkle tree, and the index in the block in which the given transaction can be found (starting from 0).
;; The first element in hashes must be the given transaction's sibling transaction's ID.  This and the given transaction's txid are hashed to
;; calculate the parent hash in the merkle tree, which is then hashed with the *next* hash in the proof, and so on and so forth, until the final
;; hash can be compared against the block header's merkle root field.  The tx-index tells us in which order to hash each pair of siblings.
;; Note that the proof hashes -- including the sibling txid -- must be _little-endian_ hashes, because this is how Bitcoin generates them.
;; This is the reverse of what you'd see in a block explorer!
;;
;; Returns (ok true) if the proof checks out.
;; Returns (ok false) if not.
;; Returns the native verify-merkle-proof error if the proof is malformed for the merkle tree.
(define-read-only (was-tx-mined-compact
    (height uint)
    (tx (buff 4096))
    (header (buff 80))
    (proof {
      tx-index: uint,
      hashes: (list 14 (buff 32)),
      tx-count: uint,
    })
  )
  (let ((block (unwrap! (parse-block-header header) ERR_BAD_HEADER)))
    (was-tx-mined-internal height tx header (get merkle-root block) proof)
  )
)

;; Private function to verify block header and merkle proof.
;; This function must only be called with the merkle root of the provided header.
;; Use was-tx-mined-compact with header as a buffer or
;; was-tx-mined with header as a tuple.
;; Returns txid if tx was mined else err u1 if the header is invalid or err u2 if the proof is invalid.
(define-private (was-tx-mined-internal
    (height uint)
    (tx (buff 4096))
    (header (buff 80))
    (merkle-root (buff 32))
    (proof {
      tx-index: uint,
      hashes: (list 14 (buff 32)),
      tx-count: uint,
    })
  )
  (if (verify-block-header header height)
    (let (
        (reversed-txid (get-reversed-txid tx))
        (txid (reverse-buff32 reversed-txid))
      )
      ;; verify merkle proof
      (asserts!
        (or
          (is-eq merkle-root txid) ;; true, if the transaction is the only transaction
          ;; native verify-merkle-proof returns a bool, not a response, and needs the
          ;; block's real transaction count for Bitcoin's odd-row duplication rule
          (verify-merkle-proof reversed-txid (reverse-buff32 merkle-root)
            (get tx-index proof) (get tx-count proof) (get hashes proof)
          )
        )
        ERR_INVALID_MERKLE_PROOF
      )
      (ok txid)
    )
    ERR_HEADER_HEIGHT_MISMATCH
  )
)

;; Determine whether or not a Bitcoin transaction
;; with witnesses was mined in a prior Bitcoin block.
;; It takes
;; a) the bitcoin block height, the transaction "tx" with witness data,
;;    the bitcoin block header, the tx index in the block and
;; b) the number of transactions in the block "tx-count" and
;; c) the merkle proof of the wtxid "wproof", its root "witness-merkle-proof",
;;    the witness reserved value and
;; d) the coinbase transaction "ctx" without witnesses (non-segwit), its merkle proof "cproof"
;;    and the index of its output that carries the BIP-141 witness commitment "cb-commitment-vout".
;;
;; It determines that:
;; * the block header corresponds to the block that was mined at the given Bitcoin height
;; * the coinbase tx was mined and it contains the commitment to the wtxids
;; * the wtxid of the tx is part of the commitment.
;;
;; tx-count is the block's transaction count; the wtxid (witness) merkle tree and the
;; txid merkle tree have the same number of leaves, so a single tx-count covers both.
;; The coinbase tx index is always 0.
;;
;; It returns (ok wtxid), if it was mined.
(define-read-only (was-segwit-tx-mined-compact
    (height uint)
    (wtx (buff 4096))
    (header (buff 80))
    (tx-index uint)
    (tx-count uint)
    (wproof (list 14 (buff 32)))
    (witness-merkle-root (buff 32))
    (witness-reserved-value (buff 32))
    (cb-tx (buff 4096))
    (cb-commitment-vout uint)
    (cb-proof (list 14 (buff 32)))
  )
  (begin
    ;; verify that the coinbase tx is correct
    (try! (was-tx-mined-compact height cb-tx header {
      tx-index: u0,
      hashes: cb-proof,
      tx-count: tx-count,
    }))
    (let (
        ;; Clarity 6 native parse: read the BIP-141 witness-commitment output directly
        ;; by index, instead of parsing every coinbase output and folding to find it.
        (witness-out (get script (try! (get-bitcoin-tx-output? cb-tx cb-commitment-vout))))
        (final-hash (sha256 (sha256 (concat witness-merkle-root witness-reserved-value))))
        (reversed-wtxid (get-reversed-txid wtx))
        (wtxid (reverse-buff32 reversed-wtxid))
      )
      ;; verify the caller-named output is actually a BIP-141 witness-commitment output
      (asserts! (is-commitment-pattern witness-out) ERR_INVALID_COMMITMENT)
      ;; verify wtxid commitment: the 32 bytes after the 6-byte header equal the computed
      ;; root hash. BIP-141 permits extra data after the commitment, so only the
      ;; first 38 bytes (header + hash) are checked, not the full scriptPubKey.
      (asserts!
        (is-eq (unwrap! (slice? witness-out u6 u38) ERR_INVALID_COMMITMENT) final-hash)
        ERR_INVALID_COMMITMENT
      )
      ;; verify witness merkle tree (native verify-merkle-proof returns a bool)
      (asserts!
        (verify-merkle-proof reversed-wtxid witness-merkle-root tx-index tx-count
          wproof
        )
        ERR_WITNESS_TX_NOT_IN_COMMITMENT
      )
      (ok wtxid)
    )
  )
)
