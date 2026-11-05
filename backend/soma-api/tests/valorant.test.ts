import { describe, expect, it } from "vitest";
import {
  applyCommand,
  isPistol,
  joinRoom,
  makeRoom,
  nextBalance,
  odds,
  roomView,
  tierWeight,
  visibleLogResults,
  RETENTION_MS,
  type Command,
  type Room,
} from "../lib/valorant-domain.js";
import { EVENTS } from "../lib/valorant-events.js";

const NOW = 1800000000000;
function fixture() {
  const room = makeRoom("ABC234", "房主", "host-secret-hash", NOW);
  const host = room.members[0];
  const enemy = joinRoom(room, "敌人", "enemy-secret-hash", NOW);
  const referee = joinRoom(room, "裁判", "ref-secret-hash", NOW);
  host.team = "left";
  enemy.team = "right";
  referee.referee = true;
  return { room, host, enemy, referee };
}
const command = (
  room: Room,
  id: string,
  cmd: Command,
  now = NOW + 2000,
  pick: (max: number) => number = () => 0,
) =>
  applyCommand(
    room,
    room.members.find((m) => m.id === id)!,
    cmd,
    now,
    NOW,
    pick,
  );

describe("valorant room boundaries", () => {
  it("has 30 unique, editable equally selectable events", () => {
    expect(EVENTS).toHaveLength(27);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(27);
    expect(
      EVENTS.every(
        (event) =>
          ["white", "purple", "gold"].includes(event.tier) &&
          Object.keys(event).every((k) => ["id", "name", "tier", "pistol"].includes(k)),
      ),
    ).toBe(true);
  });
  it("counts all roles toward 13 seats and prevents a fourteenth join", () => {
    const r = makeRoom("ABC234", "host", "host", NOW);
    for (let i = 0; i < 12; i++) joinRoom(r, `p${i}`, `hash${i}`, NOW);
    expect(() => joinRoom(r, "extra", "extra", NOW)).toThrow("最多 13");
    expect(joinRoom(r, "host", "host", NOW).id).toBe(r.hostId);
  });
  it("rejects duplicate nicknames and caps each team at five", () => {
    const { room, host } = fixture();
    expect(() => joinRoom(room, "房主", "other", NOW)).toThrow("昵称");
    for (let i = 0; i < 4; i++)
      joinRoom(room, `p${i}`, `p${i}`, NOW).team = "left";
    const extra = joinRoom(room, "extra", "extra", NOW);
    expect(() =>
      command(room, extra.id, { action: "team", team: "left" }),
    ).toThrow("已满");
    expect(() =>
      command(room, host.id, { action: "team", team: "left" }),
    ).not.toThrow();
  });
  it("allows an uneven game and initially draws once per participant", () => {
    const { room, host } = fixture();
    joinRoom(room, "队友", "ally", NOW).team = "left";
    const log = command(room, host.id, { action: "start" });
    expect(log?.results).toHaveLength(3);
    expect(room.round).toBe(1);
    expect(room.gameNumber).toBe(1);
  });
  it("requires waiting users to choose a team or be assigned as referees", () => {
    const { room, host } = fixture();
    joinRoom(room, "waiting", "waiting", NOW);
    expect(() => command(room, host.id, { action: "start" })).toThrow(
      "等待中的成员",
    );
  });
  it("locks new identities, teams, roles and mode once started but permits returning identity", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "start" });
    expect(() => joinRoom(room, "new", "new", NOW)).toThrow("锁定");
    expect(joinRoom(room, "ignored", enemy.tokenHash, NOW).id).toBe(enemy.id);
    for (const cmd of [
      { action: "team", team: "right" },
      { action: "settings", unified: true },
      { action: "referee", targetId: enemy.id, enabled: true },
    ] as Command[])
      expect(() => command(room, host.id, cmd)).toThrow("锁定");
  });
  it("does not send opponent effects or token hashes to a playing host", () => {
    const { room, host, enemy, referee } = fixture();
    command(room, host.id, { action: "start" });
    const view = roomView(room, host, {}, NOW);
    expect(view.results.map((x) => x.memberId)).toEqual([host.id]);
    expect(JSON.stringify(view)).not.toContain("secret-hash");
    expect(view.results.some((x) => x.memberId === enemy.id)).toBe(false);
    expect(roomView(room, referee, {}, NOW).results).toHaveLength(2);
  });
  it("blocks participant-host recovery of enemy or referee accounts", () => {
    const { room, host, enemy, referee } = fixture();
    command(room, host.id, { action: "start" });
    for (const target of [enemy, referee])
      expect(() =>
        command(room, host.id, {
          action: "recover",
          targetId: target.id,
          recoveryHash: "new",
        }),
      ).toThrow("本队");
  });
  it("free mode allows repeated draws without changing round or hiding history", () => {
    const { room, host } = fixture();
    command(room, host.id, { action: "start" });
    const a = command(room, host.id, { action: "spin" }, NOW + 4000);
    const b = command(room, host.id, { action: "spin" }, NOW + 6000);
    expect(a?._id).not.toBe(b?._id);
    expect(a?.results[0].event.id).toBe(b?.results[0].event.id);
    expect(room.round).toBe(1);
  });
  it("unified mode forbids personal spins including host spins and allows referee batch draws", () => {
    const { room, host, referee } = fixture();
    room.unified = true;
    command(room, host.id, { action: "start" });
    expect(() =>
      command(room, host.id, { action: "spin" }, NOW + 4000),
    ).toThrow("统一抽取");
    expect(
      command(room, referee.id, { action: "spinAll" }, NOW + 4000)?.results,
    ).toHaveLength(2);
  });
  it("rejects unauthorized management and too-fast personal draws", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "start" });
    expect(() => command(room, enemy.id, { action: "spinAll" })).toThrow(
      "房主或裁判",
    );
    expect(() =>
      command(room, host.id, { action: "spin" }, NOW + 2100),
    ).toThrow("太快");
  });
  it("next round redraws every player atomically; redraw alone does not advance the round", () => {
    const { room, host } = fixture();
    command(room, host.id, { action: "start" });
    const id = room.results[0].drawId;
    const log = command(room, host.id, { action: "nextRound", winner: "left" });
    expect(room.round).toBe(2);
    expect(room.results[0].drawId).not.toBe(id);
    expect(log?.results).toHaveLength(2);
    expect(room.results.every((result) => result.round === 2)).toBe(true);
    expect(new Set(room.results.map((result) => result.drawId)).size).toBe(1);
    command(room, host.id, { action: "spinAll" }, NOW + 4000);
    expect(room.round).toBe(2);
    expect(room.results[0].drawId).not.toBe(id);
  });
  it("requires a designated referee and 60 seconds offline to take over", () => {
    const { room, host, enemy, referee } = fixture();
    expect(() =>
      command(room, enemy.id, { action: "takeover" }, NOW + 61000),
    ).toThrow("裁判");
    expect(() =>
      command(room, referee.id, { action: "takeover" }, NOW + 59000),
    ).toThrow("60");
    command(room, referee.id, { action: "takeover" }, NOW + 60000);
    expect(room.hostId).toBe(referee.id);
    expect(host.team).toBe("left");
  });
  it("host transfer never changes team-based visibility", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "transfer", targetId: enemy.id });
    expect(
      roomView(room, enemy, {}, NOW).results.map((x) => x.memberId),
    ).toEqual([enemy.id]);
  });
  it("ends, opens history visibility, and reuses room without reusing game identity", () => {
    const { room, host, referee } = fixture();
    command(room, host.id, { action: "start" });
    const firstGame = room.gameId;
    expect(() =>
      command(room, referee.id, { action: "end" }, NOW + 5000),
    ).toThrow("只有房主");
    const ended = command(room, host.id, { action: "end" }, NOW + 5000);
    expect(ended?.expiresAt.getTime()).toBe(NOW + 5000 + RETENTION_MS);
    expect(roomView(room, host, {}, NOW).results).toHaveLength(2);
    expect(() => command(room, host.id, { action: "spin" })).toThrow(
      "没有进行中",
    );
    command(room, host.id, { action: "reset" });
    expect(room.results).toEqual([]);
    command(room, host.id, { action: "start" });
    expect(room.gameId).not.toBe(firstGame);
    expect(room.gameNumber).toBe(2);
  });
  it("only the host confirms a round, and a winner is required", () => {
    const { room, host, referee } = fixture();
    command(room, host.id, { action: "start" });
    expect(() => command(room, host.id, { action: "nextRound" })).toThrow(
      "胜方",
    );
    expect(() =>
      command(room, referee.id, { action: "nextRound", winner: "left" }),
    ).toThrow("只有房主");
    expect(room.round).toBe(1);
    expect(room.rounds).toEqual([]);
  });
  it("records each round's final effects, rerolls and winner for analysis", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "spin" }, NOW + 4000);
    command(room, host.id, { action: "spin" }, NOW + 6000);
    const log = command(
      room,
      host.id,
      { action: "nextRound", winner: "right" },
      NOW + 8000,
    );
    expect(log?.outcome?.round).toBe(1);
    expect(log?.outcome?.winner).toBe("right");
    expect(room.rounds).toHaveLength(1);
    const effects = room.rounds![0].effects;
    expect(effects.find((x) => x.memberId === host.id)?.rerolls).toBe(2);
    expect(effects.find((x) => x.memberId === enemy.id)?.rerolls).toBe(0);
    expect(effects.every((x) => x.event.id === EVENTS[0].id)).toBe(true);
    expect(room.rerolls).toEqual({});
    command(room, host.id, { action: "end", winner: "left" }, NOW + 9000);
    expect(room.rounds!.map((x) => [x.round, x.winner])).toEqual([
      [1, "right"],
      [2, "left"],
    ]);
    expect(roomView(room, host, {}, NOW).score).toEqual({ left: 1, right: 1 });
  });
  it("reveals every effect of a decided round but keeps the current round secret", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "start" });
    const first = command(room, host.id, { action: "nextRound", winner: "left" });
    const view = roomView(room, enemy, {}, NOW);
    expect(view.rounds[0].winner).toBe("left");
    expect(view.rounds[0].effects.map((x) => x.memberId).sort()).toEqual(
      [host.id, enemy.id].sort(),
    );
    expect(view.results.map((x) => x.memberId)).toEqual([enemy.id]);
    // Round 1 draws are public in the log; the round 2 draws are not yet.
    const round1 = { round: 1, results: room.rounds![0].effects as never };
    expect(visibleLogResults(room, enemy, round1, false)).toHaveLength(2);
    expect(visibleLogResults(room, enemy, first!, false)).toHaveLength(1);
    expect(visibleLogResults(room, enemy, first!, true)).toHaveLength(2);
  });
  it("ending without a winner leaves the abandoned round out of the record", () => {
    const { room, host } = fixture();
    command(room, host.id, { action: "start" });
    const log = command(room, host.id, { action: "end", winner: null });
    expect(log?.outcome).toBeUndefined();
    expect(room.rounds).toEqual([]);
    expect(room.phase).toBe("ended");
  });
  it("lets the host amend a recorded winner, including after the end", () => {
    const { room, host, referee } = fixture();
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "nextRound", winner: "left" });
    expect(() =>
      command(room, referee.id, { action: "amend", round: 1, winner: "right" }),
    ).toThrow("只有房主");
    expect(() =>
      command(room, host.id, { action: "amend", round: 2, winner: "right" }),
    ).toThrow("找不到");
    command(room, host.id, { action: "end" }, NOW + 5000);
    const expiry = room.expiresAt.getTime();
    const log = command(
      room,
      host.id,
      { action: "amend", round: 1, winner: "right" },
      NOW + 9000,
    );
    expect(log?.outcome).toMatchObject({ round: 1, winner: "right", previous: "left" });
    expect(log?.expiresAt.getTime()).toBe(expiry);
    expect(room.expiresAt.getTime()).toBe(expiry);
    expect(room.rounds![0].winner).toBe("right");
    command(room, host.id, { action: "reset" });
    expect(() =>
      command(room, host.id, { action: "amend", round: 1, winner: "left" }),
    ).toThrow("没有可修正");
  });
  it("starts every game with an empty round record", () => {
    const { room, host } = fixture();
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "nextRound", winner: "left" });
    command(room, host.id, { action: "end", winner: "left" });
    command(room, host.id, { action: "reset" });
    command(room, host.id, { action: "start" });
    expect(room.rounds).toEqual([]);
    expect(room.round).toBe(1);
  });
  it("tolerates rooms stored before round records existed", () => {
    const { room, host } = fixture();
    command(room, host.id, { action: "start" });
    delete room.rounds;
    delete room.rerolls;
    expect(roomView(room, host, {}, NOW).rounds).toEqual([]);
    command(room, host.id, { action: "spin" }, NOW + 4000);
    command(room, host.id, { action: "nextRound", winner: "left" }, NOW + 6000);
    expect(room.rounds).toHaveLength(1);
  });
  it("places pistol rounds by mode", () => {
    expect([1, 2, 12, 13, 25].map((x) => isPistol("standard", x))).toEqual([
      true, false, false, true, false,
    ]);
    expect([1, 4, 5, 6, 13].map((x) => isPistol("rapid", x))).toEqual([
      true, false, true, false, false,
    ]);
    expect(isPistol(undefined, 13)).toBe(true);
  });
  it("never draws a non-pistol effect in a pistol round", () => {
    const { room, host } = fixture();
    command(room, host.id, { action: "settings", mode: "rapid" });
    command(room, host.id, { action: "start" });
    room.pool = [
      { id: "gun", name: "只能用狙", tier: "white", pistol: false },
      { id: "ok", name: "全程静步", tier: "white" },
    ];
    command(room, host.id, { action: "spinAll" }, NOW + 4000);
    expect(room.results.every((x) => x.event.id === "ok")).toBe(true);
    for (const t of [6000, 8000, 10000])
      command(room, host.id, { action: "nextRound", winner: "left" }, NOW + t);
    expect(room.round).toBe(4);
    expect(room.results.every((x) => x.event.id === "gun")).toBe(true);
    command(room, host.id, { action: "nextRound", winner: "left" }, NOW + 12000);
    expect(room.round).toBe(5);
    expect(room.results.every((x) => x.event.id === "ok")).toBe(true);
    expect(room.rounds!.map((x) => !!x.pistol)).toEqual([true, false, false, false]);
    expect(roomView(room, host, {}, NOW).pistol).toBe(true);
  });
  it("settings change only the fields sent", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "settings", unified: true });
    command(room, host.id, { action: "settings", mode: "rapid" });
    command(room, host.id, { action: "settings", sanction: true });
    expect([room.unified, room.mode, room.sanction]).toEqual([true, "rapid", true]);
    expect(() =>
      command(room, enemy.id, { action: "settings", mode: "standard" }),
    ).toThrow("只有房主");
    expect(() =>
      command(room, host.id, { action: "settings", mode: "x" as never }),
    ).toThrow("有效模式");
  });
  it("shifts difficulty weights after each draw", () => {
    expect([nextBalance(0, "white"), nextBalance(0, "gold"), nextBalance(0, "purple")]).toEqual([1, -1, 0]);
    expect(nextBalance(3, "white")).toBe(3);
    expect(nextBalance(-2, "purple")).toBe(-1);
    expect(tierWeight("gold", 1)).toBe(1.5);
    expect(tierWeight("white", -2)).toBe(2);
    expect(tierWeight("purple", 3)).toBe(1);
    const pool = EVENTS;
    const even = odds(pool, 0, false);
    const afterWhite = odds(pool, 1, false);
    const afterGold = odds(pool, -1, false);
    expect(afterWhite.gold).toBeGreaterThan(even.gold);
    expect(afterGold.white).toBeGreaterThan(even.white);
    const { room, host } = fixture();
    command(room, host.id, { action: "start" });
    room.pool = [
      { id: "w", name: "白", tier: "white" },
      { id: "g", name: "金", tier: "gold" },
    ];
    // White then the weighted roll: weights are 100 (white) and 150 (gold).
    command(room, host.id, { action: "spin" }, NOW + 4000);
    expect(room.balance![host.id]).toBe(1);
    let total = 0;
    command(room, host.id, { action: "spin" }, NOW + 6000, (max) => {
      total = max;
      return 100;
    });
    expect(total).toBe(250);
    expect(room.results.find((x) => x.memberId === host.id)?.event.id).toBe("g");
    expect(room.balance![host.id]).toBe(0);
    expect(roomView(room, host, {}, NOW).odds).toEqual({ white: 50, purple: 0, gold: 50 });
  });
  it("sanction mode gives the chosen top player two distinct effects for one round", () => {
    const { room, host, enemy, referee } = fixture();
    command(room, host.id, { action: "settings", sanction: true });
    command(room, host.id, { action: "start" });
    expect(room.results.every((x) => !x.extra)).toBe(true);
    expect(() =>
      command(room, host.id, { action: "nextRound", winner: "left", top: referee.id }),
    ).toThrow("参赛玩家");
    command(room, host.id, { action: "nextRound", winner: "left", top: enemy.id });
    expect(room.top).toBe(enemy.id);
    const sanctioned = room.results.find((x) => x.memberId === enemy.id)!;
    expect(sanctioned.extra).toBeDefined();
    expect(sanctioned.extra!.id).not.toBe(sanctioned.event.id);
    expect(room.results.find((x) => x.memberId === host.id)?.extra).toBeUndefined();
    // Redraws keep the double effect for the round.
    command(room, enemy.id, { action: "spin" }, NOW + 5000);
    expect(room.results.find((x) => x.memberId === enemy.id)?.extra).toBeDefined();
    // A referee's suggestion is used when the host does not override it.
    command(room, referee.id, { action: "top", targetId: host.id }, NOW + 6000);
    expect(roomView(room, referee, {}, NOW).nextTop).toBe(host.id);
    expect(roomView(room, enemy, {}, NOW).nextTop).toBeNull();
    command(room, host.id, { action: "nextRound", winner: "right" }, NOW + 7000);
    expect(room.top).toBe(host.id);
    expect(room.nextTop).toBeNull();
    expect(room.rounds!.map((x) => x.top)).toEqual([null, enemy.id]);
    expect(room.rounds![1].effects.find((x) => x.memberId === enemy.id)?.extra).toBeDefined();
    // Choosing nobody leaves the next round without a top player.
    command(room, host.id, { action: "nextRound", winner: "right", top: null }, NOW + 8000);
    expect(room.top).toBeNull();
    expect(room.results.every((x) => !x.extra)).toBe(true);
  });
  it("ignores top picks when sanction mode is off", () => {
    const { room, host, enemy, referee } = fixture();
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "nextRound", winner: "left", top: enemy.id });
    expect(room.top).toBeNull();
    expect(room.results.every((x) => !x.extra)).toBe(true);
    expect(() =>
      command(room, referee.id, { action: "top", targetId: enemy.id }),
    ).toThrow("未开启");
  });
  it("resets modes' per-game state on a new game", () => {
    const { room, host, enemy } = fixture();
    command(room, host.id, { action: "settings", sanction: true });
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "nextRound", winner: "left", top: enemy.id });
    command(room, host.id, { action: "end", winner: "left" });
    command(room, host.id, { action: "reset" });
    command(room, host.id, { action: "start" });
    expect([room.top, room.nextTop]).toEqual([null, null]);
    expect(Object.keys(room.balance!).length).toBe(2);
    expect(room.results.every((x) => !x.extra)).toBe(true);
  });
});
