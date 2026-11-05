import { useEffect, useState } from "react";
import { actionNames, downloadHistory, request, teamLabel } from "./api";
import { computeStats } from "./stats";
import { EffectName } from "./Wheel";
import { effectsOf } from "./wheel-utils";

const date = (at) => new Date(at).toLocaleString("zh-CN", { hour12: false });

async function loadAll(session, gameId) {
  const query = { code: session.code, gameId };
  const [summary, records] = await Promise.all([
    request(session.token, null, { ...query, view: "summary" }).then((r) => r.data),
    (async () => {
      const all = [];
      let after = 0;
      do {
        const r = await request(session.token, null, {
          ...query,
          view: "history",
          after,
        });
        all.push(...r.data);
        after = r.next;
      } while (after !== null && after !== undefined);
      return all;
    })(),
  ]);
  return { summary, records };
}

export function Score({ score, compact = false }) {
  return (
    <span className={`vr-score ${compact ? "vr-score-compact" : ""}`}>
      <span className="vr-left">左 {score.left}</span>
      <span aria-hidden="true">:</span>
      <span className="vr-right">{score.right} 右</span>
    </span>
  );
}

export function RoundTimeline({ rounds, canAmend, onAmend, limit }) {
  const topName = (r) => r.top && r.effects.find((x) => x.memberId === r.top)?.nickname;
  const list = [...rounds].sort((a, b) => b.round - a.round);
  const shown = limit ? list.slice(0, limit) : list;
  let left = 0;
  let right = 0;
  const running = new Map(
    [...rounds]
      .sort((a, b) => a.round - b.round)
      .map((r) => {
        if (r.winner === "left") left++;
        if (r.winner === "right") right++;
        return [r.round, `${left}:${right}`];
      }),
  );
  if (!list.length) return <p className="vr-muted">还没有已确认的回合。</p>;
  return (
    <ol className="vr-timeline">
      {shown.map((r) => (
        <li key={r.round} className={`vr-tl-${r.winner || "none"}`}>
          <div className="vr-tl-head">
            <strong>R{r.round}</strong>
            <span className="vr-tl-winner">
              {r.winner ? `${teamLabel(r.winner)}胜` : "未记录"}
            </span>
            <span className="vr-muted">{running.get(r.round)}</span>
            {r.pistol && <span className="vr-tag vr-tag-pistol">手枪局</span>}
            {topName(r) && <span className="vr-tag vr-tag-top">👑 {topName(r)}</span>}
            {r.amendedAt && <span className="vr-tag">已修正</span>}
            {canAmend && r.winner && (
              <button
                type="button"
                className="vr-mini-button"
                onClick={() => onAmend(r)}
              >
                修正
              </button>
            )}
          </div>
          {r.effects.length > 0 && (
            <ul className="vr-tl-effects">
              {r.effects.map((x) => (
                <li
                  key={x.memberId}
                  className={x.team === r.winner ? "is-win" : undefined}
                >
                  <span>{x.nickname}</span>
                  {effectsOf(x).map((e) => (
                    <EffectName key={e.id} event={e} small />
                  ))}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
      {limit && list.length > limit && (
        <li className="vr-muted vr-tl-more">
          另有 {list.length - limit} 回合，在「战绩·数据」中查看。
        </li>
      )}
    </ol>
  );
}

function Analysis({ stats, ended }) {
  if (!stats.rounds)
    return (
      <p className="vr-callout">
        本场还没有房主确认的回合胜负，暂无数据分析。
      </p>
    );
  return (
    <>
      <div className="vr-scoreboard">
        <div>
          <span className="vr-eyebrow">
            {ended ? "最终比分" : "当前比分"} · {stats.rounds} 回合
          </span>
          <Score score={stats.score} />
        </div>
        <strong className={`vr-${stats.winner || "draw"}`}>
          {stats.winner
            ? `${teamLabel(stats.winner)}${ended ? "获胜" : "领先"}`
            : "平局"}
        </strong>
      </div>
      {stats.awards.length > 0 && (
        <>
          <h3 className="vr-subhead">特别奖</h3>
          <div className="vr-awards">
            {stats.awards.map((a) => (
              <article key={a.id}>
                <span className="vr-award-icon" aria-hidden="true">
                  {a.icon}
                </span>
                <div>
                  <small>{a.title}</small>
                  <strong>{a.winners}</strong>
                  <p>{a.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <h3 className="vr-subhead">玩家数据</h3>
      <div className="vr-table-wrap">
        <table className="vr-table">
          <thead>
            <tr>
              <th scope="col">玩家</th>
              <th scope="col">胜/回合</th>
              <th scope="col">胜率</th>
              <th scope="col">重抽</th>
              <th scope="col" title="白 / 紫 / 金">难度</th>
            </tr>
          </thead>
          <tbody>
            {stats.players.map((p) => (
              <tr key={p.memberId}>
                <th scope="row" className={`vr-${p.team}`}>
                  {p.nickname}
                </th>
                <td>
                  {p.wins}/{p.rounds}
                </td>
                <td>{p.winRate}%</td>
                <td>{p.rerolls}</td>
                <td className="vr-tier-mix">
                  <i className="vr-tier-white">{p.tiers.white}</i>/
                  <i className="vr-tier-purple">{p.tiers.purple}</i>/
                  <i className="vr-tier-gold">{p.tiers.gold}</i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="vr-subhead">效果胜率</h3>
      {(stats.luckiest.length > 0 || stats.toughest.length > 0) && (
        <p className="vr-muted vr-event-notes">
          {stats.luckiest.length > 0 &&
            `最旺效果：${stats.luckiest.map((e) => `「${e.name}」`).join("")} 胜率 ${stats.luckiest[0].winRate}%。`}
          {stats.toughest.length > 0 &&
            ` 最坑效果：${stats.toughest.map((e) => `「${e.name}」`).join("")} 胜率 ${stats.toughest[0].winRate}%。`}
        </p>
      )}
      <ul className="vr-bars">
        {stats.events.map((e) => (
          <li key={e.id}>
            <EffectName event={e} small />
            <span className="vr-bar" aria-hidden="true">
              <i style={{ width: `${e.winRate}%` }} />
            </span>
            <b>
              {e.wins}/{e.appearances}
            </b>
          </li>
        ))}
      </ul>
      {!ended && (
        <p className="vr-caption">
          统计已确认胜负的回合；进行中的回合不计入。
        </p>
      )}
    </>
  );
}

export default function Records({ session, room, onAmend }) {
  const [games, setGames] = useState(null);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState({ key: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    request(session.token, null, { code: session.code, view: "games" })
      .then((r) => !cancelled && setGames(r.data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [session, room.gameNumber, room.phase]);
  const game = games?.find((g) => g.id === selected) || games?.[0];
  const live = game && game.id === room.gameId && room.phase !== "lobby";
  // Reload the live game whenever the room changes; past games are immutable.
  const key = game ? `${game.id}:${live ? room.version : "final"}` : "";
  useEffect(() => {
    if (!game) return undefined;
    let cancelled = false;
    loadAll(session, game.id)
      .then((r) => !cancelled && setData({ key, ...r }))
      .catch((e) => !cancelled && setData({ key, error: e.message }));
    return () => {
      cancelled = true;
    };
    // `key` captures game identity and live version.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, key]);
  const current = data.key === key ? data : null;
  // Keep showing the previous snapshot of the same game while refreshing.
  const shown =
    current ||
    (data.summary && data.key.startsWith(`${game?.id}:`) ? data : null);
  const ended = !!(shown?.summary?.endedAt || game?.endedAt);
  const stats = shown?.summary
    ? computeStats(shown.summary, shown.records)
    : null;
  function download(kind) {
    setBusy(true);
    try {
      downloadHistory(
        {
          code: room.code,
          game: {
            id: game.id,
            number: game.number,
            startedAt: shown.summary.startedAt,
            endedAt: shown.summary.endedAt,
            members: shown.summary.members,
          },
          rounds: shown.summary.rounds,
          records: shown.records,
          stats,
        },
        kind,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="vr-panel vr-records">
      <div className="vr-section-title">
        <h2>战绩 · 数据</h2>
        {game && <span>保留至 {date(game.expiresAt).split(" ")[0]}</span>}
      </div>
      {error && (
        <p role="alert" className="vr-error">
          {error}
        </p>
      )}
      {!games ? (
        <p role="status">正在加载场次…</p>
      ) : !games.length ? (
        <p className="vr-muted">暂无可查看的场次。开始一场后会自动记录。</p>
      ) : (
        <>
          {games.length > 1 && (
            <label>
              选择场次
              <select
                value={game.id}
                onChange={(e) => setSelected(e.target.value)}
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    第 {g.number} 场 · {g.endedAt ? "已结束" : "进行中"} ·{" "}
                    {date(g.startedAt)}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!shown && !current?.error && <p role="status">正在加载数据…</p>}
          {current?.error && (
            <p role="alert" className="vr-error">
              {current.error}
            </p>
          )}
          {stats && <Analysis stats={stats} ended={ended} />}
          {shown?.summary && (
            <>
              <h3 className="vr-subhead">回合记录</h3>
              <RoundTimeline
                rounds={shown.summary.rounds}
                canAmend={
                  live && room.hostId === room.meId && game.id === room.gameId
                }
                onAmend={onAmend}
              />
              <h3 className="vr-subhead">导出数据</h3>
              <div className="vr-actions">
                <button
                  type="button"
                  disabled={busy || !ended}
                  onClick={() => download("rounds")}
                >
                  回合战绩 CSV
                </button>
                <button
                  type="button"
                  disabled={busy || !ended}
                  onClick={() => download("draws")}
                >
                  抽取明细 CSV
                </button>
                <button
                  type="button"
                  disabled={busy || !ended}
                  onClick={() => download("json")}
                >
                  完整 JSON
                </button>
              </div>
              {!ended && (
                <p className="vr-caption">结束本场后可下载全部数据。</p>
              )}
              <details className="vr-log">
                <summary>抽取明细 · {shown.records.length} 条</summary>
                <ol>
                  {[...shown.records].reverse().map((row) => (
                    <li key={row.id}>
                      <div className="vr-history-heading">
                        <strong>
                          R{row.round} · {actionNames[row.action] || row.action}
                        </strong>
                        <time>{date(row.at)}</time>
                      </div>
                      <p className="vr-muted">
                        操作人：{row.actor}
                        {row.outcome &&
                          ` · R${row.outcome.round} ${
                            teamLabel(row.outcome.winner) || "未记录"
                          }胜${
                            row.outcome.previous
                              ? `（原为${teamLabel(row.outcome.previous)}胜）`
                              : ""
                          }`}
                      </p>
                      {row.results.map((result) => (
                        <p key={result.memberId}>
                          <b>{result.nickname}</b> / {teamLabel(result.team)}：
                          {effectsOf(result).map((e) => (
                            <EffectName key={e.id} event={e} small />
                          ))}
                        </p>
                      ))}
                    </li>
                  ))}
                </ol>
              </details>
            </>
          )}
        </>
      )}
    </section>
  );
}
