---
description: >-
  Usability for Nothing. Smart Wallet is a smart contract that holds assets in
  the name of one or more users
---

# Smart Wallet

### Problem

I want to rotate my keys, but there are too many meme coins in my wallet. I don’t want to make all the txs.

### Solution

Smart Wallet that holds the assets. Key rotation happens by sending 1 tx to the smart wallet.

The wallet can be used by admins or non-admins with permission.

### MVP

1. Create smart wallet (similar to deploying an NFT collection)
2. Use assets in smart wallet (send, stake)
3. Manage wallet
4. Limit transfers per day
5. Add/remove admin
6. Add permissions

#### Smart contracts

* Template for smart wallet
* Helper contracts implementing certain features that instruct the wallet to do something (e.g. transfer asset)
* Predefined endpoint contracts (nothing only, sBTC only, meme coins only)

#### Website

* Page 1: Landing page with login
* Page 2: User has no wallets, call to action: create first wallet
* Page 3: Deploy smart wallet with preset settings
* Page 3: Wallet balance and interactions with assets, possible to switch between smart wallets.
* Page 4: Manage wallet, add/remove admins, permissions

#### Backend

* Sponsorship service for transactions
* manages nonces
* converts nothing to stx to pay gas fees

### Use cases/Extensions

* Limited amount
* Stacking
* Replace keys, account recovery by friends/2nd account

### Open Questions

* How to prove in Discord that I own X tokens?
* How to prove on the web that I am the smart wallet?

### Resources

* [https://thirdweb.com/account-abstraction](https://thirdweb.com/account-abstraction)
* [https://github.com/lisalab-io/liquid-stacking/blob/main/contracts/extensions/treasury.clar](https://github.com/lisalab-io/liquid-stacking/blob/main/contracts/extensions/treasury.clar)

### Code snippets

```
(define-public (proxy-call (proxy <proxy-trait>) (payload (buff 2048)) (signature (buff 64)))
	(begin
		(try! (is-allowed proxy payload signature))
		(as-contract (contract-call? proxy proxy-call payload))
	)
)
```

```
(define-public (proxy-marketplace-call (proxy <proxy-trait>) (marketplace <marketplace-trait>) (payload (buff 2048)))
	(begin
		(try! (is-allowed proxy payload signature))
		(as-contract (contract-call? proxy proxy-marketplace-call marketplace payload))
	)
)
```
