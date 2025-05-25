(define-constant test-contract-principal (as-contract tx-sender))
(define-constant zero-address 'SP000000000000000000002Q6VF78)

(define-public (add-burnchain-block-header-hash (burn-height uint) (header (buff 80)))
  (contract-call? .clarity-bitcoin mock-add-burnchain-block-header-hash burn-height (contract-call? .clarity-bitcoin reverse-buff32 (sha256 (sha256 header))))
)

(define-public (prepare)
	(begin
    ;; 1
    (unwrap-panic (add-burnchain-block-header-hash u2431087 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7))
    ;; 2
    (unwrap-panic (add-burnchain-block-header-hash u2431459 0x000000207277c3a739ad34a3873a3c9d755f0766e918f4b37adcfe455d079b93000000000bad83579d633d37aa1e2bb725b8a5bad35509374454f1adad8a4de140066d74dbf64e64ffff001d6616bfe2))
    ;; 3
    (unwrap-panic (add-burnchain-block-header-hash u2431567 0x000000208af1a70ab2ed062c7ac53eb56b053498db50f0d9c41f0dc8a5efcb1b000000007b64b9e16eb97b1fb32977aa00e2cb7418856b1e794e232be4f3b4b0512cb31256845064ffff001dc3cdbab0))
    ;; 4
    (unwrap-panic (add-burnchain-block-header-hash u2431619 0x00c0c8306c887f5b2248021d1a6662aa684ca46975a21685800192b3f4e5c8b400000000a140532ff49146607e72df19983ff1e4a56f989cf0671aeb4ee321a74d3670c75c545164695a20192b1ab0c7))
    ;; 5
    (unwrap-panic (add-burnchain-block-header-hash u2430921 0x00004020070e3e8245969a60d47d780670d9e05dbbd860927341dda51d000000000000007ecc2f605412dddfe6e5c7798ec114004e6eda96f7045baf653c26ded334cfe27766466488a127199541c0a6))
    ;; 6
    (unwrap-panic (add-burnchain-block-header-hash u2431087 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7))
		(ok true)
	)
)

;; @name verify transaction where OP_RETURN is in output[1]
;; arbitrary segwit transaction
(define-public (test-was-tx-mined-internal-1)
  (let (
    (burnchain-block-height u2431087)
    (txid 0x3b3a7a31c949048fabf759e670a55ffd5b9472a12e748b684db5d264b6852084)
    (raw-tx 0x020000000218f905443202116524547142bd55b69335dfc4e4c66ff3afaaaab6267b557c4b030000000000000000e0dbdf1039321ab7a2626ca5458e766c6107690b1a1923e075c4f691cc4928ac0000000000000000000220a10700000000002200208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd14688188363c5f26010000000022512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d56d182500)
    ;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
    (raw-block-header 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
  )
    (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
      burnchain-block-height
      raw-tx
      raw-block-header
      {tx-index: u3,
      tree-depth: u2,
      hashes: (list 0x3313f803502a6f9a89ac09ff9e8f9d8032aa7c35cc6d1679487622e944c8ccb8 0xc4e620f495d8a30d8d919fc148fe55c8873b4aefe43116bc6ef895aa51572215)}
    )))
    (asserts! (is-eq result (ok txid)) (err "expected txid"))
    (ok true))
  )
)


;; @name verify segwit transaction where OP_RETURN is in output[0]
;; arbitrary segwit transaction
(define-public (test-was-tx-mined-internal-2)
  (let (
    (burnchain-block-height u2431459)
    (txid 0x0edafd2b2e9374ede142d1b60f884b47aa7a4ae0a5d46aa9c1d63d2e8e27087d)
    (raw-tx 0x0200000001cbab643067979ec7a7c74bf49af775b20203df78e31b83b2d25510fe5897872c0000000000feffffff02b0631d0000000000160014f55fa4fafee59cccde7d6204029d388480d354b6ce32599300000000160014cc9957eaabf54d9fa7d1c0ae64bd0f95e0bd0cdfe2192500)
    ;; block id: 000000004daafb5977a88c7111da740e77cf6dd5a417f343ed01374676266c36
    (raw-block-header 0x000000207277c3a739ad34a3873a3c9d755f0766e918f4b37adcfe455d079b93000000000bad83579d633d37aa1e2bb725b8a5bad35509374454f1adad8a4de140066d74dbf64e64ffff001d6616bfe2)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
  )
    ;; prepare
    (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
      burnchain-block-height
      raw-tx
      raw-block-header
      {tx-index: u8,
      tree-depth: u7,
      hashes: (list 0xbcbc1fe72ca5d67f74099ac4f851cd6a266d2a42fa6c9a6244b11adf6a2f13fb 0x4348ff70e7b2132e0b6044f960ec25a5f7966f5d6182827c9359039a7654218e 0x6fed856ef1075c15a1318eeb512349ceb6a5115953990369c9cb03d65a550468 0xfcaccdf24d540b6ec02568efaefc5df5b04e249ecaaf95a9170c9b72e7b8f46d 0x7d45568289180def6b91cdf6f89c692f3798872948b582a9f6fd5cc471cb67e0 0xe5fefbaf926e706c4ef331d172dcb589dfd6b997bee4ba6ddee4c7c6e2918549 0x097ae87e24dae74bb00a2bfe0aa3c14537ce04b048285ce69d98301bd9ddee8d)}
    )))
    (asserts! (is-eq result (ok txid)) (err "expected txid"))
    (ok true))
  )
)



