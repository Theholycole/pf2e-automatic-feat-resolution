// The module's rule elements on a character's feats, heritages and backgrounds (2026-10-30, docs/rules.md). PF2e builds an item's rule
// elements from its prepared system.rules (RuleElements.fromOwnedItem); this adds the module's (src/rules/index.js) there as the item
// prepares them, so they're never written into the world, and leave with the module. Only rule elements that never write back to their
// own source (no ChoiceSet, GrantItem, toggleable RollOption, Strike), since theirs isn't in the item's data.

import { rulesFor } from "../src/rules/index.js";
import { companionRulesFrom } from "../src/rules/companion.js";
import { companionsOf, findMaster, isCompanion } from "../src/compiler/companion.js";

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
                const added = rulesFor({ ...this, actor: this.actor, sourceId: this.sourceId, _stats: this._stats, flags: this.flags, system: { ...this.system, rules: own } }).map((rule) => {
                    const copy = foundry.utils.deepClone(rule);
                    ours.add(copy);
                    return copy;
                });
                this.system.rules = [...own, ...added];
            }
            return original.apply(this, args);
        };
    }
    // (A master's feats' rules for its companion, on the companion's ancestry: src/rules/companion.js.)
    const ancestry = CONFIG.PF2E?.Item?.documentClasses?.ancestry;
    const original = ancestry?.prototype?.prepareRuleElements;
    if (typeof original !== "function") return;
    ancestry.prototype.prepareRuleElements = function (...args) {
        if (Array.isArray(this.system?.rules) && this.actor && (isCompanion(this.actor) || this.slug === "eidolon" || this.system?.traits?.value?.includes?.("eidolon"))) {
            const own = this.system.rules.filter((rule) => !ours.has(rule));
            const master = game.ready ? findMaster(this.actor, { actors: [...(game.actors ?? [])], users: [...(game.users ?? [])] }) : null;
            const added = companionRulesFrom(master).map((rule) => {
                const copy = foundry.utils.deepClone(rule);
                ours.add(copy);
                return copy;
            });
            this.system.rules = [...own, ...added];
        }
        return original.apply(this, args);
    };
    // (Its master isn't known before the world is ready, and its feats change: the companions prepare again.)
    // (Its tokens too: a light from the rules, Sheathed in Light's, shows only once the token prepares again; round 53 Foundry test.)
    const resetWithTokens = (companion) => {
        companion.reset?.();
        for (const token of companion.getActiveTokens?.(false, true) ?? []) {
            token.reset?.();
            const placed = token.object;
            if (typeof placed?.initializeSources === "function") placed.initializeSources();
            else placed?.initializeLightSource?.();
            placed?.renderFlags?.set?.({ refreshLighting: true });
        }
    };
    const again = (master) => {
        if (master?.type !== "character" || isCompanion(master)) return;
        for (const companion of companionsOf(master, { actors: [...game.actors], users: [...game.users] })) resetWithTokens(companion);
    };
    Hooks.once("ready", () => {
        for (const actor of game.actors ?? []) if (isCompanion(actor)) resetWithTokens(actor);
    });
    for (const hook of ["createItem", "deleteItem"]) Hooks.on(hook, (item) => again(item?.parent));
}
