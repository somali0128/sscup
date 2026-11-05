// Difficulty tiers. The server decides room draws; these helpers render tiers
// and drive the room-free wheel, mirroring the backend's weighting rule.
export const TIERS = {
  white: { label: "白", name: "简单" },
  purple: { label: "紫", name: "中等" },
  gold: { label: "金", name: "困难" },
};
export const tierOf = (event) => (event && TIERS[event.tier] ? event.tier : "white");
export const tierClass = (event) => `vr-tier-${tierOf(event)}`;
const MAX_BALANCE = 3;
const STEP = 0.5;
export function tierWeight(tier, balance) {
  if (tier === "gold" && balance > 0) return 1 + STEP * balance;
  if (tier === "white" && balance < 0) return 1 - STEP * balance;
  return 1;
}
export function nextBalance(balance, tier) {
  if (tier === "white") return Math.min(MAX_BALANCE, balance + 1);
  if (tier === "gold") return Math.max(-MAX_BALANCE, balance - 1);
  if (tier === "purple") return balance > 0 ? balance - 1 : balance < 0 ? balance + 1 : 0;
  return balance;
}
export function eligible(pool, pistol) {
  const list = pistol ? pool.filter((e) => e.pistol !== false) : pool;
  return list.length ? list : pool;
}
export function odds(pool, balance, pistol) {
  const list = eligible(pool, pistol);
  const total = list.reduce((sum, e) => sum + tierWeight(tierOf(e), balance), 0) || 1;
  const share = (tier) =>
    Math.round(
      (100 *
        list
          .filter((e) => tierOf(e) === tier)
          .reduce((sum) => sum + tierWeight(tier, balance), 0)) /
        total,
    );
  return { white: share("white"), purple: share("purple"), gold: share("gold") };
}
export function weightedPick(pool, balance, pistol, exclude = []) {
  let list = eligible(pool, pistol).filter((e) => !exclude.includes(e.id));
  if (!list.length) list = pool;
  const weights = list.map((e) => tierWeight(tierOf(e), balance));
  let roll = (crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) *
    weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) {
    if (roll < weights[i]) return list[i];
    roll -= weights[i];
  }
  return list.at(-1);
}
