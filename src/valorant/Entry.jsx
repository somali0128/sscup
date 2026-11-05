import { useEffect, useState } from "react";
import { ENDPOINT, newToken } from "./api";

export default function Entry({ onEnter, busy, onFree }) {
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
      <button type="button" className="vr-free-entry" onClick={onFree}>
        <b>不开房间，自由转盘 →</b>
        <span>自己转着玩，没有队友和历史记录</span>
      </button>
      <div className="vr-entry-notes">
        <span>01 / 游戏昵称入场</span>
        <span>02 / 选队后开始</span>
        <span>03 / 每回合随机玩法</span>
      </div>
    </section>
  );
}
