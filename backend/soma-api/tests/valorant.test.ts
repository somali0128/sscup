import { describe, expect, it } from "vitest";
import {
  applyCommand,
  joinRoom,
  makeRoom,
  roomView,
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
const command = (room: Room, id: string, cmd: Command, now = NOW + 2000) =>
  applyCommand(
    room,
    room.members.find((m) => m.id === id)!,
    cmd,
    now,
    NOW,
    () => 0,
  );

describe("valorant room boundaries", () => {
  it("has 30 unique, editable equally selectable events", () => {
    expect(EVENTS).toHaveLength(27);
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(27);
    expect(
      EVENTS.every((event) => Object.keys(event).join(",") === "id,name"),
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
  it("hides opponents' round effects but publishes winners during play", () => {
    const { room, host, enemy, referee } = fixture();
    command(room, host.id, { action: "start" });
    command(room, host.id, { action: "nextRound", winner: "left" });
    const view = roomView(room, enemy, {}, NOW);
    expect(view.rounds[0].winner).toBe("left");
    expect(view.rounds[0].effects.map((x) => x.memberId)).toEqual([enemy.id]);
    expect(roomView(room, referee, {}, NOW).rounds[0].effects).toHaveLength(2);
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
});