;; @name verify segwit transaction where OP_RETURN is in output[0]
;; arbitrary segwit transaction
(define-public (test-was-tx-mined-internal-3)
  (let (
    (burnchain-block-height u2431567)
    (txid 0x2fd0308a0bca2f4ea40fe93a19be976a40b2d5e0df08df1dd991b4df31a563fc)
    (raw-tx 0x02000000017d406bb6466e0da97778f55ece77ab6becc415c930dbe618e81e8dae53ba914400000000171600143e8d4581104393d916566886ae01e26be8f8975afeffffff0276410300000000001600143d5f37543d2916547fe9b1242322b22f6e46d6929c9291d8000000001600145b3298860caeb3302f09e58b7cc3cf58d0a674044e1a2500)
    ;; block id: 00000000096ae97d41a543592c3680477444acdc86c877aeb4832744691cb94b
    (raw-block-header 0x000000208af1a70ab2ed062c7ac53eb56b053498db50f0d9c41f0dc8a5efcb1b000000007b64b9e16eb97b1fb32977aa00e2cb7418856b1e794e232be4f3b4b0512cb31256845064ffff001dc3cdbab0)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-wtx raw-tx false))
  )

   (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
      burnchain-block-height
      raw-tx
      raw-block-header
      {tx-index: u1,
      tree-depth: u7,
      hashes: (list 0x6ef3bf4c1eab5389170584545683660fa601f38f1216bb6357a9b01560a8f884 0x33274cc92f8b980272688e01114cc2944fb661d1aa3a658c7d29675a46a4d5ad 0x1172bf0943aad7bc580aaab5f5d356b1c172f11c297ccf0077515309906352f2 0x2af4fd00ac79b65c0c508fbf44c22d1cf5acb084770079a94bd72ac816cfceb8 0xed4ca325a1800f0dfb2ab9d63761ecb358c014424e684c820d0d87ace45474a1 0xd3292e0e550420e500f29663dfc8ef632dbcb119c8a1ddf49aa3d32ecad83084 0x6369b65eea600edbd69b56386be9269f9662ca3f384a0ca21922ac03d2936102)}
    )))
    (asserts! (is-eq result (ok txid)) (err "expected txid"))
    (ok true))
  )
)

;; @name verify transaction where there is only the coinbase transaction.
(define-public (test-was-tx-mined-internal-4)
  (let (
    (burnchain-block-height u2431619)
    (txid 0xc770364da721e34eeb1a67f09c986fa5e4f13f9819df727e604691f42f5340a1)
    (raw-tx 0x02000000010000000000000000000000000000000000000000000000000000000000000000ffffffff2503831a250000000000000000000000000000000002000000000000073c7500000000000000ffffffff02be402500000000001976a91455a2e914aeb9729b4cd265248cb67a865eae95fd88ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf900000000)
    ;; block id:
    (raw-block-header 0x00c0c8306c887f5b2248021d1a6662aa684ca46975a21685800192b3f4e5c8b400000000a140532ff49146607e72df19983ff1e4a56f989cf0671aeb4ee321a74d3670c75c545164695a20192b1ab0c7)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
  )

  (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
          burnchain-block-height
          raw-tx
          raw-block-header
          {tx-index: u0,
          tree-depth: u1,
          hashes: (list)}
        )))
    (asserts! (is-eq result (ok txid)) (err "expected txid"))
    (ok true))
  )
)


