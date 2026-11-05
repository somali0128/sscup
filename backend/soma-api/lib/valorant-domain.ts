import { randomInt, randomUUID } from "node:crypto";
import {
  EVENTS,
  EVENT_POOL_VERSION,
  type Tier,
  type WheelEvent,
} from "./valorant-events.js";

export const RETENTION_MS = 30 * 86400_000;
export class RoomError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const ensure: (
  condition: unknown,
  message: string,
  status?: number,
) => asserts condition = (condition, message, status = 409) => {
  if (!condition) throw new RoomError(status, message);
};
export type Team = "left" | "right" | null;
export type Side = "left" | "right";
export type Mode = "standard" | "rapid";
// Pistol rounds: first round of each half (standard 13-round halves, rapid 4).
export const PISTOL_ROUNDS: Record<Mode, number[]> = {
  standard: [1, 13],
  rapid: [1, 5],
};
export const isPistol = (mode: Mode | undefined, round: number) =>
  PISTOL_ROUNDS[mode === "rapid" ? "rapid" : "standard"].includes(round);
// Difficulty balance per player: drawing white pushes toward gold, drawing gold
// pushes toward white, purple drifts back to neutral. Each step multiplies the
// favoured tier's weight by +50%, up to three steps.
export const MAX_BALANCE = 3;
export const TIER_STEP = 0.5;
export function tierWeight(tier: Tier | undefined, balance: number) {
  if (tier === "gold" && balance > 0) return 1 + TIER_STEP * balance;
  if (tier === "white" && balance < 0) return 1 - TIER_STEP * balance;
  return 1;
}
export function nextBalance(balance: number, tier: Tier | undefined) {
  if (tier === "white") return Math.min(MAX_BALANCE, balance + 1);
  if (tier === "gold") return Math.max(-MAX_BALANCE, balance - 1);
  if (tier === "purple") return balance > 0 ? balance - 1 : balance < 0 ? balance + 1 : 0;
  return balance;
}
export function eligible(pool: WheelEvent[], pistol: boolean) {
  const list = pistol ? pool.filter((e) => e.pistol !== false) : pool;
  return list.length ? list : pool;
}
export function odds(pool: WheelEvent[], balance: number, pistol: boolean) {
  const list = eligible(pool, pistol);
  const total = list.reduce((sum, e) => sum + tierWeight(e.tier, balance), 0);
  const share = (tier: Tier) =>
    Math.round(
      (100 *
        list
          .filter((e) => (e.tier || "white") === tier)
          .reduce((sum, e) => sum + tierWeight(e.tier, balance), 0)) /
        (total || 1),
    );
  return { white: share("white"), purple: share("purple"), gold: share("gold") };
}
export type Member = {
  id: string;
  nickname: string;
  tokenHash: string;
  team: Team;
  referee: boolean;
  joinedAt: number;
};
export type Result = {
  memberId: string;
  nickname: string;
  team: Team;
  event: WheelEvent;
  // Second effect of the round's sanctioned top player.
  extra?: WheelEvent;
  round: number;
  drawId: string;
  at: number;
};
// The effect each participant carried when the host confirmed a round outcome.
export type RoundEffect = {
  memberId: string;
  nickname: string;
  team: Team;
  event: WheelEvent;
  extra?: WheelEvent;
  rerolls: number;
};
export type RoundRecord = {
  round: number;
  winner: Side | null;
  decidedAt: number;
  decidedBy: string;
  amendedAt?: number;
  pistol?: boolean;
  // Member sanctioned as 榜一 during this round.
  top?: string | null;
  effects: RoundEffect[];
};
export type Outcome = {
  round: number;
  winner: Side | null;
  previous?: Side | null;
  effects: RoundEffect[];
};
export type Room = {
  _id: string;
  creationKey: string;
  hostId: string;
  members: Member[];
  phase: "lobby" | "playing" | "ended";
  version: number;
  gameNumber: number;
  gameId: string | null;
  round: number;
  unified: boolean;
  pool: WheelEvent[];
  poolVersion: number;
  results: Result[];
  expiresAt: Date;
  lastDrawAt: Record<string, number>;
  // Absent on rooms created before round outcomes existed.
  rounds?: RoundRecord[];
  rerolls?: Record<string, number>;
  // Absent on rooms created before modes, tiers and sanctions existed.
  mode?: Mode;
  sanction?: boolean;
  top?: string | null;
  nextTop?: string | null;
  balance?: Record<string, number>;
};
export type Action =
  | "team"
  | "referee"
  | "settings"
  | "start"
  | "spin"
  | "spinAll"
  | "nextRound"
  | "end"
  | "reset"
  | "transfer"
  | "takeover"
  | "remove"
  | "recover"
  | "amend"
  | "top";
