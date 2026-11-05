import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHash } from "node:crypto";
const url = "http://127.0.0.1:4318/api/valorant";
const token = () => randomBytes(32).toString("hex");
const host = token(),
  enemy = token(),
  ref = token();
let code;
async function post(auth, action, data = {}, expected = 200) {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth}`,
      "Content-Type": "application/json",
      "x-forwarded-for": "integration-suite",
    },
    body: JSON.stringify({ action, code, requestId: randomUUID(), ...data }),
  });
  const b = await r.json();
  assert.equal(r.status, expected, JSON.stringify(b));
  return b.data;
}
async function get(auth, extra = {}, expected = 200) {
  const r = await fetch(`${url}?${new URLSearchParams({ code, ...extra })}`, {
    headers: { Authorization: `Bearer ${auth}` },
  });
  const b = await r.json();
  assert.equal(r.status, expected, JSON.stringify(b));
  return b;
}
let room = await post(host, "create", {
  nickname: "API房主",
  password: process.env.VALORANT_CREATE_PASSWORD,
});
code = room.code;
assert.equal(
  (
    await post(host, "create", {
      nickname: "API房主",
      password: process.env.VALORANT_CREATE_PASSWORD,
    })
  ).code,
  code,
);
await post(enemy, "join", { nickname: "API敌人" });
await post(ref, "join", { nickname: "API裁判" });
room = (await get(host)).data;
const hostId = room.meId,
  enemyId = room.members.find((m) => m.nickname === "API敌人").id,
  refId = room.members.find((m) => m.nickname === "API裁判").id;
room = await post(host, "team", { team: "left", version: room.version });
room = await post(enemy, "team", { team: "right", version: room.version });
room = await post(host, "referee", {
  targetId: refId,
  enabled: true,
  version: room.version,
});
room = await post(host, "start", { version: room.version });
const gameId = room.gameId;
assert.equal(room.results.length, 1);
assert.equal(room.results[0].memberId, hostId);
assert.equal((await get(enemy)).data.results[0].memberId, enemyId);
assert.equal((await get(ref)).data.results.length, 2);
assert(!JSON.stringify(room).includes("tokenHash"));
await post(token(), "join", { nickname: "迟到" }, 409);
await post(host, "team", { team: "right", version: room.version }, 409);
await post(enemy, "spinAll", { version: room.version }, 403);
const commandId = randomUUID();
const batchVersion = room.version;
room = await post(ref, "spinAll", {
  version: batchVersion,
  requestId: commandId,
});
const same = await post(ref, "spinAll", {
  version: batchVersion,
  requestId: commandId,
});
assert.equal(same.version, room.version);
assert.equal(new Set(room.results.map((r) => r.drawId)).size, 1);
await post(ref, "nextRound", { winner: "left", version: room.version }, 403);
await post(host, "nextRound", { version: room.version }, 400);
// Another player's redraw must not reject the host's round confirmation.
const roundRef = { round: room.round, gameId: room.gameId };
await new Promise((resolve) => setTimeout(resolve, 1100)); // personal draw cooldown
await post(enemy, "spin", { ...roundRef, version: room.version });
room = await post(host, "nextRound", {
  winner: "right",
  ...roundRef,
  version: room.version,
});
assert.equal(room.round, 2);
assert.deepEqual(room.score, { left: 0, right: 1 });
assert.equal(room.rounds[0].effects.length, 1);
await post(host, "nextRound", { winner: "left", ...roundRef, version: room.version }, 409);
const history = (await get(host, { view: "history", gameId })).data;
assert(history.every((log) => log.results.every((r) => r.memberId === hostId)));
await post(
  host,
  "recover",
  { targetId: enemyId, recoveryToken: token(), version: room.version },
  403,
);
const recovered = token();
room = await post(ref, "recover", {
  targetId: enemyId,
  recoveryToken: createHash("sha256").update(recovered).digest("hex"),
  version: room.version,
});
await get(enemy, {}, 401);
assert.equal((await get(recovered)).data.meId, enemyId);
room = await post(host, "end", {
  winner: "left",
  round: room.round,
  gameId: room.gameId,
  version: room.version,
});
room = await post(host, "amend", {
  round: 1,
  winner: "left",
  gameId: room.gameId,
  version: room.version,
});
const summary = (await get(recovered, { view: "summary", gameId })).data;
assert.deepEqual(summary.score, { left: 2, right: 0 });
assert.equal(summary.rounds[0].effects.length, 2);
const ended = (await get(host, { view: "history", gameId })).data;
assert(ended.some((log) => log.results.some((r) => r.memberId === enemyId)));
const games = (await get(host, { view: "games" })).data;
assert(
  Math.abs(
    new Date(games[0].expiresAt).getTime() - games[0].endedAt - 30 * 86400000,
  ) < 10,
);
room = await post(host, "reset", { version: room.version });
room = await post(host, "settings", { unified: true, version: room.version });
room = await post(host, "start", { version: room.version });
assert.notEqual(room.gameId, gameId);
assert.equal(room.gameNumber, 2);
await post(host, "spin", { version: room.version }, 403);
console.log(
  "API integration passed: authentication, separate views, lock, transaction/idempotency, stale commands, recovery, public history, 30-day expiry and room reuse.",
);
