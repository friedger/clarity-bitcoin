import { ParsedTransactionResult, tx } from "@hirosystems/clarinet-sdk";
import { Cl, ClarityType, cvToString } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
simnet.getContractsInterfaces().forEach((contract, name) => {
  if (!name.endsWith("_test")) {
    return;
  }
  describe(name, () => {
    const prepare =
      contract.functions.findIndex((f) => f.name === "prepare") >= 0;
    let block: ParsedTransactionResult[];

    contract.functions.forEach((fn) => {
      if (!fn.name.startsWith("test-")) {
        return;
      }

      it(fn.name, () => {
        if (prepare) {
          block = simnet.mineBlock([
            tx.callPublicFn(name, "prepare", [], accounts.get("deployer")!),
            tx.callPublicFn(name, fn.name, [], accounts.get("deployer")!),
          ]);
          expect(block[0].result).toBeOk(Cl.bool(true));

          if (block[1].result.type === ClarityType.ResponseErr) {
            console.log(cvToString(block[1].result));
          }          expect(
            block[1].result,
            `${name}, ${fn.name}, ${cvToString(block[0].result)}`
          ).toBeOk(Cl.bool(true));
        } else {
          block = simnet.mineBlock([
            tx.callPublicFn(name, fn.name, [], accounts.get("deployer")!),
          ]);
          if (block[0].result.type === ClarityType.ResponseErr) {
            console.log(cvToString(block[0].result));
          }
          expect(
            block[0].result,
            `${name}, ${fn.name}, ${cvToString(block[0].result)}`
          ).toBeOk(Cl.bool(true));
        }
      });
    });
  });
});
