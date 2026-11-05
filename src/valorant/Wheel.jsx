import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mod, point, restAngle, soundEnabled, tone, unlockAudio } from "./wheel-utils";

const COLORS = ["#fd5d68", "#1f3845", "#33525f"];
const CRUISE = 0.9; // degrees per millisecond at full speed
const ACCEL_MS = 520;
const LAND_TRAVEL = 1080; // minimum degrees covered while slowing down

export function WheelFace({ pool, hit = -1, labels = true }) {
  const n = pool.length || 1;
  const seg = 360 / n;
  const longest = Math.max(...pool.map((x) => [...x.name].length), 1);
  const size = Math.min(13, 128 / longest);
  return (
    <svg viewBox="0 0 400 400" className="vr-wheel-svg" aria-hidden="true">
      <circle cx="200" cy="200" r="199" className="vr-wheel-rim" />
      {pool.map((item, i) => (
        <path
          key={item.id}
          d={`M200 200 L${point(186, i * seg)} A186 186 0 ${seg > 180 ? 1 : 0} 1 ${point(186, (i + 1) * seg)} Z`}
          fill={COLORS[n % 3 === 1 && i === n - 1 ? 1 : i % 3]}
          className={i === hit ? "vr-wedge vr-wedge-hit" : "vr-wedge"}
        />
      ))}
      {labels &&
        pool.map((item, i) => (
          <text
            key={item.id}
            x="376"
            y="200"
            textAnchor="end"
            dominantBaseline="central"
            fontSize={size}
            className={i === hit ? "vr-label-hit" : undefined}
            transform={`rotate(${(i + 0.5) * seg - 90} 200 200)`}
          >
            {item.name}
          </text>
        ))}
      {pool.map((item, i) => (
        <circle
          key={item.id}
          className="vr-bulb"
          r="3.2"
          cx={200 + 192.5 * Math.sin((i * seg * Math.PI) / 180)}
          cy={200 - 192.5 * Math.cos((i * seg * Math.PI) / 180)}
        />
      ))}
    </svg>
  );
}

// Static wheel showing the current result under the pointer.
export function MiniWheel({ pool, result, onClick, label }) {
  return (
    <button type="button" className="vr-mini-wheel" onClick={onClick} aria-label={label}>
      <span className="vr-mini-pointer" />
      <span
        className="vr-mini-face"
        style={{ transform: `rotate(${restAngle(pool, result)}deg)` }}
      >
        <WheelFace pool={pool} labels={false} />
      </span>
    </button>
  );
}

/**
 * Full-screen spin show. `target` is the result to land on; while it is null
 * (a personal draw still in flight) the wheel keeps cruising.
 */
