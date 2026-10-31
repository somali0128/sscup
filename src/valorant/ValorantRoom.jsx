import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  actionNames,
  downloadHistory,
  ENDPOINT,
  newToken,
  request,
  saveSession,
  storedSession,
} from "./api";
import "./valorant.css";

const teamName = (team) =>
  team === "left" ? "左队" : team === "right" ? "右队" : "裁判 / 等待席";
const date = (at) => new Date(at).toLocaleString("zh-CN", { hour12: false });

function Entry({ onEnter, busy }) {
  const [mode, setMode] = useState("join");
  const [showPassword, setShowPassword] = useState(false);
  const [recovery] = useState(newToken);
  const [recoveryCode, setRecoveryCode] = useState("");
  useEffect(() => {
    crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(recovery))
      .then((buffer) =>
        setRecoveryCode(
          Array.from(new Uint8Array(buffer), (x) =>
            x.toString(16).padStart(2, "0"),
          ).join(""),
        ),
      );
  }, [recovery]);
  const [hint, setHint] = useState("");
  return (
    <section className="vr-entry vr-panel">
      <div className="vr-eyebrow">READY WHEN YOU ARE</div>
      <h2>集合，准备开局。</h2>
      <p className="vr-muted">
        推荐使用手机操作。输入游戏昵称，和队友一起转出这回合的玩法。
      </p>
      <div className="vr-tabs" aria-label="进入方式">
        {[
          ["join", "加入房间"],
          ["create", "创建房间"],
          ["recover", "恢复身份"],
        ].map(([id, text]) => (
          <button
            type="button"
            key={id}
            aria-pressed={mode === id}
            onClick={() => {
              setMode(id);
              setHint("");
            }}
          >
            {text}
          </button>
        ))}
      </div>
      <form
        action={ENDPOINT}
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          onEnter(
            mode,
            Object.fromEntries(new FormData(e.currentTarget)),
            recovery,
          );
        }}
      >
        {mode !== "recover" && (
          <label>
            游戏昵称 <span>必填，建议与游戏内一致</span>
            <input
              name="nickname"
              required
              maxLength={32}
              autoComplete="nickname"
              autoCorrect="off"
              spellCheck={false}
              placeholder="例如：臭鱼#12345"
            />
          </label>
        )}
        {mode !== "create" && (
          <label>
            房间代码
            <input
              name="code"
              required
              pattern="[A-HJ-NP-Za-hj-np-z2-9]{6}"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              defaultValue={
                new URLSearchParams(window.location.search).get("room") || ""
              }
              placeholder="6 位房间码"
            />
          </label>
        )}
        {mode === "create" && (
          <label>
            创建密码
            <input
              name="password"
              required
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              maxLength={128}
            />
            <button
              type="button"
              className="vr-text-button"
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "隐藏密码" : "显示密码"}
            </button>
          </label>
        )}
        {mode === "recover" && (
          <div className="vr-callout">
            <p>
              原浏览器会自动恢复。更换设备时，把下方恢复码私下发给房主/裁判，待其为你的昵称更新身份后，点击恢复。保持此页面打开，恢复码不等于登录密钥。
            </p>
            <textarea
              aria-label="本设备恢复码"
              readOnly
              value={recoveryCode}
              rows={3}
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(recoveryCode);
                  setHint("恢复码已复制。");
                } catch {
                  setHint("请长按上方恢复码，手动复制。");
                }
              }}
            >
              复制恢复码
            </button>
            <p role="status">{hint}</p>
          </div>
        )}
        <button className="vr-primary" disabled={busy} type="submit">
          {busy
            ? "正在连接…"
            : mode === "create"
              ? "创建房间 →"
              : mode === "recover"
                ? "恢复原身份 →"
                : "加入房间 →"}
        </button>
      </form>
      <div className="vr-entry-notes">
        <span>01 / 游戏昵称入场</span>
        <span>02 / 选队后开始</span>
        <span>03 / 每回合随机玩法</span>
      </div>
    </section>
  );
}