;; @name OP_RETURN is too large. Fails to parse transaction
(define-public (test-was-tx-mined-internal-5)
  (let (
    (burnchain-block-height u2430921)
    (txid 0xe2798f96e3584be98f0b6eb6833dbf8284f95c4bb183f425bf409eb3ecc4bf6b)
    (raw-tx 0x01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff1b03c917250477664664004000009be40b0000084d617261636f726500000000030000000000000000266a24aa21a9edb675067096401108d0bd081d693fb4adae204ea41a2c444ad79826a2d9f0bb250000000000000000fd80017b226964223a6e756c6c2c22726573756c74223a7b2268617368223a2239346562366639633664633130396239646630396333306237616561613065383538656165626536343831346138363036383962383065633931313634383864222c22636861696e6964223a312c2270726576696f7573626c6f636b68617368223a2232663566306161663139633139623138313433333839663864643330353234323539323937393137613562396330613864353432366362323233373731336364222c22636f696e6261736576616c7565223a3632353030303030302c2262697473223a223230376666666666222c22686569676874223a3437382c225f746172676574223a2230303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030666666663766222c226d65726b6c655f73697a65223a312c226d65726b6c655f6e6f6e6365223a323539363939363136327d2c226572726f72223a6e756c6c7db87a2500000000001976a914bb94b2b8ce1719201bf0346d79ee0f60c9d2700088ac00000000)
    ;; block id: 000000000000000011958fb8368d946487bde267f7cb78256ede44ec14e38d87
    (raw-block-header 0x00004020070e3e8245969a60d47d780670d9e05dbbd860927341dda51d000000000000007ecc2f605412dddfe6e5c7798ec114004e6eda96f7045baf653c26ded334cfe27766466488a127199541c0a6)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
  )

  (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
      burnchain-block-height
      raw-tx
      raw-block-header
      {tx-index: u0,
      tree-depth: u2,
      hashes: (list 0x3d52480061d7634fa8060430cf86d8de3f577499a2056f5ff80cc36918a78dcc 0x41dd33b4cffe074cc8263f98da7c81006521eb2cc8712028fa491efed619cffb)}
      )))
    (asserts! (is-eq result (ok txid)) (err "expected txid"))
    (ok true))
  )
)



;; @name verify segwit transaction where OP_RETURN is in output[1]
;; arbitrary segwit transaction
(define-public (test-was-tx-mined-internal-6)
  (let (
    (burnchain-block-height u2431087)
    (txid 0x3b3a7a31c949048fabf759e670a55ffd5b9472a12e748b684db5d264b6852084)
    (raw-tx 0x020000000218f905443202116524547142bd55b69335dfc4e4c66ff3afaaaab6267b557c4b030000000000000000e0dbdf1039321ab7a2626ca5458e766c6107690b1a1923e075c4f691cc4928ac0000000000000000000220a10700000000002200208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd14688188363c5f26010000000022512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d56d182500)
    ;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
    (raw-block-header 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
  )
    ;; prepare

    (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
      burnchain-block-height
      raw-tx
      raw-block-header
      {tx-index: u3,
      tree-depth: u2,
      hashes: (list 0x3313f803502a6f9a89ac09ff9e8f9d8032aa7c35cc6d1679487622e944c8ccb8 0xc4e620f495d8a30d8d919fc148fe55c8873b4aefe43116bc6ef895aa51572215)}
    )))
    (asserts! (is-eq result (ok txid)) (err "expected txid"))
    (ok true))
  )
)

;; @name verify segwit transaction where merkle proof is wrong
;; arbitrary segwit transaction
(define-public (test-was-tx-mined-internal-7)
  (let (
    (burnchain-block-height u2431087)
    (txid 0x3b3a7a31c949048fabf759e670a55ffd5b9472a12e748b684db5d264b6852084)
    (raw-tx 0x020000000218f905443202116524547142bd55b69335dfc4e4c66ff3afaaaab6267b557c4b030000000000000000e0dbdf1039321ab7a2626ca5458e766c6107690b1a1923e075c4f691cc4928ac0000000000000000000220a10700000000002200208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd14688188363c5f26010000000022512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d56d182500)
    ;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
    (raw-block-header 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7)
    (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
    (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
  )
    ;; prepare

    (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
      burnchain-block-height
      raw-tx
      raw-block-header
      {tx-index: u3,
      tree-depth: u2,
      hashes: (list 0x3313f803502a6f9a89ac09ff9e8f9d8032aa7c35cc6d1679487622e944c8ccb8 0x3313f803502a6f9a89ac09ff9e8f9d8032aa7c35cc6d1679487622e944c8ccb8)}
    )))
    (asserts! (is-eq result (err ERR-INVALID-MERKLE-PROOF)) (err "expected ERR-INVALID-MERKLE-PROOF"))
    (ok true))
  )
)

