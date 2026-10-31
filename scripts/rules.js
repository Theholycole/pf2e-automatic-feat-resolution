// The module's rule elements on a character's feats, heritages and backgrounds (2026-10-30, docs/rules.md). PF2e builds an item's rule
// elements from its prepared system.rules (RuleElements.fromOwnedItem); this adds the module's (src/rules/index.js) there as the item
// prepares them, so they're never written into the world, and leave with the module. Only rule elements that never write back to their
// own source (no ChoiceSet, GrantItem, toggleable RollOption, Strike), since theirs isn't in the item's data.

import { rulesFor } from "../src/rules/index.js";

const MODULE_ID = "pf2e-automatic-feat-resolution";
const ITEM_TYPES = ["feat", "heritage", "background"];
const ours = new WeakSet();

export function setUpRules() {
    for (const type of ITEM_TYPES) {
        const documentClass = CONFIG.PF2E?.Item?.documentClasses?.[type];
        const original = documentClass?.prototype?.prepareRuleElements;
        if (typeof original !== "function") {
            console.warn(`${MODULE_ID} | PF2e's ${type} items have no prepareRuleElements; the module's rules for them are off.`);
            continue;
        }
        documentClass.prototype.prepareRuleElements = function (...args) {
            if (this.actor?.type === "character" && Array.isArray(this.system?.rules)) {
                // (Prepared again and again: the module's from the last time out first.)
                const own = this.system.rules.filter((rule) => !ours.has(rule));
                const added = rulesFor({ ...this, sourceId: this.sourceId, _stats: this._stats, flags: this.flags, system: { ...this.system, rules: own } }).map((rule) => {
                    const copy = foundry.utils.deepClone(rule);
                    ours.add(copy);
                    return copy;
                });
                this.system.rules = [...own, ...added];
            }
            return original.apply(this, args);
        };
    }
}