function Wheel({ pool, result, canSpin, onSpin, busy, ended }) {
  const index = result ? pool.findIndex((x) => x.id === result.event.id) : 0;
  // Re-mounting on a new server draw also animates repeated outcomes.
  const rotation = 1440 - (Math.max(index, 0) + 0.5) * (360 / pool.length);
  return (
    <section className="vr-panel vr-wheel-panel">
      <div className="vr-section-title">
        <h2>我的命运轮盘</h2>
        <span>{pool.length} 种可能</span>
      </div>
      <div className="vr-wheel-wrap" aria-hidden="true">
        <div className="vr-pointer" />
        <div
          key={result?.drawId || "waiting"}
          className={`vr-wheel ${result ? "vr-wheel-spin" : ""}`}
          style={{
            "--finish": `${rotation}deg`,
            background: `conic-gradient(${pool.map((_, i) => `${["#fd5d68", "#223c49", "#375564"][i % 3]} ${(i * 360) / pool.length}deg ${((i + 1) * 360) / pool.length}deg`).join(",")})`,
          }}
        >
          <svg viewBox="0 0 400 400" className="vr-wheel-labels">
            {pool.map((item, i) => (
              <text
                key={item.id}
                x="385"
                y="200"
                textAnchor="end"
                dominantBaseline="central"
                transform={`rotate(${((i + 0.5) * 360) / pool.length - 90} 200 200)`}
              >
                {item.name}
              </text>
            ))}
          </svg>
        </div>
        <div className="vr-wheel-hub">
          S&S<span>好运开局</span>
        </div>
      </div>
      <div className="vr-result" aria-live="polite">
        <span className="vr-eyebrow">
          {result ? `第 ${result.round} 回合` : "等待开始"}
        </span>
        <h3>{result?.event.name || "下一种可能，由你转动"}</h3>
      </div>
      <button
        className="vr-primary"
        type="button"
        disabled={!canSpin || busy}
        onClick={onSpin}
      >
        {busy
          ? "正在同步…"
          : canSpin
            ? "转动轮盘 · 重新抽取"
            : ended
              ? "本场已结束"
              : "等待房主 / 裁判统一抽取"}
      </button>
      <p className="vr-caption">
        结果由服务器确定。重新抽取替换当前效果，并保留历史。
      </p>
    </section>
  );
}