export type Command = {
  action: Action;
  targetId?: string;
  team?: Team;
  unified?: boolean;
  enabled?: boolean;
  recoveryHash?: string;
  winner?: Side | null;
  round?: number;
  mode?: Mode;
  sanction?: boolean;
  top?: string | null;
};
export type Log = {
  _id: string;
  room: string;
  gameId: string;
  seq: number;
  round: number;
  at: number;
  actorId: string;
  actor: string;
  action: string;
  results: Result[];
  outcome?: Outcome;
  expiresAt: Date;
};
export const isManager = (r: Room, m: Member) => r.hostId === m.id || m.referee;
export const seesAll = (r: Room, m: Member) =>
  r.phase === "ended" || (!m.team && isManager(r, m));
export const visibleResults = <T extends { team: Team }>(
  r: Room,
  m: Member,
  results: T[],
) =>
  results.filter(
    (x) => seesAll(r, m) || (m.team !== null && x.team === m.team),
  );
// A decided round is over, so its winner and every effect are public; only the
// round in progress keeps opponents' effects secret.
export const visibleRounds = (_r: Room, _m: Member, rounds: RoundRecord[]) =>
  rounds;
export const visibleOutcome = (_r: Room, _m: Member, outcome?: Outcome) =>
  outcome;
// Draw-log results from rounds before the current one are public too.
export const visibleLogResults = (
  r: Room,
  m: Member,
  log: { round: number; results: Result[] },
  ended: boolean,
) =>
  ended || log.round < r.round || r.phase !== "playing"
    ? log.results
    : visibleResults(r, m, log.results);
