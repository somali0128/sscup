// Vercel (production) and Vite (development) forward this same-origin route.
// Browsers must not need direct access to the backend's hosting domain.
export const ENDPOINT = "/api/valorant";
export function newToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
export async function request(token, body, query = {}) {
  const url = new URL(ENDPOINT, window.location.origin);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  });
  const payload = body
    ? { ...body, requestId: body.requestId || crypto.randomUUID() }
    : null;
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        method: payload ? "POST" : "GET",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(payload ? { "Content-Type": "application/json" } : {}),
        },
        cache: "no-store",
        ...(payload ? { body: JSON.stringify(payload) } : {}),
      });
      let json;
      try {
        json = await response.json();
      } catch {
        throw new Error("房间接口尚未就绪，请确认后端已部署。");
      }
      if (!response.ok) {
        const error = new Error(json.error?.message || "请求失败，请重试。");
        error.status = response.status;
        throw error;
      }
      return json;
    } catch (error) {
      if (attempt === 1 && !error.status) {
        if (error.name === "AbortError")
          throw new Error("连接超时，请检查网络后重试；重复提交不会重复执行操作。");
        if (error instanceof TypeError)
          throw new Error("无法连接房间服务，请检查网络后重试。");
      }
      if (
        error.status ||
        attempt === 1 ||
        (error.name !== "AbortError" && !(error instanceof TypeError))
      )
        throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
export function storedSession() {
  try {
    const requested = new URLSearchParams(window.location.search)
      .get("room")
      ?.toUpperCase();
    const code = requested || localStorage.getItem("valorant:last");
    const token = code && localStorage.getItem(`valorant:token:${code}`);
    return /^[A-HJ-NP-Z2-9]{6}$/.test(code || "") &&
      /^[a-f0-9]{64}$/.test(token || "")
      ? { code, token }
      : null;
  } catch {
    return null;
  }
}
export function saveSession(session) {
  localStorage.setItem(`valorant:token:${session.code}`, session.token);
  localStorage.setItem("valorant:last", session.code);
  const url = new URL(window.location.href);
  url.searchParams.set("room", session.code);
  window.history.replaceState(null, "", url);
}
export const actionNames = {
  start: "开始并抽取",
  spin: "个人抽取",
  spinAll: "全员重抽",
  nextRound: "确认胜负 · 下一回合",
  end: "结束本场",
  amend: "修正胜负",
  transfer: "移交房主",
  takeover: "裁判接管",
  recover: "恢复身份",
};
export const teamLabel = (team) =>
  team === "left" ? "左队" : team === "right" ? "右队" : "";
const TIER_LABEL = { white: "白", purple: "紫", gold: "金" };
const tierLabel = (event) => (event ? TIER_LABEL[event.tier] || "" : "");
const names = (x) => [x?.event, x?.extra].filter(Boolean).map((e) => e.name).join(" + ");
const tiers = (x) => [x?.event, x?.extra].filter(Boolean).map(tierLabel).join(" + ");
export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
const csv = (rows) =>
  "﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
const iso = (at) => (at ? new Date(at).toISOString() : "");
export function roundRows(game, rounds) {
  return [
    [
      "场次",
      "回合",
      "胜方",
      "确认人",
      "确认时间",
      "修正时间",
      "游戏昵称",
      "队伍",
      "本回合效果",
      "效果难度",
      "是否获胜",
      "本回合重抽次数",
      "手枪局",
      "是否榜一",
    ],
    ...rounds.flatMap((round) =>
      (round.effects.length ? round.effects : [{}]).map((effect) => [
        game.number,
        round.round,
        teamLabel(round.winner) || "未记录",
        round.decidedBy,
        iso(round.decidedAt),
        iso(round.amendedAt),
        effect.nickname,
        teamLabel(effect.team),
        names(effect),
        tiers(effect),
        effect.team
          ? round.winner
            ? effect.team === round.winner
              ? "胜"
              : "负"
            : ""
          : "",
        effect.rerolls ?? "",
        round.pistol ? "是" : "",
        round.top && round.top === effect.memberId ? "是" : "",
      ]),
    ),
  ];
}
export function drawRows(game, records) {
  return [
    [
      "场次",
      "回合",
      "时间",
      "操作人",
      "操作",
      "批次",
      "游戏昵称",
      "队伍",
      "效果",
      "效果难度",
      "回合结果",
    ],
    ...records.flatMap((row) =>
      (row.results.length ? row.results : [{}]).map((result) => [
        game.number,
        row.round,
        iso(row.at),
        row.actor,
        actionNames[row.action] || row.action,
        row.id,
        result.nickname,
        teamLabel(result.team),
        names(result),
        tiers(result),
        row.outcome
          ? `R${row.outcome.round} ${teamLabel(row.outcome.winner) || "未记录"}胜`
          : "",
      ]),
    ),
  ];
}
// kind: "rounds" (CSV per round and player), "draws" (CSV draw log) or "json".
export function downloadHistory({ code, game, rounds, records, stats }, kind) {
  const json = kind === "json";
  const content = json
    ? JSON.stringify(
        { room: code, game, rounds, stats, records },
        null,
        2,
      )
    : csv(kind === "rounds" ? roundRows(game, rounds) : drawRows(game, records));
  const url = URL.createObjectURL(
    new Blob([content], {
      type: json ? "application/json" : "text/csv;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `无畏契约-${code}-第${game.number}场-${
    json ? "完整数据.json" : kind === "rounds" ? "回合战绩.csv" : "抽取明细.csv"
  }`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