function History({ session, room }) {
  const [games, setGames] = useState([]);
  const [selected, setSelected] = useState("");
  const [rows, setRows] = useState([]);
  const [next, setNext] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectionRef = useRef("");
  const gameId = selected || games[0]?.id;
  selectionRef.current = gameId;
  useEffect(() => {
    let cancelled = false;
    request(session.token, null, { code: session.code, view: "games" })
      .then((r) => {
        if (!cancelled) setGames(r.data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [session, room.gameNumber, room.phase]);
  useEffect(() => {
    let cancelled = false;
    if (!gameId) return;
    request(session.token, null, {
      code: session.code,
      view: "history",
      gameId,
    })
      .then((r) => {
        if (!cancelled) {
          setRows(r.data);
          setNext(r.next);
          setError("");
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session, gameId, room.version]);
  async function loadMore() {
    setBusy(true);
    try {
      const r = await request(session.token, null, {
        code: session.code,
        view: "history",
        gameId,
        after: next,
      });
      if (selectionRef.current === gameId) {
        setRows((old) => [...old, ...r.data]);
        setNext(r.next);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function download(format) {
    setBusy(true);
    setError("");
    try {
      const all = [];
      let after = 0;
      do {
        const r = await request(session.token, null, {
          code: session.code,
          view: "history",
          gameId,
          after,
        });
        all.push(...r.data);
        after = r.next;
      } while (after !== null);
      downloadHistory(
        all,
        room.code,
        games.find((g) => g.id === gameId),
        format,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="vr-panel vr-history">
      <h2>抽取历史</h2>
      <p className="vr-muted">
        进行中仅显示有权查看的效果。结束后向本场成员公开全部记录，保留 30 天。
      </p>
      {error && (
        <p role="alert" className="vr-error">
          {error}
        </p>
      )}
      {!games.length ? (
        <p>暂无可查看的场次。</p>
      ) : (
        <>
          <label>
            选择场次
            <select
              value={gameId || ""}
              onChange={(e) => {
                setSelected(e.target.value);
                setRows([]);
                setNext(null);
                setLoading(true);
              }}
              disabled={busy}
            >
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  第 {g.number} 场 · {g.endedAt ? "已结束" : "进行中"}
                </option>
              ))}
            </select>
          </label>
          <div className="vr-actions">
            <button
              disabled={busy || !games.find((g) => g.id === gameId)?.endedAt}
              onClick={() => download("csv")}
            >
              下载 CSV
            </button>
            <button
              disabled={busy || !games.find((g) => g.id === gameId)?.endedAt}
              onClick={() => download("json")}
            >
              下载 JSON
            </button>
          </div>
          {busy && <p role="status">正在读取历史…</p>}
          {loading && <p role="status">正在加载…</p>}
          <ol>
            {rows.map((row) => (
              <li key={row.id}>
                <div className="vr-history-heading">
                  <strong>
                    R{row.round} · {actionNames[row.action] || row.action}
                  </strong>
                  <time>{date(row.at)}</time>
                </div>
                <p className="vr-muted">操作人：{row.actor}</p>
                {row.results.map((result) => (
                  <p key={result.memberId}>
                    <b>{result.nickname}</b> / {teamName(result.team)}：
                    {result.event.name}
                  </p>
                ))}
              </li>
            ))}
          </ol>
          {next !== null && (
            <button disabled={busy} onClick={loadMore}>
              加载更多
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default function ValorantRoom() {
  const [session, setSession] = useState(storedSession);
  const [room, setRoom] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [network, setNetwork] = useState("正在连接");
  const [hint, setHint] = useState("");
  const [tab, setTab] = useState("game");
  const [confirm, setConfirm] = useState(null);
  const confirmRef = useRef(null);
  useEffect(() => {
    if (confirm) {
      confirmRef.current?.focus();
      confirmRef.current?.scrollIntoView({ block: "center" });
    }
  }, [confirm]);
  const entryToken = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const accept = (data) =>
    setRoom((old) =>
      !old || old.code !== data.code || data.version >= old.version
        ? data
        : old,
    );
  useEffect(() => {
    if (!session) return;
    let stopped = false;
    let timer;
    let heartbeat = 0;
    async function sync() {
      if (stopped) return;
      clearTimeout(timer);
      if (!document.hidden) {
        try {
          const sendHeartbeat = Date.now() - heartbeat > 9000;
          const r = await request(
            session.token,
            sendHeartbeat ? { action: "heartbeat", code: session.code } : null,
            { code: session.code },
          );
          if (sendHeartbeat) heartbeat = Date.now();
          if (!stopped) {
            accept(r.data);
            setNetwork("已连接 · 自动同步");
          }
        } catch (e) {
          if (!stopped)
            setNetwork(
              e.status === 401
                ? "身份失效，请返回入口恢复"
                : e.status === 404
                  ? "房间不存在或已过期"
                  : "连接中断 · 正在重试",
            );
        }
      }
      if (!stopped) timer = setTimeout(sync, 3000);
    }
    // One poll in flight; visibility changes only schedule an earlier next poll.
    const visibility = () => {
      if (!document.hidden) setNetwork("正在恢复同步");
    };
    sync();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [session]);
  async function enter(mode, values, recovery) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      // Check storage before creating a server-side identity that this browser cannot retain.
      localStorage.setItem("valorant:storage-check", "1");
      localStorage.removeItem("valorant:storage-check");
      const code = values.code?.trim().toUpperCase();
      const existing = code && localStorage.getItem(`valorant:token:${code}`);
      if (!entryToken.current) {
        const pending = localStorage.getItem("valorant:pending");
        entryToken.current = /^[a-f0-9]{64}$/.test(pending || "")
          ? pending
          : newToken();
        localStorage.setItem("valorant:pending", entryToken.current);
      }
      const token =
        mode === "recover" ? recovery : existing || entryToken.current;
      const r =
        mode === "recover" || existing
          ? await request(token, null, { code })
          : await request(token, {
              action: mode,
              ...(mode === "create" ? { password: values.password } : { code }),
              nickname: values.nickname.trim(),
            });
      const nextSession = { code: r.data.code, token };
      saveSession(nextSession);
      setSession(nextSession);
      setRoom(r.data);
      entryToken.current = null;
      localStorage.removeItem("valorant:pending");
    } catch (e) {
      setError(e.name === "AbortError" ? "连接超时，请重试。" : e.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function act(action, extra = {}) {
    if (busyRef.current || !room) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setConfirm(null);
    const current = session;
    try {
      const r = await request(session.token, {
        action,
        code: room.code,
        version: room.version,
        ...extra,
      });
      if (sessionRef.current === current) accept(r.data);
    } catch (e) {
      setError(
        e.name === "AbortError"
          ? "连接超时；请等待同步后再操作，避免重复抽取。"
          : e.message,
      );
      try {
        const latest = await request(session.token, null, { code: room.code });
        if (sessionRef.current === current) accept(latest.data);
      } catch {
        /* Retain last confirmed snapshot. */
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function leaveScreen() {
    setSession(null);
    setRoom(null);
    setError("");
    setConfirm(null);
    setTab("game");
    setHint("");
    window.history.replaceState(null, "", window.location.pathname);
  }
  async function share() {
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      setHint("邀请链接已复制，好友仍需填写游戏昵称。");
    } catch {
      setHint(`请复制房间码：${room.code}`);
    }
  }
  const me = room?.members.find((m) => m.id === room.meId);
  const host = room?.hostId === room?.meId;
  const result = room?.results.find((r) => r.memberId === room.meId);
  return (
    <main className="vr-app">
      <header className="vr-header">
        <Link to="/" className="vr-brand">
          S&S <span>CUP / 无畏契约</span>
        </Link>
      </header>
      <div className="vr-shell">
        <section className="vr-intro">
          <div className="vr-eyebrow">VALORANT · 随机事件房间</div>
          <h1>
            <span className="vr-title-name">臭鱼烂虾杯·无畏契约</span>
            <br />
            <span>轮盘工具</span>
          </h1>
          <p>玩法灵感来源于网络，仅供娱乐！</p>
        </section>
        {error && (
          <div className="vr-error" role="alert">
            {error}
            <button type="button" onClick={() => setError("")}>
              关闭提示
            </button>
          </div>
        )}
        {!session ? (
          <Entry onEnter={enter} busy={busy} />
        ) : !room ? (
          <section className="vr-panel">
            <h2>正在恢复房间 {session.code}</h2>
            <p role="status">{network}</p>
            <button onClick={leaveScreen}>返回入口</button>
          </section>
        ) : (
          <>
            <section className="vr-room-bar">
              <div>
                <span className="vr-eyebrow">ROOM CODE</span>
                <strong>{room.code}</strong>
              </div>
              <div className="vr-room-status">
                <b>
                  {room.phase === "lobby"
                    ? "等待大厅"
                    : room.phase === "playing"
                      ? `第 ${room.gameNumber} 场 / R${room.round}`
                      : `第 ${room.gameNumber} 场已结束`}
                </b>
                <span role="status">{network}</span>
              </div>
              <button onClick={share}>邀请好友</button>
              <button onClick={leaveScreen} disabled={busy}>
                返回入口
              </button>
            </section>
            {hint && (
              <p role="status" className="vr-callout">
                {hint}
              </p>
            )}
            <div className="vr-tabs">
              <button
                aria-pressed={tab === "game"}
                onClick={() => setTab("game")}
              >
                房间与轮盘
              </button>
              <button
                aria-pressed={tab === "history"}
                onClick={() => setTab("history")}
              >
                抽取历史
              </button>
              <button
                aria-pressed={tab === "rules"}
                onClick={() => setTab("rules")}
              >
                全部事件 · {room.pool.length}
              </button>
            </div>
            {tab === "history" ? (
              <History session={session} room={room} />
            ) : tab === "rules" ? (
              <section className="vr-panel">
                <h2>本场事件池</h2>
                <p className="vr-muted">
                  等概率 · 允许重复 ·
                  重新抽取替换原效果。所有约束由玩家在游戏内执行。
                </p>
                <div className="vr-event-list">
                  {room.pool.map((event) => (
                    <article key={event.id}>
                      <div>
                        <h3>{event.name}</h3>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <>
                <div className="vr-game-grid">
                  <div className="vr-main-column">
                    {room.phase === "lobby" ? (
                      <section className="vr-panel">
                        <div className="vr-section-title">
                          <h2>选择你的队伍</h2>
                          <span>{room.members.length} / 13 人</span>
                        </div>
                        <p className="vr-muted">
                          每队最多 5
                          人，允许不等人数开始。开始后锁定名单与队伍。
                        </p>
                        <div className="vr-actions">
                          <button
                            disabled={busy || me.referee}
                            aria-pressed={me.team === "left"}
                            onClick={() => act("team", { team: "left" })}
                          >
                            加入左队
                          </button>
                          <button
                            disabled={busy || me.referee}
                            aria-pressed={me.team === "right"}
                            onClick={() => act("team", { team: "right" })}
                          >
                            加入右队
                          </button>
                          <button
                            disabled={busy || me.referee || !me.team}
                            onClick={() => act("team", { team: null })}
                          >
                            退出队伍
                          </button>
                        </div>
                        {me.referee && (
                          <p className="vr-callout">
                            你是裁判，可查看双方效果，不占参赛席位。
                          </p>
                        )}
                      </section>
                    ) : me.team ? (
                      <Wheel
                        pool={room.pool}
                        result={result}
                        canSpin={room.phase === "playing" && !room.unified}
                        ended={room.phase === "ended"}
                        onSpin={() => act("spin")}
                        busy={busy}
                      />
                    ) : (
                      <section className="vr-panel">
                        <h2>
                          {room.phase === "ended" ? "本场已结束" : "裁判总览"}
                        </h2>
                        <p>
                          在队伍卡片中查看所有玩家的效果，或打开历史查看抽取记录。
                        </p>
                      </section>
                    )}
                    <div className="vr-team-grid">
                      {["left", "right"].map((team) => (
                        <section
                          className={`vr-panel vr-team vr-team-${team}`}
                          key={team}
                        >
                          <div className="vr-section-title">
                            <h2>{teamName(team)}</h2>
                            <span>
                              {
                                room.members.filter((m) => m.team === team)
                                  .length
                              }{" "}
                              / 5
                            </span>
                          </div>
                          {room.members
                            .filter((m) => m.team === team)
                            .map((m) => {
                              const effect = room.results.find(
                                (x) => x.memberId === m.id,
                              );
                              return (
                                <article className="vr-player" key={m.id}>
                                  <div>
                                    <strong>
                                      {m.nickname}
                                      {m.id === me.id ? "（你）" : ""}
                                    </strong>
                                    <span
                                      className={
                                        m.online ? "vr-online" : "vr-muted"
                                      }
                                    >
                                      {m.online ? "在线" : "离线"}
                                      {m.id === room.hostId ? " · 房主" : ""}
                                    </span>
                                  </div>
                                  {room.phase !== "lobby" && (
                                    <p>
                                      {effect ? (
                                        <>
                                          <b>{effect.event.name}</b>
                                          <small>
                                            R{effect.round} 抽取
                                            {effect.round !== room.round &&
                                            room.phase === "playing"
                                              ? " · 尚未抽取本回合效果"
                                              : ""}
                                          </small>
                                        </>
                                      ) : (
                                        "敌方效果保密"
                                      )}
                                    </p>
                                  )}
                                </article>
                              );
                            })}
                          {!room.members.some((m) => m.team === team) && (
                            <p className="vr-muted">等待玩家加入…</p>
                          )}
                        </section>
                      ))}
                    </div>
                  </div>
                  <aside className="vr-side-column">
                    <section className="vr-panel">
                      <h2>房间设置</h2>
                      <p className="vr-muted">
                        {room.unified
                          ? "统一抽取：玩家等待房主或裁判操作。"
                          : "自由抽取：玩家可随时重抽，所有操作留档。"}
                      </p>
                      {host && room.phase === "lobby" && (
                        <label className="vr-checkbox">
                          <input
                            type="checkbox"
                            checked={room.unified}
                            disabled={busy}
                            onChange={(e) =>
                              act("settings", { unified: e.target.checked })
                            }
                          />
                          总是由房主统一抽取
                        </label>
                      )}
                      <p className="vr-caption">
                        {me.team
                          ? "你只能查看本队效果，即使你是房主。"
                          : "未参赛房主和指定裁判可查看双方效果。"}
                      </p>
                      {host && room.phase === "lobby" && (
                        <button
                          className="vr-primary"
                          disabled={busy}
                          onClick={() =>
                            setConfirm({
                              action: "start",
                              text: "开始本场后将锁定名单和队伍，并为所有参赛玩家抽取一次。",
                            })
                          }
                        >
                          开始游戏
                        </button>
                      )}
                      {room.canManage && room.phase === "playing" && (
                        <div className="vr-stacked">
                          <button
                            className="vr-primary"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                action: "spinAll",
                                text: "为所有参赛玩家重新抽取，替换当前效果。回合数保持不变。",
                              })
                            }
                          >
                            全员重抽
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => act("nextRound")}
                          >
                            进入下一回合 · R{room.round + 1}
                          </button>
                          <button
                            className="vr-danger"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                action: "end",
                                text: "结束后本场全部历史将向本场成员公开，且不能继续抽取。",
                              })
                            }
                          >
                            结束本场
                          </button>
                        </div>
                      )}
                      {room.canManage && room.phase === "ended" && (
                        <button
                          className="vr-primary"
                          disabled={busy}
                          onClick={() => act("reset")}
                        >
                          返回大厅 · 再来一场
                        </button>
                      )}
                      {room.canTakeover && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            setConfirm({
                              action: "takeover",
                              text: "房主离线已满 60 秒，接管后你将成为新的房主。",
                            })
                          }
                        >
                          裁判接管房主
                        </button>
                      )}
                      {confirm && (
                        <div
                          className="vr-confirm"
                          role="alert"
                          ref={confirmRef}
                          tabIndex={-1}
                        >
                          <p>{confirm.text}</p>
                          <div className="vr-actions">
                            <button
                              disabled={busy}
                              onClick={() => act(confirm.action, confirm.extra)}
                            >
                              确认操作
                            </button>
                            <button onClick={() => setConfirm(null)}>
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </section>
                    <section className="vr-panel">
                      <h2>成员管理</h2>
                      <p className="vr-muted">
                        {room.members.length} / 13 人（含房主、裁判）
                      </p>
                      {room.members.map((m) => (
                        <details className="vr-member" key={m.id}>
                          <summary>
                            {m.nickname}{" "}
                            <span>
                              {m.id === room.hostId ? "房主 / " : ""}
                              {m.referee ? "裁判" : teamName(m.team)}
                            </span>
                          </summary>
                          <p>
                            {m.online ? "在线" : "离线"} ·{" "}
                            {m.id === me.id ? "当前身份" : "房间成员"}
                          </p>
                          {host &&
                            room.phase === "lobby" &&
                            !m.team &&
                            m.id !== me.id && (
                              <button
                                disabled={busy}
                                onClick={() =>
                                  act("referee", {
                                    targetId: m.id,
                                    enabled: !m.referee,
                                  })
                                }
                              >
                                {m.referee ? "取消裁判" : "指定裁判"}
                              </button>
                            )}
                          {host && m.id !== me.id && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                setConfirm({
                                  action: "transfer",
                                  extra: { targetId: m.id },
                                  text: `将房主移交给 ${m.nickname}？`,
                                })
                              }
                            >
                              移交房主
                            </button>
                          )}
                          {room.canManage &&
                            room.phase === "lobby" &&
                            m.id !== room.hostId &&
                            m.id !== me.id &&
                            (host || !m.referee) && (
                              <button
                                disabled={busy}
                                onClick={() =>
                                  setConfirm({
                                    action: "remove",
                                    extra: { targetId: m.id },
                                    text: `将 ${m.nickname} 移出大厅？`,
                                  })
                                }
                              >
                                移出房间
                              </button>
                            )}
                          {room.canManage &&
                            (host || (m.id !== room.hostId && !m.referee)) &&
                            (!me.team || m.team === me.team) &&
                            m.id !== me.id && (
                              <form
                                action={ENDPOINT}
                                method="post"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const recoveryToken = new FormData(
                                    e.currentTarget,
                                  )
                                    .get("recoveryToken")
                                    .trim();
                                  setConfirm({
                                    action: "recover",
                                    extra: { targetId: m.id, recoveryToken },
                                    text: `确认已核实 ${m.nickname} 的身份？恢复后原设备立即失去权限。`,
                                  });
                                }}
                              >
                                <label>
                                  新设备恢复码
                                  <input
                                    name="recoveryToken"
                                    required
                                    pattern="[a-f0-9]{64}"
                                    autoComplete="off"
                                    spellCheck={false}
                                  />
                                </label>
                                <button disabled={busy}>协助恢复身份</button>
                              </form>
                            )}
                        </details>
                      ))}
                    </section>
                  </aside>
                </div>
              </>
            )}
          </>
        )}
        <footer className="vr-footer">
          本玩法仅供参考，如有雷同，纯属意外
        </footer>
      </div>
    </main>
  );
}