export const score = (rounds: RoundRecord[]) => ({
  left: rounds.filter((x) => x.winner === "left").length,
  right: rounds.filter((x) => x.winner === "right").length,
});
const isSide = (x: unknown): x is Side => x === "left" || x === "right";
export function roomView(
  r: Room,
  m: Member,
  presence: Record<string, number>,
  now: number,
) {
  return {
    code: r._id,
    hostId: r.hostId,
    meId: m.id,
    phase: r.phase,
    version: r.version,
    gameNumber: r.gameNumber,
    gameId: r.gameId,
    round: r.round,
    unified: r.unified,
    mode: r.mode || "standard",
    pistolRounds: PISTOL_ROUNDS[r.mode === "rapid" ? "rapid" : "standard"],
    pistol: r.phase === "playing" && isPistol(r.mode, r.round),
    sanction: !!r.sanction,
    top: r.top ?? null,
    nextTop: isManager(r, m) ? (r.nextTop ?? null) : null,
    odds:
      m.team && r.phase === "playing"
        ? odds(r.pool, r.balance?.[m.id] || 0, isPistol(r.mode, r.round))
        : null,
    pool: r.pool,
    results: visibleResults(r, m, r.results),
    rounds: visibleRounds(r, m, r.rounds || []),
    score: score(r.rounds || []),
    rerolls: r.rerolls || {},
    expiresAt: r.expiresAt,
    members: r.members.map(({ id, nickname, team, referee }) => ({
      id,
      nickname,
      team,
      referee,
      online: now - (presence[id] || 0) < 20_000,
    })),
    canManage: isManager(r, m),
    canDecide: r.hostId === m.id && r.phase === "playing",
    canSeeAll: seesAll(r, m),
    canTakeover:
      m.referee &&
      r.hostId !== m.id &&
      now - (presence[r.hostId] || 0) >= 60_000,
  };
}
export function makeRoom(
  code: string,
  nickname: string,
  tokenHash: string,
  now: number,
): Room {
  const host: Member = {
    id: randomUUID(),
    nickname,
    tokenHash,
    team: null,
    referee: false,
    joinedAt: now,
  };
  return {
    _id: code,
    creationKey: tokenHash,
    hostId: host.id,
    members: [host],
    phase: "lobby",
    version: 0,
    gameNumber: 0,
    gameId: null,
    round: 0,
    unified: false,
    pool: structuredClone(EVENTS),
    poolVersion: EVENT_POOL_VERSION,
    results: [],
    expiresAt: new Date(now + RETENTION_MS),
    lastDrawAt: {},
    rounds: [],
    rerolls: {},
    mode: "standard",
    sanction: false,
    top: null,
    nextTop: null,
    balance: {},
  };
}
function recordRound(r: Room, actor: Member, winner: Side | null, now: number) {
  const rerolls = r.rerolls || {};
  const record: RoundRecord = {
    round: r.round,
    winner,
    decidedAt: now,
    decidedBy: actor.nickname,
    pistol: isPistol(r.mode, r.round),
    top: r.sanction ? (r.top ?? null) : null,
    effects: r.results.map((x) => ({
      memberId: x.memberId,
      nickname: x.nickname,
      team: x.team,
      event: structuredClone(x.event),
      ...(x.extra ? { extra: structuredClone(x.extra) } : {}),
      rerolls: rerolls[x.memberId] || 0,
    })),
  };
  r.rounds = [...(r.rounds || []).filter((x) => x.round !== r.round), record];
  r.rerolls = {};
  return { round: record.round, winner, effects: record.effects };
}
// Weighted draw by difficulty; the sanctioned top player gets two distinct effects.
function draw(
  r: Room,
  m: Member,
  pistol: boolean,
  pick: (max: number) => number,
) {
  r.balance ||= {};
  let balance = r.balance[m.id] || 0;
  const picked: WheelEvent[] = [];
  const count = r.sanction && r.top === m.id ? 2 : 1;
  for (let i = 0; i < count; i++) {
    let list = eligible(r.pool, pistol).filter(
      (e) => !picked.some((p) => p.id === e.id),
    );
    if (!list.length) list = r.pool;
    const weights = list.map((e) => Math.round(tierWeight(e.tier, balance) * 100));
    let roll = pick(weights.reduce((sum, w) => sum + w, 0));
    let index = 0;
    while (index < list.length - 1 && roll >= weights[index]) {
      roll -= weights[index];
      index++;
    }
    picked.push(structuredClone(list[index]));
    balance = nextBalance(balance, list[index].tier);
  }
  r.balance[m.id] = balance;
  return picked;
}
function participant(r: Room, id: string | null | undefined) {
  if (!id) return null;
  const m = r.members.find((x) => x.id === id);
  ensure(m && m.team, "榜一必须是参赛玩家。", 400);
  return m.id;
}
export function joinRoom(r: Room, nickname: string, hash: string, now: number) {
  const existing = r.members.find((m) => m.tokenHash === hash);
  if (existing) return existing;
  ensure(r.phase === "lobby", "本场已锁定名单，请使用原设备恢复或联系裁判。");
  ensure(r.members.length < 13, "房间已满，最多 13 人。");
  ensure(
    !r.members.some(
      (m) => m.nickname.toLocaleLowerCase() === nickname.toLocaleLowerCase(),
    ),
    "该游戏昵称已在房间中，请恢复原身份。",
  );
  const m: Member = {
    id: randomUUID(),
    nickname,
    tokenHash: hash,
    team: null,
    referee: false,
    joinedAt: now,
  };
  r.members.push(m);
  r.version++;
  r.expiresAt = new Date(now + RETENTION_MS);
  return m;
}
export function applyCommand(
  r: Room,
  actor: Member,
  cmd: Command,
  now: number,
  hostLastSeen: number,
  pick: (max: number) => number = randomInt,
): Log | null {
  const host = actor.id === r.hostId;
  const manager = isManager(r, actor);
  const target = r.members.find((m) => m.id === cmd.targetId);
  const lobby = () =>
    ensure(r.phase === "lobby", "本场已经锁定，结束并返回大厅后才能修改。");
  const managing = () => ensure(manager, "只有房主或裁判可以操作。", 403);
  const playing = () => ensure(r.phase === "playing", "当前没有进行中的对局。");
  let drawMembers: Member[] = [];
  let outcome: Outcome | undefined;
  r.rounds ||= [];
  r.rerolls ||= {};
  switch (cmd.action) {
    case "team":
      lobby();
      ensure(!actor.referee, "裁判不能同时参赛。");
      ensure(
        cmd.team === null || cmd.team === "left" || cmd.team === "right",
        "请选择有效队伍。",
        400,
      );
      ensure(
        !cmd.team ||
          r.members.filter((m) => m.team === cmd.team && m.id !== actor.id)
            .length < 5,
        "该队已满 5 人。",
      );
      actor.team = cmd.team;
      break;
    case "referee":
      lobby();
      ensure(host, "只有房主可以指定裁判。", 403);
      ensure(target, "找不到该成员。", 404);
      ensure(!target.team, "请先让该成员退出队伍。");
      target.referee = !!cmd.enabled;
      break;
    case "settings":
      lobby();
      ensure(host, "只有房主可以修改模式。", 403);
      if (cmd.unified !== undefined) r.unified = !!cmd.unified;
      if (cmd.mode !== undefined) {
        ensure(cmd.mode === "standard" || cmd.mode === "rapid", "请选择有效模式。", 400);
        r.mode = cmd.mode;
      }
      if (cmd.sanction !== undefined) r.sanction = !!cmd.sanction;
      break;
    case "start":
      lobby();
      ensure(host, "只有房主可以开始。", 403);
      ensure(
        r.members.some((m) => m.team),
        "至少一名玩家选择队伍后才能开始。",
      );
      ensure(
        r.members.every((m) => m.team || m.referee || m.id === r.hostId),
        "请让等待中的成员选队，或将其指定为裁判。",
      );
      r.phase = "playing";
      r.gameNumber++;
      r.gameId = randomUUID();
      r.round = 1;
      r.pool = structuredClone(EVENTS);
      r.poolVersion = EVENT_POOL_VERSION;
      r.results = [];
      r.lastDrawAt = {};
      r.rounds = [];
      r.rerolls = {};
      r.mode ||= "standard";
      r.top = null;
      r.nextTop = null;
      r.balance = {};
      drawMembers = r.members.filter((m) => m.team);
      break;
    case "spin":
      playing();
      ensure(actor.team, "未参赛成员不能抽取。", 403);
      ensure(!r.unified, "本场采用统一抽取，请等待房主或裁判操作。", 403);
      ensure(
        now - (r.lastDrawAt[actor.id] || 0) >= 1000,
        "操作太快，请稍后再试。",
        429,
      );
      drawMembers = [actor];
      r.rerolls[actor.id] = (r.rerolls[actor.id] || 0) + 1;
      break;
    case "spinAll":
      playing();
      managing();
      ensure(
        now - (r.lastDrawAt.all || 0) >= 1000,
        "操作太快，请稍后再试。",
        429,
      );
      r.lastDrawAt.all = now;
      drawMembers = r.members.filter((m) => m.team);
      break;
    case "nextRound":
      playing();
      ensure(host, "只有房主可以确认本回合胜负。", 403);
      ensure(isSide(cmd.winner), "请选择本回合胜方。", 400);
      {
        // 榜一 for the coming round: the host's pick, else a referee's suggestion.
        const top = r.sanction
          ? participant(r, cmd.top !== undefined ? cmd.top : r.nextTop)
          : null;
        outcome = recordRound(r, actor, cmd.winner, now);
        r.round++;
        r.top = top;
        r.nextTop = null;
      }
      r.lastDrawAt.all = now;
      drawMembers = r.members.filter((m) => m.team);
      break;
    case "top":
      playing();
      managing();
      ensure(r.sanction, "本场未开启榜一制裁模式。");
      r.nextTop = participant(r, cmd.targetId ?? null);
      break;
    case "end":
      playing();
      ensure(host, "只有房主可以确认胜负并结束本场。", 403);
      ensure(
        cmd.winner === undefined || cmd.winner === null || isSide(cmd.winner),
        "请选择有效的胜方。",
        400,
      );
      // The final round may be abandoned; it is then left out of the record.
      if (isSide(cmd.winner)) outcome = recordRound(r, actor, cmd.winner, now);
      r.phase = "ended";
      break;
    case "amend": {
      ensure(r.phase !== "lobby" && r.gameId, "当前没有可修正的对局。");
      ensure(host, "只有房主可以修正回合胜负。", 403);
      ensure(isSide(cmd.winner), "请选择有效的胜方。", 400);
      const record = r.rounds.find((x) => x.round === cmd.round);
      ensure(record, "找不到该回合的胜负记录。", 404);
      ensure(record.winner !== cmd.winner, "该回合已是此结果。");
      outcome = {
        round: record.round,
        winner: cmd.winner,
        previous: record.winner,
        effects: [],
      };
      record.winner = cmd.winner;
      record.amendedAt = now;
      break;
    }
    case "reset":
      managing();
      ensure(r.phase === "ended", "请先结束本场。");
      r.phase = "lobby";
      r.gameId = null;
      r.results = [];
      r.round = 0;
      r.lastDrawAt = {};
      r.rounds = [];
      r.rerolls = {};
      r.top = null;
      r.nextTop = null;
      r.balance = {};
      break;
    case "transfer":
      ensure(host, "只有房主可以移交。", 403);
      ensure(target, "找不到该成员。", 404);
      ensure(target.id !== actor.id, "该成员已经是房主。");
      // Leaving a playing host without a team must not turn them into an unprivileged observer.
      if (!actor.team) actor.referee = true;
      r.hostId = target.id;
      break;
    case "takeover":
      ensure(
        actor.referee && actor.id !== r.hostId,
        "只有已指定裁判可以接管。",
        403,
      );
      ensure(now - hostLastSeen >= 60_000, "房主离线满 60 秒后才能接管。");
      {
        const old = r.members.find((m) => m.id === r.hostId);
        if (old && !old.team) old.referee = true;
      }
      r.hostId = actor.id;
      break;
    case "remove":
      lobby();
      managing();
      ensure(
        target && target.id !== r.hostId && target.id !== actor.id,
        "不能移除该成员。",
      );
      ensure(host || !target.referee, "裁判不能移除其他裁判。", 403);
      r.members = r.members.filter((m) => m.id !== target.id);
      break;
    case "recover":
      managing();
      ensure(target, "找不到该成员。", 404);
      ensure(cmd.recoveryHash, "缺少恢复凭据。", 400);
      ensure(
        !actor.team || target.team === actor.team,
        "参赛管理员只能恢复本队身份，请联系未参赛裁判。",
        403,
      );
      ensure(
        host || (target.id !== r.hostId && !target.referee),
        "该身份需要房主协助恢复。",
        403,
      );
      target.tokenHash = cmd.recoveryHash;
      break;
  }
  r.version++;
  // Post-game administration must not extend retention of the final results.
  if (r.phase !== "ended" || cmd.action === "end")
    r.expiresAt = new Date(now + RETENTION_MS);
  const drawId = randomUUID();
  const pistol = isPistol(r.mode, r.round);
  const results: Result[] = drawMembers.map((m) => {
    const [event, extra] = draw(r, m, pistol, pick);
    return {
      memberId: m.id,
      nickname: m.nickname,
      team: m.team,
      event,
      ...(extra ? { extra } : {}),
      round: r.round,
      drawId,
      at: now,
    };
  });
  for (const result of results) {
    r.results = r.results.filter((x) => x.memberId !== result.memberId);
    r.results.push(result);
    r.lastDrawAt[result.memberId] = now;
  }
  return r.gameId
    ? {
        _id: drawId,
        room: r._id,
        gameId: r.gameId,
        seq: r.version,
        round: r.round,
        at: now,
        actorId: actor.id,
        actor: actor.nickname,
        action: cmd.action,
        results,
        ...(outcome ? { outcome } : {}),
        // Corrections after the end keep the game's fixed expiry.
        expiresAt:
          r.phase === "ended" && cmd.action !== "end"
            ? r.expiresAt
            : new Date(now + RETENTION_MS),
      }
    : null;
}
