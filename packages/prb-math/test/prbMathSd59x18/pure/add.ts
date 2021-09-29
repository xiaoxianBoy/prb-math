import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

import { E, MAX_SD59x18, MIN_SD59x18, PI } from "../../../helpers/constants";
import { PanicCodes } from "../../shared/errors";

export default function shouldBehaveLikeAdd(): void {
  context("when the sum overflows", function () {
    const testSets = [
      [toBn("1e-18"), toBn(MAX_SD59x18)],
      [toBn(MAX_SD59x18).div(2), toBn(MAX_SD59x18).div(2).add(2)],
      [toBn(MAX_SD59x18).div(2).add(2), toBn(MAX_SD59x18).div(2)],
      [toBn(MAX_SD59x18), toBn("1e-18")],
    ];

    forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
      await expect(this.contracts.prbMathSd59x18Typed.doAdd(x, y)).to.be.revertedWith(
        PanicCodes.ArithmeticOverflowOrUnderflow,
      );
    });
  });

  context("when the sum does not overflow", function () {
    context("when the sum underflows", function () {
      const testSets = [
        [toBn("-1e-18"), toBn(MIN_SD59x18)],
        [toBn(MIN_SD59x18).div(2), toBn(MIN_SD59x18).div(2).sub(1)],
        [toBn(MIN_SD59x18), toBn("-1e-18")],
      ];

      forEach(testSets).it("takes %e and %e and reverts", async function (x: BigNumber, y: BigNumber) {
        await expect(this.contracts.prbMathSd59x18Typed.doAdd(x, y)).to.be.revertedWith(
          PanicCodes.ArithmeticOverflowOrUnderflow,
        );
      });
    });

    context("when the sum does not underflow", function () {
      context("when the operands don't have the same sign", function () {
        const testSets = [
          [toBn(MIN_SD59x18).add(1), toBn("1e-18")],
          [toBn("-4892e32"), toBn("2042e25")],
          [toBn("-1.04e15"), toBn("5.3542e14")],
          [toBn("-50255.423"), toBn("28177.04405")],
          [toBn("-8959"), toBn("5809")],
          [toBn("-803.899"), toBn("1.02")],
          [toBn("-42"), toBn("38.12")],
          [toBn(`-${PI}`), toBn("2.0004")],
          [toBn(`-${E}`), toBn("1.89")],
          [toBn("-1"), toBn("1")],
        ].concat([
          [toBn("1"), toBn("-1")],
          [toBn(E), toBn("-1.89")],
          [toBn(PI), toBn("-2.0004")],
          [toBn("42"), toBn("-38.12")],
          [toBn("803.899"), toBn("-1.02")],
          [toBn("8959"), toBn("-5809")],
          [toBn("50255.423"), toBn("-28177.04405")],
          [toBn("1.04e15"), toBn("-5.3542e14")],
          [toBn("4892e32"), toBn("-2042e25")],
          [toBn(MAX_SD59x18).sub(1), toBn("-1e-18")],
        ]);

        forEach(testSets).it(
          "takes %e and %e and returns the correct value",
          async function (x: BigNumber, y: BigNumber) {
            const result: BigNumber = await this.contracts.prbMathSd59x18Typed.doAdd(x, y);
            const expected: BigNumber = x.add(y);
            expect(expected).to.equal(result);
          },
        );
      });

      context("when the operands have the same sign", function () {
        const testSets = [
          [toBn("-1"), toBn("-1")],
          [toBn(`-${E}`), toBn("-1.89")],
          [toBn(`-${PI}`), toBn("-2.0004")],
          [toBn("-42"), toBn("-38.12")],
          [toBn("-803.899"), toBn("-1.02")],
          [toBn("-8959"), toBn("-5809")],
          [toBn("-50255.423"), toBn("-28177.04405")],
          [toBn("-1.04e15"), toBn("-5.3542e14")],
          [toBn("-4892e32"), toBn("-2042e25")],
          [toBn(MIN_SD59x18).add(1), toBn("-1e-18")],
        ].concat([
          [Zero, Zero],
          [toBn("1"), toBn("1")],
          [toBn(E), toBn("1.89")],
          [toBn(PI), toBn("2.0004")],
          [toBn("42"), toBn("38.12")],
          [toBn("803.899"), toBn("1.02")],
          [toBn("8959"), toBn("5809")],
          [toBn("50255.423"), toBn("28177.04405")],
          [toBn("1.04e15"), toBn("5.3542e14")],
          [toBn("4892e32"), toBn("2042e25")],
          [toBn(MAX_SD59x18).sub(1), toBn("1e-18")],
        ]);

        forEach(testSets).it(
          "takes %e and %e and returns the correct value",
          async function (x: BigNumber, y: BigNumber) {
            const result: BigNumber = await this.contracts.prbMathSd59x18Typed.doAdd(x, y);
            const expected: BigNumber = x.add(y);
            expect(expected).to.equal(result);
          },
        );
      });
    });
  });
}