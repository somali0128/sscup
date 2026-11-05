import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ENDPOINT,
  newToken,
  request,
  saveSession,
  storedSession,
  teamLabel,
} from "./api";
import Entry from "./Entry";
import Records, { RoundTimeline, Score } from "./Records";
import { MiniWheel, SpinStage } from "./Wheel";
import { restAngle, unlockAudio } from "./wheel-utils";
import "./valorant.css";

const teamName = (team) => teamLabel(team) || "裁判 / 等待席";
const other = (team) => (team === "left" ? "right" : "left");
// Round-scoped actions are validated by game and round on the server, so other
// players' personal redraws cannot make the host's confirmation stale.
const ROUND_SCOPED = new Set(["spin", "spinAll", "nextRound", "end"]);

function readSeen() {
  try {
    return JSON.parse(localStorage.getItem("valorant:seen") || "{}") || {};
  } catch {
    return {};
  }
}

function Dialog({ title, children, onClose }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  useLayoutEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    const previous = document.activeElement;
    ref.current?.focus({ preventScroll: true });
    const key = (e) => {
      if (e.key === "Escape") close.current();
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      previous?.focus?.({ preventScroll: true });
    };
  }, []);
  return (
    <div className="vr-dialog-backdrop" onClick={() => close.current()}>
      <div
        className="vr-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vr-dialog-title"
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="vr-dialog-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ confirm, busy, onConfirm, onClose }) {
  const [choice, setChoice] = useState(confirm.initial);
  const picked = !confirm.choices || choice !== undefined;
  const chosen = confirm.choices?.find((c) => c.value === choice);
  return (
    <Dialog title={confirm.title} onClose={onClose}>
      {confirm.text && <p className="vr-muted">{confirm.text}</p>}
      {confirm.choices && (
        <div className="vr-choice" role="radiogroup" aria-label={confirm.title}>
          {confirm.choices.map((c) => (
            <button
              type="button"
              key={String(c.value)}
              role="radio"
              aria-checked={choice === c.value}
              className={`vr-choice-${c.tone || "plain"}`}
              onClick={() => setChoice(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {chosen?.note && <p className="vr-dialog-note">{chosen.note}</p>}
      <div className="vr-dialog-actions">
        <button type="button" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="vr-primary"
          disabled={busy || !picked}
          onClick={() =>
            onConfirm(
              confirm.action,
              confirm.choices
                ? { ...confirm.extra, [confirm.choiceKey]: choice }
                : confirm.extra,
            )
          }
        >
          {busy ? "正在提交…" : picked ? confirm.confirmLabel || "确认" : "请先选择"}
        </button>
      </div>
    </Dialog>
  );
}

function TeamPanel({ room, me, team, mine, className = "" }) {
  const members = room.members.filter(
    (m) => m.team === team && !(mine && m.id === me.id && room.phase === "playing"),
  );
  const total = room.members.filter((m) => m.team === team).length;
  const hidden = room.phase === "playing" && !room.canSeeAll && me.team !== team;
  return (
    <section className={`vr-panel vr-team vr-team-${team} ${className}`}>
      <div className="vr-section-title">
        <h2>
          {mine && room.phase === "playing" ? `队友 · ${teamName(team)}` : teamName(team)}
          {room.phase !== "lobby" && (
            <span className="vr-team-score">{room.score[team]} 胜</span>
          )}
        </h2>
        <span>{total} / 5</span>
      </div>
      {hidden && <p className="vr-muted vr-secret">对方效果保密，结束后公开。</p>}
      <ul className="vr-roster">
        {members.map((m) => {
          const effect = room.results.find((x) => x.memberId === m.id);
          return (
            <li key={m.id} className={m.id === me.id ? "is-me" : undefined}>
              <span className="vr-roster-name">
                <i className={m.online ? "vr-dot is-on" : "vr-dot"} title={m.online ? "在线" : "离线"} />
                <span>
                  {m.nickname}
                  {m.id === me.id && <em>你</em>}
                  {m.id === room.hostId && <em>房主</em>}
                </span>
              </span>
              {room.phase !== "lobby" && !hidden && (
                <b key={effect?.drawId} className="vr-roster-effect vr-fx">
                  {effect ? effect.event.name : "—"}
                  {effect && room.rerolls[m.id] > 0 && room.phase === "playing" && (
                    <small>重抽 {room.rerolls[m.id]}</small>
                  )}
                </b>
              )}
            </li>
          );
        })}
      </ul>
      {!members.length && (
        <p className="vr-muted">
          {total ? "只有你一人，加油！" : "等待玩家加入…"}
        </p>
      )}
    </section>
  );
}

function MyCard({ room, me, result, busy, onSpin, onReplay }) {
  const free = room.phase === "playing" && !room.unified;
  return (
    <section className={`vr-me vr-me-${me.team}`}>
      <div className="vr-me-text">
        <span className="vr-eyebrow">
          {room.phase === "ended" ? "本场最终效果" : `第 ${room.round} 回合 · 我的效果`}
          {" · "}
          {teamName(me.team)}
        </span>
        <strong key={result?.drawId} className="vr-me-effect vr-fx">
          {result?.event.name || "等待抽取"}
        </strong>
        <span className="vr-me-sub">
          {room.phase === "ended"
            ? "本场已结束，可在「战绩·数据」查看特别奖"
            : room.unified
              ? "统一抽取：等待房主 / 裁判操作"
              : room.rerolls[me.id] > 0
                ? `本回合已重抽 ${room.rerolls[me.id]} 次`
                : "自由抽取：可随时重抽"}
        </span>
      </div>
      {result && (
        <MiniWheel
          pool={room.pool}
          result={result}
          onClick={onReplay}
          label="回放轮盘动画"
        />
      )}
      {free && (
        <button
          type="button"
          className="vr-primary vr-me-spin"
          disabled={busy}
          onClick={onSpin}
        >
          {busy ? "正在同步…" : "转动轮盘 · 重新抽取"}
        </button>
      )}
    </section>
  );
}

function Members({ room, me, busy, act, ask }) {
  const host = room.hostId === me.id;
  return (
    <section className="vr-panel vr-o-members">
      <div className="vr-section-title">
        <h2>成员管理</h2>
        <span>{room.members.length} / 13 人</span>
      </div>
      {room.members.map((m) => (
        <details className="vr-member" key={m.id}>
          <summary>
            {m.nickname}
            <span>
              {m.id === room.hostId ? "房主 / " : ""}
              {m.referee ? "裁判" : teamName(m.team)} · {m.online ? "在线" : "离线"}
              {m.id === me.id ? " · 你" : ""}
            </span>
          </summary>
          {host && room.phase === "lobby" && !m.team && m.id !== me.id && (
            <button
              type="button"
              disabled={busy}
              onClick={() => act("referee", { targetId: m.id, enabled: !m.referee })}
            >
              {m.referee ? "取消裁判" : "指定裁判"}
            </button>
          )}
          {host && m.id !== me.id && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                ask({
                  title: "移交房主",
                  action: "transfer",
                  extra: { targetId: m.id },
                  text: `将房主移交给 ${m.nickname}？之后由对方确认回合胜负。`,
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
                type="button"
                disabled={busy}
                onClick={() =>
                  ask({
                    title: "移出房间",
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
                  const recoveryToken = String(
                    new FormData(e.currentTarget).get("recoveryToken") || "",
                  ).trim();
                  ask({
                    title: "协助恢复身份",
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
  );
}

const winnerChoices = (round, score, extra = []) => [
  {
    value: "left",
    label: "左队胜",
    tone: "left",
    note: `比分将变为 左 ${score.left + 1} : ${score.right} 右`,
  },
  {
    value: "right",
    label: "右队胜",
    tone: "right",
    note: `比分将变为 左 ${score.left} : ${score.right + 1} 右`,
  },
  ...extra,
];

export default function ValorantRoom() {
  const [session, setSession] = useState(storedSession);
  const [room, setRoom] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [network, setNetwork] = useState({ ok: false, text: "正在连接" });
  const [hint, setHint] = useState("");
  const [tab, setTab] = useState("game");
  const [confirm, setConfirm] = useState(null);
  const [show, setShow] = useState(null);
  const [seen, setSeen] = useState(readSeen);
  const [lastAngle, setLastAngle] = useState(0);
  const entryToken = useRef(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const hintTimer = useRef(0);
  const accept = (data) =>
    setRoom((old) =>
      !old || old.code !== data.code || data.version >= old.version ? data : old,
    );
  useEffect(() => {
    // Audio can only start after a gesture; any tap on the page unlocks it.
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      clearTimeout(hintTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!session) return;
    let stopped = false;
    let timer;
    let heartbeat = 0;
    let inFlight = false;
    async function sync() {
      if (stopped || inFlight) return;
      clearTimeout(timer);
      if (!document.hidden) {
        inFlight = true;
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
            setNetwork({ ok: true, text: "已连接 · 自动同步" });
          }
        } catch (e) {
          if (!stopped)
            setNetwork({
              ok: false,
              text:
                e.status === 401
                  ? "身份失效，请返回入口恢复"
                  : e.status === 404
                    ? "房间不存在或已过期"
                    : `${e.message || "连接中断"}（正在自动重试）`,
            });
        } finally {
          inFlight = false;
        }
      }
      if (!stopped) timer = setTimeout(sync, 3000);
    }
    // Returning to the tab refreshes at once instead of waiting for the next poll.
    const visibility = () => {
      if (!document.hidden) sync();
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
        entryToken.current = /^[a-f0-9]{64}$/.test(pending || "") ? pending : newToken();
        localStorage.setItem("valorant:pending", entryToken.current);
      }
      const token = mode === "recover" ? recovery : existing || entryToken.current;
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
    if (busyRef.current || !room) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    const current = session;
    try {
      const r = await request(session.token, {
        action,
        code: room.code,
        version: room.version,
        ...(ROUND_SCOPED.has(action) ? { round: room.round, gameId: room.gameId } : {}),
        ...(action === "amend" ? { gameId: room.gameId } : {}),
        ...extra,
      });
      if (sessionRef.current === current) accept(r.data);
      setConfirm(null);
      return true;
    } catch (e) {
      setError(
        e.name === "AbortError" ? "连接超时；请等待同步后再操作，避免重复抽取。" : e.message,
      );
      setConfirm(null);
      try {
        const latest = await request(session.token, null, { code: room.code });
        if (sessionRef.current === current) accept(latest.data);
      } catch {
        /* Retain last confirmed snapshot. */
      }
      return false;
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
    setShow(null);
    setTab("game");
    setHint("");
    window.history.replaceState(null, "", window.location.pathname);
  }
  function flash(text) {
    setHint(text);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(""), 4000);
  }
  async function share() {
    const url = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    try {
      await navigator.clipboard.writeText(url);
      flash("邀请链接已复制，好友仍需填写游戏昵称。");
    } catch {
      flash(`请把房间码告诉好友：${room.code}`);
    }
  }
  const me = room?.members.find((m) => m.id === room.meId);
  const host = !!room && room.hostId === room.meId;
  const result = room?.results.find((r) => r.memberId === room.meId);
  const seenKey = room ? `${room.code}:${room.meId}` : "";
  function markSeen(drawId) {
    if (!drawId || seen[seenKey] === drawId) return;
    const next = { ...seen, [seenKey]: drawId };
    // Keep only recent rooms so storage does not grow without bound.
    const keys = Object.keys(next);
    for (const k of keys.slice(0, Math.max(0, keys.length - 20))) delete next[k];
    setSeen(next);
    try {
      localStorage.setItem("valorant:seen", JSON.stringify(next));
    } catch {
      /* Without storage the show may repeat after a reload. */
    }
  }
  // The spin show is derived: a draw this device has not yet watched, or a
  // replay / personal spin the user started.
  let stage = null;
  if (room && me?.team && room.phase !== "lobby" && room.pool.length) {
    if (show)
      stage = {
        key: show.key,
        target: show.awaiting && result?.drawId === show.from ? null : result || null,
      };
    else if (room.phase === "playing" && result && seen[seenKey] !== result.drawId)
      stage = { key: result.drawId, target: result };
  }
  const lastRound = room?.rounds.at(-1);
  const banner =
    stage?.target && !show && lastRound && stage.target.round === lastRound.round + 1
      ? `R${lastRound.round} ${teamLabel(lastRound.winner)}胜 · 比分 左 ${room.score.left} : ${room.score.right} 右`
      : "";
  async function spin() {
    const key = `spin-${Date.now()}`;
    setShow({ key, awaiting: true, from: result?.drawId });
    const ok = await act("spin");
    if (!ok) setShow((s) => (s?.key === key ? null : s));
  }
  function ask(c) {
    setConfirm(c);
  }
  const decideRound = (winner) =>
    ask({
      title: `确认第 ${room.round} 回合胜负`,
      text: `确认后记录本回合全员效果，进入第 ${room.round + 1} 回合并为所有玩家重新抽取。`,
      action: "nextRound",
      choiceKey: "winner",
      initial: winner,
      choices: winnerChoices(room.round, room.score),
      confirmLabel: `确认 · 进入 R${room.round + 1}`,
    });
  const endGame = () =>
    ask({
      title: "结束本场",
      text: `请先确认最后一回合（R${room.round}）的结果。结束后全部效果与数据向本场成员公开，不能继续抽取。`,
      action: "end",
      choiceKey: "winner",
      choices: winnerChoices(room.round, room.score, [
        {
          value: null,
          label: "未打完，不计入",
          note: `R${room.round} 不计入战绩，最终比分 左 ${room.score.left} : ${room.score.right} 右`,
        },
      ]),
      confirmLabel: "确认结束",
    });
  const amend = (r) =>
    ask({
      title: `修正第 ${r.round} 回合`,
      text: `当前记录为 ${teamLabel(r.winner)}胜。修正会保留在抽取明细中。`,
      action: "amend",
      extra: { round: r.round },
      choiceKey: "winner",
      initial: other(r.winner),
      choices: [
        { value: "left", label: "改为左队胜", tone: "left" },
        { value: "right", label: "改为右队胜", tone: "right" },
      ].filter((c) => c.value !== r.winner),
      confirmLabel: "确认修正",
    });
  const myTeam = me?.team;
  const teamOrder = myTeam ? [myTeam, other(myTeam)] : ["left", "right"];
  return (
    <main className={`vr-app ${room ? "vr-in-room" : ""}`}>
      {!room && (
        <header className="vr-header">
          <Link to="/" className="vr-brand">
            S&S <span>CUP / 无畏契约</span>
          </Link>
        </header>
      )}
      <div className="vr-shell">
        {!room && (
          <section className="vr-intro">
            <div className="vr-eyebrow">VALORANT · 随机事件房间</div>
            <h1>
              <span className="vr-title-name">臭鱼烂虾杯·无畏契约</span>
              <br />
              <span>轮盘工具</span>
            </h1>
            <p>玩法灵感来源于网络，仅供娱乐！</p>
          </section>
        )}
        {error && (
          <div className="vr-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              关闭
            </button>
          </div>
        )}
        {!session ? (
          <Entry onEnter={enter} busy={busy} />
        ) : !room ? (
          <section className="vr-panel">
            <h2>正在恢复房间 {session.code}</h2>
            <p role="status">{network.text}</p>
            <button type="button" onClick={leaveScreen}>
              返回入口
            </button>
          </section>
        ) : (
          <>
            <section className="vr-room-bar">
              <Link to="/" className="vr-room-brand" aria-label="返回 S&S Cup 首页">
                S&S
              </Link>
              <div className="vr-room-code">
                <span className="vr-eyebrow">房间</span>
                <strong>{room.code}</strong>
              </div>
              <div className="vr-room-status">
                <b>
                  {room.phase === "lobby"
                    ? "等待大厅"
                    : room.phase === "playing"
                      ? `第 ${room.gameNumber} 场 · R${room.round}`
                      : `第 ${room.gameNumber} 场 · 已结束`}
                </b>
                {room.phase !== "lobby" ? (
                  <Score score={room.score} compact />
                ) : (
                  <span>{room.members.length} / 13 人</span>
                )}
              </div>
              <span
                className={network.ok ? "vr-dot is-on vr-net" : "vr-dot vr-net"}
                role="status"
                title={network.text}
              >
                <span className="vr-sr">{network.text}</span>
              </span>
              <div className="vr-room-buttons">
                <button type="button" onClick={share}>
                  邀请
                </button>
                <button type="button" onClick={leaveScreen} disabled={busy}>
                  退出
                </button>
              </div>
            </section>
            {!network.ok && <p className="vr-net-warning">{network.text}</p>}
            {hint && (
              <p role="status" className="vr-toast">
                {hint}
              </p>
            )}
            <nav className="vr-tabs vr-room-tabs" aria-label="房间页面">
              <button type="button" aria-pressed={tab === "game"} onClick={() => setTab("game")}>
                对局
              </button>
              <button
                type="button"
                aria-pressed={tab === "history"}
                onClick={() => setTab("history")}
              >
                战绩 · 数据
              </button>
              <button type="button" aria-pressed={tab === "rules"} onClick={() => setTab("rules")}>
                事件池 {room.pool.length}
              </button>
            </nav>
            {tab === "history" ? (
              <Records session={session} room={room} onAmend={amend} />
            ) : tab === "rules" ? (
              <section className="vr-panel">
                <h2>本场事件池</h2>
                <p className="vr-muted">
                  等概率 · 允许重复 · 重新抽取替换原效果。所有约束由玩家在游戏内执行。
                </p>
                <ol className="vr-event-list">
                  {room.pool.map((event) => (
                    <li key={event.id}>{event.name}</li>
                  ))}
                </ol>
              </section>
            ) : (
              <div className="vr-game-grid">
                <div className="vr-main-column">
                  {room.phase === "ended" && (
                    <section className="vr-panel vr-ended vr-o-me">
                      <div>
                        <span className="vr-eyebrow">第 {room.gameNumber} 场已结束</span>
                        <Score score={room.score} />
                      </div>
                      <button type="button" className="vr-primary" onClick={() => setTab("history")}>
                        查看数据与特别奖 →
                      </button>
                    </section>
                  )}
                  {room.phase === "lobby" ? (
                    <section className="vr-panel vr-o-me">
                      <div className="vr-section-title">
                        <h2>选择你的队伍</h2>
                        <span>{room.members.length} / 13 人</span>
                      </div>
                      <p className="vr-muted">
                        每队最多 5 人，允许不等人数开始。开始后锁定名单与队伍。
                      </p>
                      <div className="vr-actions">
                        <button
                          type="button"
                          disabled={busy || me.referee}
                          aria-pressed={me.team === "left"}
                          onClick={() => act("team", { team: "left" })}
                        >
                          加入左队
                        </button>
                        <button
                          type="button"
                          disabled={busy || me.referee}
                          aria-pressed={me.team === "right"}
                          onClick={() => act("team", { team: "right" })}
                        >
                          加入右队
                        </button>
                        <button
                          type="button"
                          disabled={busy || me.referee || !me.team}
                          onClick={() => act("team", { team: null })}
                        >
                          退出队伍
                        </button>
                      </div>
                      {me.referee && (
                        <p className="vr-callout">你是裁判，可查看双方效果，不占参赛席位。</p>
                      )}
                    </section>
                  ) : me.team ? (
                    <div className="vr-o-me">
                      <MyCard
                        room={room}
                        me={me}
                        result={result}
                        busy={busy}
                        onSpin={spin}
                        onReplay={() =>
                          setShow({ key: `replay-${Date.now()}`, awaiting: false })
                        }
                      />
                    </div>
                  ) : (
                    room.phase === "playing" && (
                      <section className="vr-panel vr-o-me vr-referee-card">
                        <h2>裁判总览 · R{room.round}</h2>
                        <p className="vr-muted">
                          双方效果实时显示在下方。
                          {host ? "本回合结束后在「回合结算」确认胜负。" : "回合胜负由房主确认。"}
                        </p>
                      </section>
                    )
                  )}
                  <div className="vr-team-grid">
                    {teamOrder.map((team, i) => (
                      <TeamPanel
                        key={team}
                        room={room}
                        me={me}
                        team={team}
                        mine={team === myTeam}
                        className={i === 0 ? "vr-o-team-a" : "vr-o-team-b"}
                      />
                    ))}
                  </div>
                  {room.phase !== "lobby" && room.rounds.length > 0 && (
                    <section className="vr-panel vr-o-timeline">
                      <div className="vr-section-title">
                        <h2>回合记录</h2>
                        <Score score={room.score} compact />
                      </div>
                      <RoundTimeline
                        rounds={room.rounds}
                        canAmend={host}
                        onAmend={amend}
                        limit={4}
                      />
                    </section>
                  )}
                </div>
                <aside className="vr-side-column">
                  {room.canDecide && (
                    <section className="vr-panel vr-decide vr-o-control">
                      <div className="vr-section-title">
                        <h2>回合结算 · R{room.round}</h2>
                        <Score score={room.score} compact />
                      </div>
                      <p className="vr-muted">本回合打完后，选择胜方并确认，自动进入下一回合。</p>
                      <div className="vr-choice">
                        <button
                          type="button"
                          className="vr-choice-left"
                          disabled={busy}
                          onClick={() => decideRound("left")}
                        >
                          左队胜
                        </button>
                        <button
                          type="button"
                          className="vr-choice-right"
                          disabled={busy}
                          onClick={() => decideRound("right")}
                        >
                          右队胜
                        </button>
                      </div>
                    </section>
                  )}
                  <section className="vr-panel vr-o-manage">
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
                          onChange={(e) => act("settings", { unified: e.target.checked })}
                        />
                        总是由房主统一抽取
                      </label>
                    )}
                    <p className="vr-caption">
                      {me.team
                        ? "你只能查看本队效果，即使你是房主。"
                        : "未参赛房主和指定裁判可查看双方效果。"}
                      {room.phase === "playing" && " 回合胜负由房主确认，比分对所有人公开。"}
                    </p>
                    <div className="vr-stacked">
                      {host && room.phase === "lobby" && (
                        <button
                          type="button"
                          className="vr-primary"
                          disabled={busy}
                          onClick={() =>
                            ask({
                              title: "开始游戏",
                              action: "start",
                              text: "开始后将锁定名单和队伍，并为所有参赛玩家抽取第 1 回合效果。",
                              confirmLabel: "开始",
                            })
                          }
                        >
                          开始游戏
                        </button>
                      )}
                      {room.canManage && room.phase === "playing" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            ask({
                              title: "全员重抽",
                              action: "spinAll",
                              text: "为所有参赛玩家重新抽取，替换当前效果。回合数保持不变。",
                            })
                          }
                        >
                          全员重抽（不换回合）
                        </button>
                      )}
                      {host && room.phase === "playing" && (
                        <button type="button" className="vr-danger" disabled={busy} onClick={endGame}>
                          结束本场
                        </button>
                      )}
                      {room.canManage && room.phase === "ended" && (
                        <button
                          type="button"
                          className="vr-primary"
                          disabled={busy}
                          onClick={() =>
                            ask({
                              title: "返回大厅",
                              action: "reset",
                              text: "本场数据已保存，可在「战绩·数据」中继续查看 30 天。",
                              confirmLabel: "再来一场",
                            })
                          }
                        >
                          返回大厅 · 再来一场
                        </button>
                      )}
                      {room.canTakeover && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            ask({
                              title: "裁判接管",
                              action: "takeover",
                              text: "房主离线已满 60 秒，接管后你将成为新的房主并负责确认回合胜负。",
                            })
                          }
                        >
                          裁判接管房主
                        </button>
                      )}
                    </div>
                  </section>
                  <Members room={room} me={me} busy={busy} act={act} ask={ask} />
                </aside>
              </div>
            )}
            {confirm && (
              <ConfirmDialog
                key={`${confirm.action}:${confirm.title}`}
                confirm={confirm}
                busy={busy}
                onConfirm={act}
                onClose={() => !busy && setConfirm(null)}
              />
            )}
            {stage && (
              <SpinStage
                key={stage.key}
                pool={room.pool}
                target={stage.target}
                startAngle={lastAngle}
                heading={`第 ${stage.target?.round ?? room.round} 回合 · ${me.nickname}`}
                banner={banner}
                teammates={room.results.filter(
                  (x) => x.team === me.team && x.memberId !== me.id,
                )}
                onLanded={(t) => {
                  // Marked as seen on close, so the reveal stays on screen.
                  setLastAngle(restAngle(room.pool, t));
                }}
                onClose={() => {
                  if (result) setLastAngle(restAngle(room.pool, result));
                  markSeen(result?.drawId);
                  setShow(null);
                  // Land on the player's own effect and teammates, wherever
                  // the page was scrolled when the round changed.
                  if (tab === "game") window.scrollTo({ top: 0 });
                }}
              />
            )}
          </>
        )}
        <footer className="vr-footer">本玩法仅供参考，如有雷同，纯属意外</footer>
      </div>
    </main>
  );
}
