// A feat's PF2e action links with another skill or statistic ("[[/act high-jump skill=acrobatics]]", Graceful Leaper's; "[[/act escape
// skill=thievery]]", Escape Artist's), for the Basic Action Macro's window (round 109, scripts/workbench.js): each a button running that
// action with that skill. → [{ slug, statistic, label }], none for a link with no other skill.

const words = (slug) => slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function actLinks(html) {
    const found = [];
    for (const match of String(html ?? "").matchAll(/\[\[\/act ([a-z-]+)((?: [a-z-]+=[^\s\]]+)*)\]\](?:\{([^}]*)\})?/g)) {
        const params = Object.fromEntries([...match[2].matchAll(/([a-z-]+)=([^\s\]]+)/g)].map((each) => [each[1], each[2]]));
        const statistic = params.skill ?? params.statistic ?? null;
        if (!statistic) continue;
        const slug = match[1];
        if (found.some((each) => each.slug === slug && each.statistic === statistic)) continue;
        found.push({ slug, statistic, label: `${words(slug)} (${words(statistic)})` });
    }
    return found;
}
