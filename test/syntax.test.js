// The Foundry scripts aren't imported by the tests (they need Foundry's globals), so each is at least parsed: a syntax error there stops
// the whole module loading (round 83 recheck, a constant declared twice in scripts/main.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";

test("every Foundry script parses", () => {
    for (const file of readdirSync(new URL("../scripts/", import.meta.url)).filter((name) => name.endsWith(".js"))) {
        assert.doesNotThrow(() => execFileSync(process.execPath, ["--check", new URL(`../scripts/${file}`, import.meta.url).pathname], { stdio: "pipe" }), file);
    }
});