export function SpinStage({
  pool,
  target,
  startAngle,
  heading,
  banner,
  teammates,
  onLanded,
  onClose,
}) {
  const wheelRef = useRef(null);
  const pointerRef = useRef(null);
  const closeRef = useRef(null);
  const motion = useRef(null);
  const [landedId, setLandedId] = useState(null);
  const landed = !!target && landedId === target.drawId;
  const [sound, setSound] = useState(soundEnabled);
  const soundRef = useRef(sound);
  const callbacks = useRef({ onLanded, onClose });
  const [initialAngle] = useState(startAngle);
  useLayoutEffect(() => {
    soundRef.current = sound;
    callbacks.current = { onLanded, onClose };
  });
  const n = pool.length || 1;
  const seg = 360 / n;
  const hit = target
    ? pool.findIndex((x) => x.id === target.event.id)
    : -1;

  // Animation state lives in a ref; React only re-renders on landing.
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const m = (motion.current ||= {
      angle: initialAngle,
      v: 0,
      mode: "accel",
      kick: 0,
      lastTick: 0,
      segment: null,
      plan: null,
      target: null,
      frame: 0,
      last: 0,
    });
    m.target = target;
    m.reduced = reduced;
    if (target && (m.mode === "decel" || m.mode === "landed")) {
      // A newer draw arrived mid-show: spin up again toward the new result.
      m.mode = "accel";
      m.plan = null;
    }
    const paint = () => {
      if (wheelRef.current)
        wheelRef.current.style.transform = `rotate(${m.angle}deg)`;
      if (pointerRef.current)
        pointerRef.current.style.transform = `rotate(${-26 * m.kick}deg)`;
    };
    const land = () => {
      m.mode = "landed";
      m.v = 0;
      m.angle = restAngle(pool, m.target);
      paint();
      setLandedId(m.target.drawId);
      if (soundRef.current) {
        tone(784, 0.5, 0.07, "sine");
        tone(1175, 0.7, 0.06, "sine", 0.09);
        tone(1568, 0.8, 0.04, "sine", 0.18);
      }
      navigator.vibrate?.([24, 40, 60]);
      callbacks.current.onLanded?.(m.target);
    };
    m.skip = () => {
      if (m.target && m.mode !== "landed") land();
    };
    if (reduced) {
      // No spin; reveal on the next frame so state updates stay out of the effect.
      if (target) m.frame = requestAnimationFrame(land);
      return () => cancelAnimationFrame(m.frame);
    }
    const planLanding = (now) => {
      const final = restAngle(pool, m.target);
      const delta = mod(final - m.angle, 360);
      const travel =
        delta + 360 * Math.max(0, Math.ceil((LAND_TRAVEL - delta) / 360));
      // Ease-out cubic starting at cruise speed keeps the motion continuous.
      m.plan = {
        from: m.angle,
        travel,
        start: now,
        duration: Math.min((3 * travel) / CRUISE, 5200),
      };
      m.mode = "decel";
    };
    const step = (now) => {
      if (m.mode === "landed") return;
      const dt = Math.min(now - (m.last || now), 48);
      m.last = now;
      const before = m.angle;
      if (m.mode === "accel") {
        m.v = Math.min(CRUISE, m.v + (CRUISE * dt) / ACCEL_MS);
        m.angle += m.v * dt;
        if (m.v >= CRUISE) m.mode = "cruise";
      } else if (m.mode === "cruise") {
        m.angle += m.v * dt;
      }
      if (m.mode === "cruise" && m.target) planLanding(now);
      if (m.mode === "decel") {
        const u = Math.min(1, (now - m.plan.start) / m.plan.duration);
        const eased = 1 - (1 - u) ** 3;
        m.angle = m.plan.from + m.plan.travel * eased;
        m.v = Math.max(0, m.angle - before) / Math.max(dt, 1);
        if (u >= 1) {
          land();
          return;
        }
      }
      // Pointer flicks and clicks whenever a wedge boundary passes it.
      const segment = Math.floor(mod(-m.angle, 360) / seg);
      if (m.segment !== null && segment !== m.segment) {
        m.kick = 1;
        if (soundRef.current && now - m.lastTick > 42) {
          m.lastTick = now;
          tone(1500, 0.035, 0.035 + 0.04 * Math.min(1, 0.25 / (m.v + 0.01)));
        }
      }
      m.segment = segment;
      m.kick *= Math.pow(0.84, dt / 16);
      paint();
      m.frame = requestAnimationFrame(step);
    };
    if (m.mode !== "landed") {
      m.last = 0;
      m.frame = requestAnimationFrame(step);
    } else paint();
    return () => cancelAnimationFrame(m.frame);
    // The show is keyed by the parent; only a new target restarts motion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.drawId]);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const key = (e) => {
      if (e.key === "Escape") callbacks.current.onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", key);
    };
  }, []);

  useEffect(() => {
    if (!landed) return undefined;
    const timer = setTimeout(() => callbacks.current.onClose(), 4200);
    return () => clearTimeout(timer);
  }, [landed]);

  const tap = () => {
    if (landed) callbacks.current.onClose();
    else motion.current?.skip?.();
  };
  return (
    <div
      className={`vr-stage ${landed ? "is-landed" : "is-spinning"}`}
      role="dialog"
      aria-modal="true"
      aria-label="轮盘抽取"
      onClick={tap}
    >
      <div className="vr-stage-inner">
        <div className="vr-stage-top">
          <span className="vr-eyebrow">{heading}</span>
          <button
            type="button"
            className="vr-sound"
            aria-pressed={sound}
            onClick={(e) => {
              e.stopPropagation();
              unlockAudio();
              try {
                localStorage.setItem("valorant:sound", sound ? "0" : "1");
              } catch {
                /* Preference is optional. */
              }
              setSound(!sound);
            }}
          >
            {sound ? "音效 开" : "音效 关"}
          </button>
        </div>
        {banner && <p className="vr-stage-banner">{banner}</p>}
        <div className="vr-stage-wheel">
          <div className="vr-burst" aria-hidden="true" />
          <div className="vr-stage-pointer" ref={pointerRef} aria-hidden="true" />
          <div
            className="vr-stage-face"
            ref={wheelRef}
            style={{ transform: `rotate(${initialAngle}deg)` }}
          >
            <WheelFace pool={pool} hit={landed ? hit : -1} />
          </div>
          <div className="vr-stage-hub" aria-hidden="true">
            S&S
          </div>
        </div>
        <div className="vr-stage-result" aria-live="assertive">
          {landed && target ? (
            <>
              <span>你的效果</span>
              <strong key={target.drawId}>{target.event.name}</strong>
            </>
          ) : (
            <span className="vr-stage-rolling">
              {target ? "命运正在减速…" : "命运转动中…"}
            </span>
          )}
        </div>
        {landed && teammates.length > 0 && (
          <ul className="vr-stage-team" aria-label="队友效果">
            {teammates.map((x) => (
              <li key={x.memberId}>
                <span>{x.nickname}</span>
                <b>{x.event.name}</b>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          ref={closeRef}
          className="vr-stage-close"
          onClick={(e) => {
            e.stopPropagation();
            tap();
          }}
        >
          {landed ? "收下效果" : target ? "跳过动画" : "抽取中…"}
        </button>
        {landed && <div className="vr-stage-timer" aria-hidden="true" />}
      </div>
    </div>
  );
}