;; ;; @name verify transaction with wrong block height
;; ;; arbitrary segwit transaction
;; (define-public (test-was-tx-mined-internal-8)
;;   (let (
;;     (burnchain-block-height u1)
;;     (txid 0x3b3a7a31c949048fabf759e670a55ffd5b9472a12e748b684db5d264b6852084)
;;     (raw-tx 0x020000000218f905443202116524547142bd55b69335dfc4e4c66ff3afaaaab6267b557c4b030000000000000000e0dbdf1039321ab7a2626ca5458e766c6107690b1a1923e075c4f691cc4928ac0000000000000000000220a10700000000002200208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd14688188363c5f26010000000022512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d56d182500)
;;     ;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
;;     (raw-block-header 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7)
;;     (parsed-block-header (contract-call? .clarity-bitcoin parse-block-header raw-block-header))
;;     (parsed-tx (contract-call? .clarity-bitcoin parse-tx raw-tx))
;;   )
;;     (let ((result (contract-call? .clarity-bitcoin was-tx-mined-compact
;;       burnchain-block-height
;;       raw-tx
;;       raw-block-header
;;       {tx-index: u3,
;;       tree-depth: u2,
;;       hashes: (list 0x3313f803502a6f9a89ac09ff9e8f9d8032aa7c35cc6d1679487622e944c8ccb8 0xc4e620f495d8a30d8d919fc148fe55c8873b4aefe43116bc6ef895aa51572215)}
;;     )))
;;     (asserts! (is-eq result (err ERR-HEADER-HEIGHT-MISMATCH)) (err "expected ERR-HEADER-HEIGHT-MISMATCH"))
;;     (ok true))
;;   )
;; )

;; @name verify segwit transaction with left over data
(define-public (test-parse-tx)
  (let (
    (burnchain-block-height u2431087)
    ;; 0x3b3a7a31c949048fabf759e670a55ffd5b9472a12e748b684db5d264b6852084 + 0xffffff
    (raw-tx 0x020000000218f905443202116524547142bd55b69335dfc4e4c66ff3afaaaab6267b557c4b030000000000000000e0dbdf1039321ab7a2626ca5458e766c6107690b1a1923e075c4f691cc4928ac0000000000000000000220a10700000000002200208730dbfaa29c49f00312812aa12a62335113909711deb8da5ecedd14688188363c5f26010000000022512036f4ff452cb82e505436e73d0a8b630041b71e037e5997290ba1fe0ae7f4d8d56d182500ffffff)
    ;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
  )
    (let ((result (contract-call? .clarity-bitcoin parse-tx raw-tx)))
    (asserts! (is-eq result (err ERR-LEFTOVER-DATA)) (err "expected ERR-LEFTOVER-DATA"))
    (ok true))
  )
)

;; ;; @name verify block header with invalid block
;; (define-public (test-verify-block-header)
;;  (let (
;;     (burnchain-block-height u0)
;;     ;; block id: 000000000000000606f86a5bc8fb6e38b16050fb4676dea26cba5222583c4d86
;;     (raw-block-header 0x0000a02065bc9201b5b5a1d695a18e4d5efe5d52d8ccc4129a2499141d000000000000009160ba7ae5f29f9632dc0cd89f466ee64e2dddfde737a40808ddc147cd82406f18b8486488a127199842cec7)
;;   )
;;     (let ((result (contract-call? .clarity-bitcoin verify-block-header raw-block-header burnchain-block-height)))
;;     (asserts! (is-eq result false) (err "expected invalid block header"))
;;     (ok true))
;;   )
;; )

(define-constant ERR-OUT-OF-BOUNDS u1)
(define-constant ERR-TOO-MANY-TXINS u2)
(define-constant ERR-TOO-MANY-TXOUTS u3)
(define-constant ERR-VARSLICE-TOO-LONG u4)
(define-constant ERR-BAD-HEADER u5)
(define-constant ERR-HEADER-HEIGHT-MISMATCH u6)
(define-constant ERR-INVALID-MERKLE-PROOF u7)
(define-constant ERR-PROOF-TOO-SHORT u8)
(define-constant ERR-TOO-MANY-WITNESSES u9)
(define-constant ERR-INVALID-COMMITMENT u10)
(define-constant ERR-WITNESS-TX-NOT-IN-COMMITMENT u11)
(define-constant ERR-LEFTOVER-DATA u13)
