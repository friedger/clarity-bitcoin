import { ParsedTransactionResult, tx } from "@hirosystems/clarinet-sdk";
import { Cl, cvToString } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();

describe("Clarity tests", () => {
  it("Run all test functions", () => {
    simnet.getContractsInterfaces().forEach((contract, name) => {
      if (!name.endsWith("_test")) {
        return;
      }

      simnet.getContractAST(name).expressions.forEach((expr) => {
        //console.log(JSON.stringify(expr));
      });

      const prepare = contract.functions.findIndex((f) => f.name === "prepare");

      let block: ParsedTransactionResult[];

      contract.functions.forEach((fn) => {
        if (!fn.name.startsWith("test")) {
          return;
        }

        if (prepare) {
          block = simnet.mineBlock([
            tx.callPublicFn(name, "prepare", [], accounts.get("deployer")!),
            tx.callPublicFn(name, fn.name, [], accounts.get("deployer")!),
          ]);
          console.log(name, fn.name, cvToString(block[1].result));
          expect(block[0].result).toBeOk(Cl.bool(true));
          expect(block[1].result).toBeOk(Cl.bool(true));
        } else {
          block = simnet.mineBlock([
            tx.callPublicFn(name, fn.name, [], accounts.get("deployer")!),
          ]);
          console.log(name, fn.name, cvToString(block[0].result));
          expect(block[0].result).toBeOk(Cl.bool(true));
        }
      });
    });
  });
});
