# Sent to first input

This example sends an amount of STX to the sender of a bitcoin transaction using p2pkh addresses. It exists in two version, one using the header object (`send-to-first-input.clar`), the other the header buffer (`send-to-first-input-compact`).

1. Deploy all contracts

```
clarinet integrate
```

2. Call btc deployment plan to send 0.1 BTC

```
clarinet deployments apply -p deployments/send-btc.devnet-plan.yaml --no-dashboard
```

3. Confirm to continue
4. Copy the tx hex from the Transaction
5. Press N to mine the block in the clarinet dashboard
6. Generate deployment plan for the stacks transaction by running the following command with the copied tx hex (replace `01..txhex`). (The generation script takes care of reversing the properties of the block header.)

```
deno run --allow-net ./src/generatePlan.ts 01..txhex > deployments/send-to-first-input-plan.yaml
```

7. Call deployment plan to send STX to the bitcoin sender. The conversion from btc to stx in this example happens as a fixed rate of 1000 sats/stx. (It is possible to use [stx-oracle](https://explorer.hiro.so/txid/SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.stx-oracle?chain=mainnet) that calcualtes a conversion rate based on the miner commits of the 10 last blocks.)

```
clarinet deployments apply -p deployments/sent-to-first-input-plan.yaml
```

8. Check the stacks explorer at http://localhost:8001 about the result for the transactions of the two versions
