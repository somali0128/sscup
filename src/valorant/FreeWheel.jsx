import { useEffect, useState } from "react";
import { newToken, request } from "./api";
import { TIERS, nextBalance, odds, tierClass, weightedPick } from "./tiers";
import { EffectName, MiniWheel, SpinStage } from "./Wheel";
import { restAngle } from "./wheel-utils";

const CACHE = "valorant:pool";

function cachedPool() {
  try {
    const events = JSON.parse(localStorage.getItem(CACHE) || "null")?.events;
    return Array.isArray(events) && events.length ? events : null;
  } catch {
    return null;
  }
}

// Room-free wheel: draws locally with the same difficulty weighting as rooms,
// no teammates, no history. The event pool comes from the server (cached).
export default function FreeWheel({ onExit }) {
  const [pool, setPool] = useState(cachedPool);
  const [error, setError] = useState("");
  const [pistol, setPistol] = useState(false);
  const [double, setDouble] = useState(false);
  const [balance, setBalance] = useState(0);
  const [result, setResult] = useState(null);
  const [showing, setShowing] = useState(false);
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let cancelled = false;
    request(newToken(), null, { view: "pool" })
      .then((r) => {
        if (cancelled) return;
        setPool(r.data.events);
        try {
          localStorage.setItem(CACHE, JSON.stringify(r.data));
        } catch {
          /* Cache is optional. */
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  function spin() {
    let b = balance;
    const event = weightedPick(pool, b, pistol);
    b = nextBalance(b, event.tier);
    let extra;
    if (double) {
      extra = weightedPick(pool, b, pistol, [event.id]);
      b = nextBalance(b, extra.tier);
    }
    setBalance(b);
    setResult({ event, ...(extra ? { extra } : {}), drawId: crypto.randomUUID() });
    setShowing(true);
  }
  const chance = pool ? odds(pool, balance, pistol) : null;
  return (
    <section className="vr-panel vr-free">
      <div className="vr-section-title">
        <h2>自由转盘</h2>
        <button type="button" className="vr-mini-button" onClick={onExit}>
          返回房间入口
        </button>
      </div>
      <p className="vr-muted">不需要房间，自己转着玩。没有队友、比分和历史记录，刷新页面即清空。</p>
      {error && !pool && (
        <p role="alert" className="vr-error">
          事件池加载失败：{error}
        </p>
      )}
      {!pool ? (
        !error && <p role="status">正在加载事件池…</p>
      ) : (
        <>
          <div className={`vr-me vr-free-card ${result ? tierClass(result.extra || result.event) : ""}`}>
            <div className="vr-me-text">
              <span className="vr-eyebrow">{result ? "本次效果" : "准备好了吗"}</span>
              <strong key={result?.drawId} className={`vr-me-effect vr-fx ${result?.extra ? "is-double" : ""}`}>
                {result ? (
                  [result.event, result.extra]
                    .filter(Boolean)
                    .map((e) => <EffectName key={e.id} event={e} />)
                ) : (
                  "点下方按钮转动轮盘"
                )}
              </strong>
              <span className="vr-odds" title="下一次抽取各难度的概率">
                下次：
                {Object.keys(TIERS).map((t) => (
                  <i key={t} className={`vr-tier-${t}`}>
                    {TIERS[t].label} {chance[t]}%
                  </i>
                ))}
              </span>
            </div>
            {result && (
              <MiniWheel
                pool={pool}
                result={result}
                onClick={() => setShowing(true)}
                label="回放轮盘动画"
              />
            )}
            <button type="button" className="vr-primary vr-me-spin" onClick={spin}>
              {result ? "再转一次" : "转动轮盘"}
            </button>
          </div>
          <div className="vr-free-options">
            <label className="vr-checkbox">
              <input type="checkbox" checked={pistol} onChange={(e) => setPistol(e.target.checked)} />
              手枪局（不抽需要买枪的效果）
            </label>
            <label className="vr-checkbox">
              <input type="checkbox" checked={double} onChange={(e) => setDouble(e.target.checked)} />
              双效果（体验榜一制裁）
            </label>
          </div>
        </>
      )}
      {showing && result && (
        <SpinStage
          key={result.drawId}
          pool={pool}
          target={result}
          startAngle={angle}
          heading="自由转盘"
          banner=""
          teammates={[]}
          onLanded={(t) => setAngle(restAngle(pool, t))}
          onClose={() => {
            setAngle(restAngle(pool, result));
            setShowing(false);
            window.scrollTo({ top: 0 });
          }}
        />
      )}
    </section>
  );
}
