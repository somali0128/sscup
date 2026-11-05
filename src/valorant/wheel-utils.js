// Wheel geometry and sound helpers shared by the spin show and mini wheel.
export const mod = (a, n) => ((a % n) + n) % n;
export const point = (r, deg) => {
  const rad = (deg * Math.PI) / 180;
  return `${(200 + r * Math.sin(rad)).toFixed(2)} ${(200 - r * Math.cos(rad)).toFixed(2)}`;
};
// Stable pseudo-random offset per draw so the pointer never lands dead centre,
// and every device shows the same stop position for the same draw.
function jitter(seed) {
  let h = 2166136261;
  for (const ch of seed || "") h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return ((h >>> 0) / 4294967295 - 0.5) * 0.62;
}
export function restAngle(pool, result) {
  const n = pool.length || 1;
  const index = Math.max(
    0,
    pool.findIndex((x) => x.id === result?.event.id),
  );
  return mod(-(index + 0.5 + jitter(result?.drawId)) * (360 / n), 360);
}

let audioContext;
function audio() {
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext ||= new Ctor();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  } catch {
    return null;
  }
}
// Browsers only allow audio after a user gesture; call this from one.
export const unlockAudio = () => audio();
export function tone(freq, length, volume, type = "triangle", delay = 0) {
  const c = audioContext;
  if (!c || c.state !== "running") return;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}
export function soundEnabled() {
  try {
    return localStorage.getItem("valorant:sound") !== "0";
  } catch {
    return true;
  }
}
