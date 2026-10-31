const BASE =
  import.meta.env.VITE_SOMA_API_URL ||
  (import.meta.env.DEV ? "" : "https://soma-api-one.vercel.app");
export const ENDPOINT = `${BASE}/api/valorant`;
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
  nextRound: "下一回合",
  end: "结束本场",
  transfer: "移交房主",
  takeover: "裁判接管",
  recover: "恢复身份",
};
export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function downloadHistory(records, code, game, format) {
  const content =
    format === "json"
      ? JSON.stringify({ room: code, game, records }, null, 2)
      : "\uFEFF" +
        [
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
          ],
          ...records.flatMap((row) =>
            (row.results.length ? row.results : [{}]).map((result) => [
              game.number,
              row.round,
              new Date(row.at).toISOString(),
              row.actor,
              actionNames[row.action] || row.action,
              row.id,
              result.nickname,
              result.team === "left"
                ? "左队"
                : result.team === "right"
                  ? "右队"
                  : "",
              result.event?.name,
            ]),
          ),
        ]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `无畏契约-${code}-第${game.number}场.${format}`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
