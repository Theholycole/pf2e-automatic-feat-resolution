import test from "node:test";
import assert from "node:assert/strict";
import { assessmentFacts, assessmentResult, falseFact } from "../src/plans/assessment.js";

const giant = { level: 10, weaknesses: [{ type: "cold", value: 10 }], resistances: [], immunities: ["fire"], saves: { fortitude: 23, reflex: 16, will: 18 } };
const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };

test("facts: highest weakness, lowest save, an immunity, highest resistance (when it has them)", () => {
    const facts = assessmentFacts(giant);
    assert.deepEqual(facts.map((fact) => fact.kind), ["weakness", "save", "immunity"]);
    assert.equal(facts[0].text, "Its highest weakness is cold 10.");
    assert.equal(facts[1].text, "Its lowest save is Reflex.");
});

test("degrees: two facts, one, none, a false one", () => {
    assert.equal(assessmentResult(giant, "criticalSuccess", seq(0)).lines.length, 2);
    assert.equal(assessmentResult(giant, "success", seq(0)).lines.length, 1);
    assert.deepEqual(assessmentResult(giant, "failure").lines, []);
    const lie = assessmentResult(giant, "criticalFailure", seq(0.5, 0));
    assert.equal(lie.false, true);
    assert.equal(lie.lines.length, 1);
});

test("a false fact is never true", () => {
    for (let i = 0; i < 50; i += 1) {
        const line = falseFact(giant);
        assert.ok(!/Reflex|cold|immune to fire/.test(line), line);
    }
});
