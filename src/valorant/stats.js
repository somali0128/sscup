// Post-game analysis from recorded round outcomes and the draw log.
// Pure functions so the same numbers feed the screen and the JSON export.

const pct = (wins, total) => (total ? Math.round((wins / total) * 100) : 0);
const names = (list) => list.map((p) => p.nickname).join("、");

function leaders(list, value, { min = -Infinity, lowest = false } = {}) {
  const eligible = list.filter((x) => value(x) !== null && value(x) >= min);
  if (!eligible.length) return [];
  const best = lowest
    ? Math.min(...eligible.map(value))
    : Math.max(...eligible.map(value));
  return eligible.filter((x) => value(x) === best);
}

export function computeStats(summary, records = []) {
  const decided = (summary?.rounds || [])
    .filter((r) => r.winner)
    .sort((a, b) => a.round - b.round);
  const score = {
    left: decided.filter((r) => r.winner === "left").length,
    right: decided.filter((r) => r.winner === "right").length,
  };
  const players = new Map();
  const player = (effect) => {
    if (!players.has(effect.memberId))
      players.set(effect.memberId, {
        memberId: effect.memberId,
        nickname: effect.nickname,
        team: effect.team,
        rounds: 0,
        wins: 0,
        rerolls: 0,
        streak: 0,
        bestStreak: 0,
        events: new Map(),
        tiers: { white: 0, purple: 0, gold: 0 },
        goldWins: 0,
        tops: 0,
        topWins: 0,
      });
    return players.get(effect.memberId);
  };
  const events = new Map();
  for (const round of decided)
    for (const effect of round.effects) {
      const p = player(effect);
      const won = effect.team === round.winner;
      p.rounds++;
      p.wins += won ? 1 : 0;
      p.streak = won ? p.streak + 1 : 0;
      p.bestStreak = Math.max(p.bestStreak, p.streak);
      if (round.top && round.top === effect.memberId) {
        p.tops++;
        p.topWins += won ? 1 : 0;
      }
      // A sanctioned top player carries two effects in one round.
      const carried = [effect.event, effect.extra].filter(Boolean);
      let gold = false;
      for (const event of carried) {
        const tier = ["white", "purple", "gold"].includes(event.tier) ? event.tier : "white";
        p.tiers[tier]++;
        gold ||= tier === "gold";
        p.events.set(event.name, (p.events.get(event.name) || 0) + 1);
        const e = events.get(event.id) || {
          id: event.id,
          name: event.name,
          tier: event.tier,
          appearances: 0,
          wins: 0,
        };
        e.appearances++;
        e.wins += won ? 1 : 0;
        events.set(event.id, e);
      }
      if (gold && won) p.goldWins++;
    }
  // Personal redraws come from the log (it also covers an unrecorded last round).
  const spins = new Map();
  for (const row of records)
    if (row.action === "spin")
      for (const result of row.results)
        spins.set(result.memberId, (spins.get(result.memberId) || 0) + 1);
  for (const p of players.values())
    p.rerolls = records.length
      ? spins.get(p.memberId) || 0
      : decided.reduce(
          (sum, r) =>
            sum +
            (r.effects.find((x) => x.memberId === p.memberId)?.rerolls || 0),
          0,
        );

  const playerList = [...players.values()]
    .map((p) => {
      const [favorite, favoriteCount] = [...p.events.entries()].sort(
        (a, b) => b[1] - a[1],
      )[0] || ["", 0];
      return {
        memberId: p.memberId,
        nickname: p.nickname,
        team: p.team,
        rounds: p.rounds,
        wins: p.wins,
        winRate: pct(p.wins, p.rounds),
        rerolls: p.rerolls,
        distinct: p.events.size,
        bestStreak: p.bestStreak,
        tiers: p.tiers,
        goldWins: p.goldWins,
        tops: p.tops,
        topWins: p.topWins,
        favorite,
        favoriteCount,
      };
    })
    .sort(
      (a, b) =>
        b.winRate - a.winRate || b.wins - a.wins || b.rounds - a.rounds,
    );
  const eventList = [...events.values()]
    .map((e) => ({ ...e, winRate: pct(e.wins, e.appearances) }))
    .sort((a, b) => b.appearances - a.appearances || b.winRate - a.winRate);

  const awards = [];
  const total = decided.length;
  const regular = Math.max(1, Math.ceil(total / 2));
  const add = (id, icon, title, winners, detail) => {
    if (winners.length) awards.push({ id, icon, title, winners: names(winners), detail });
  };
  if (total) {
    const top = leaders(playerList, (p) => (p.rounds >= regular ? p.winRate : null));
    const topBy = leaders(top, (p) => p.wins);
    if (topBy.length)
      add(
        "mvp",
        "👑",
        "天选之人",
        topBy,
        `胜率 ${topBy[0].winRate}%（${topBy[0].wins}/${topBy[0].rounds}）`,
      );
    const streak = leaders(playerList, (p) => p.bestStreak, { min: 2 });
    if (streak.length)
      add("streak", "🔥", "连胜引擎", streak, `连续赢下 ${streak[0].bestStreak} 回合`);
    const fate = leaders(playerList, (p) => p.favoriteCount, { min: 2 });
    if (fate.length)
      add(
        "fate",
        "🎯",
        "命中注定",
        fate,
        fate.length === 1
          ? `${fate[0].favoriteCount} 次带着「${fate[0].favorite}」上场`
          : `同一效果上场 ${fate[0].favoriteCount} 次`,
      );
    const hard = leaders(playerList, (p) => p.tiers.gold, { min: 2 });
    if (hard.length)
      add("gold", "💎", "金色硬汉", hard, `扛下 ${hard[0].tiers.gold} 个金色效果`);
    const clutch = leaders(playerList, (p) => p.goldWins, { min: 1 });
    if (clutch.length)
      add("clutch", "🦾", "逆境之王", clutch, `带着金色效果赢下 ${clutch[0].goldWins} 回合`);
    const sanctioned = leaders(playerList, (p) => p.tops, { min: 1 });
    if (sanctioned.length)
      add(
        "top",
        "⚖️",
        "制裁之王",
        sanctioned,
        sanctioned.length === 1 && sanctioned[0].topWins
          ? `当了 ${sanctioned[0].tops} 回榜一，顶着双效果赢下 ${sanctioned[0].topWins} 回`
          : `当了 ${sanctioned[0].tops} 回榜一，扛着双效果上场`,
      );
    const variety = leaders(playerList, (p) => p.distinct, { min: 3 });
    if (variety.length)
      add("variety", "🧩", "百变玩家", variety, `体验了 ${variety[0].distinct} 种不同效果`);
    if (total >= 2) {
      const low = leaders(
        playerList,
        (p) => (p.rounds >= regular ? p.winRate : null),
        { lowest: true },
      );
      const topIds = new Set(topBy.map((p) => p.memberId));
      const lowOnly = low.filter((p) => !topIds.has(p.memberId));
      if (lowOnly.length && lowOnly[0].winRate < (topBy[0]?.winRate ?? 100))
        add(
          "spirit",
          "🫡",
          "虽败犹荣",
          lowOnly,
          `胜率 ${lowOnly[0].winRate}%，效果太难不怪你`,
        );
    }
  }
  const reroll = leaders(playerList, (p) => p.rerolls, { min: 1 });
  if (reroll.length)
    add("reroll", "🎲", "重抽狂魔", reroll, `亲手重抽 ${reroll[0].rerolls} 次`);
  const frequent = eventList.filter((e) => e.appearances >= 2);
  const buff = leaders(frequent, (e) => e.winRate);
  const curse = leaders(frequent, (e) => e.winRate, { lowest: true });
  return {
    rounds: total,
    score,
    winner:
      score.left === score.right ? null : score.left > score.right ? "left" : "right",
    players: playerList,
    events: eventList,
    awards,
    luckiest: buff.length && buff[0].winRate > 50 ? buff : [],
    toughest: curse.length && curse[0].winRate < 50 ? curse : [],
  };
}
