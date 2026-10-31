import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { Db } from "mongodb";
import { getDatabase } from "../lib/mongodb.js";
import { allowMethods, withApi, sendError } from "../lib/http.js";
import {
  applyCommand,
  ensure,
  joinRoom,
  makeRoom,
  RETENTION_MS,
  RoomError,
  roomView,
  visibleResults,
  type Room,
  type Log,
  type Member,
  type Command,
} from "../lib/valorant-domain.js";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const credential = z.string().regex(/^[a-f0-9]{64}$/);
const codeSchema = z.string().regex(/^[A-HJ-NP-Z2-9]{6}$/);
const nicknameSchema = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .refine((s) => !/[\p{Cc}\p{Cf}]/u.test(s), "昵称不能包含控制字符");
const bodySchema = z
  .object({
    action: z.enum([
      "create",
      "join",
      "heartbeat",
      "team",
      "referee",
      "settings",
      "start",
      "spin",
      "spinAll",
      "nextRound",
      "end",
      "reset",
      "transfer",
      "takeover",
      "remove",
      "recover",
    ]),
    code: codeSchema.optional(),
    nickname: nicknameSchema.optional(),
    password: z.string().max(128).optional(),
    requestId: z.string().uuid(),
    version: z.number().int().nonnegative().optional(),
    targetId: z.string().uuid().optional(),
    team: z.enum(["left", "right"]).nullable().optional(),
    unified: z.boolean().optional(),
    enabled: z.boolean().optional(),
    recoveryToken: credential.optional(),
  })
  .strict();
type Game = {
  _id: string;
  room: string;
  number: number;
  startedAt: number;
  endedAt?: number;
  expiresAt: Date;
  members: { id: string; nickname: string; team: Member["team"] }[];
};
let indexes: Promise<unknown> | undefined;
function init(db: Db) {
  if (!indexes)
    indexes = Promise.all([
      db
        .collection("valorant_rooms")
        .createIndex({ creationKey: 1 }, { unique: true }),
      ...[
        "valorant_rooms",
        "valorant_games",
        "valorant_logs",
        "valorant_receipts",
        "valorant_limits",
        "valorant_presence",
      ].map((name) =>
        db
          .collection(name)
          .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      ),
      db
        .collection("valorant_logs")
        .createIndex({ room: 1, gameId: 1, seq: 1 }),
      db.collection("valorant_games").createIndex({ room: 1, number: -1 }),
    ]).catch((e) => {
      indexes = undefined;
      throw e;
    });
  return indexes;
}
async function rateLimit(db: Db, key: string, max: number, now: number) {
  const bucket = Math.floor(now / 60_000);
  const counter = await db
    .collection<{
      _id: string;
      count: number;
      expiresAt: Date;
    }>("valorant_limits")
    .findOneAndUpdate(
      { _id: `${key}:${bucket}` },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(now + 120_000) },
      },
      { upsert: true, returnDocument: "after" },
    );
  ensure(counter && counter.count <= max, "请求太频繁，请稍后重试。", 429);
}
const member = (r: Room, tokenHash: string) => {
  const m = r.members.find((x) => x.tokenHash === tokenHash);
  ensure(m, "身份已失效，请恢复原身份或联系房主。", 401);
  return m;
};
async function presence(db: Db, code: string) {
  const rows = await db
    .collection<{
      _id: string;
      room: string;
      memberId: string;
      at: number;
    }>("valorant_presence")
    .find({ room: code })
    .toArray();
  return Object.fromEntries(rows.map((x) => [x.memberId, x.at]));
}
async function touch(db: Db, r: Room, m: Member, now: number) {
  await db
    .collection<{
      _id: string;
      room: string;
      memberId: string;
      at: number;
      expiresAt: Date;
    }>("valorant_presence")
    .updateOne(
      { _id: `${r._id}:${m.id}` },
      {
        $set: {
          room: r._id,
          memberId: m.id,
          at: now,
          expiresAt: new Date(now + RETENTION_MS),
        },
      },
      { upsert: true },
    );
}

export default withApi(async (req, res) => {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  try {
    const token = credential.parse(
      req.headers.authorization?.replace(/^Bearer\s+/i, ""),
    );
    const tokenHash = hash(token);
    const db = await getDatabase();
    await init(db);
    const rooms = db.collection<Room>("valorant_rooms");
    const games = db.collection<Game>("valorant_games");
    const logs = db.collection<Log>("valorant_logs");
    const now = Date.now();
    if (req.method === "GET") {
      const code = codeSchema.parse(req.query.code);
      const room = await rooms.findOne({
        _id: code,
        expiresAt: { $gt: new Date(now) },
      });
      ensure(room, "房间不存在或已过期。", 404);
      const me = member(room, tokenHash);
      if (req.query.view === "games") {
        const rows = await games
          .find({
            room: code,
            "members.id": me.id,
            expiresAt: { $gt: new Date(now) },
          })
          .sort({ number: -1 })
          .limit(100)
          .toArray();
        return res.json({
          data: rows.map((g) => ({
            id: g._id,
            number: g.number,
            startedAt: g.startedAt,
            endedAt: g.endedAt,
            expiresAt: g.expiresAt,
          })),
        });
      }
      if (req.query.view === "history") {
        const gameId = z.string().uuid().parse(req.query.gameId);
        const game = await games.findOne({
          _id: gameId,
          room: code,
          "members.id": me.id,
          expiresAt: { $gt: new Date(now) },
        });
        ensure(game, "该场历史不存在、已过期或无权访问。", 404);
        const after = z.coerce
          .number()
          .int()
          .nonnegative()
          .default(0)
          .parse(req.query.after);
        const rows = await logs
          .find({
            room: code,
            gameId,
            seq: { $gt: after },
            expiresAt: { $gt: new Date(now) },
          })
          .sort({ seq: 1 })
          .limit(101)
          .toArray();
        const page = rows.slice(0, 100);
        return res.json({
          data: page.map(({ _id, seq, round, at, actor, action, results }) => ({
            id: _id,
            seq,
            round,
            at,
            actor,
            action,
            results: game.endedAt ? results : visibleResults(room, me, results),
          })),
          next: rows.length > 100 ? page[page.length - 1].seq : null,
        });
      }
      return res.json({
        data: roomView(room, me, await presence(db, code), now),
      });
    }
    const body = bodySchema.parse(req.body);
    // Persisted rate limits work across serverless instances. Password attempts are IP-limited.
    const ip = String(
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown",
    )
      .split(",")[0]
      .trim();
    if (body.action === "create" || body.action === "join")
      await rateLimit(db, hash(`entry:${ip}`), 20, now);
    else await rateLimit(db, tokenHash, 90, now);
    if (body.action === "create") {
      const configured = process.env.VALORANT_CREATE_PASSWORD;
      ensure(configured, "房间创建密码尚未配置，请联系管理员。", 503);
      ensure(
        body.password &&
          timingSafeEqual(
            Buffer.from(hash(body.password)),
            Buffer.from(hash(configured)),
          ),
        "创建密码不正确。",
        403,
      );
      const nickname = nicknameSchema.parse(body.nickname);
      let room = await rooms.findOne({
        creationKey: tokenHash,
        expiresAt: { $gt: new Date(now) },
      });
      if (!room) {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (let attempt = 0; attempt < 5; attempt++) {
          const candidate = makeRoom(
            Array.from(
              { length: 6 },
              () => alphabet[randomInt(alphabet.length)],
            ).join(""),
            nickname,
            tokenHash,
            now,
          );
          try {
            await rooms.insertOne(candidate);
            room = candidate;
            break;
          } catch (e) {
            if ((e as { code?: number }).code !== 11000) throw e;
            room = await rooms.findOne({ creationKey: tokenHash });
            if (room) break;
          }
        }
      }
      ensure(room, "房间创建失败，请重试。", 503);
      const me = member(room, tokenHash);
      await touch(db, room, me, now);
      return res.json({
        data: roomView(room, me, await presence(db, room._id), now),
      });
    }
    const code = codeSchema.parse(body.code);
    if (body.action === "heartbeat") {
      const room = await rooms.findOne({
        _id: code,
        expiresAt: { $gt: new Date(now) },
      });
      ensure(room, "房间不存在或已过期。", 404);
      const me = member(room, tokenHash);
      await touch(db, room, me, now);
      return res.json({
        data: roomView(room, me, await presence(db, code), now),
      });
    }
    // All mutations, draws and receipts commit together; retries never produce a second draw.
    const client = await globalThis.__somaMongoClientPromise;
    ensure(client, "数据库未连接。", 503);
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const room = await rooms.findOne(
          { _id: code, expiresAt: { $gt: new Date(now) } },
          { session },
        );
        ensure(room, "房间不存在或已过期。", 404);
        const receipts = db.collection<{ _id: string; expiresAt: Date }>(
          "valorant_receipts",
        );
        const receiptId = hash(`${code}:${tokenHash}:${body.requestId}`);
        if (await receipts.findOne({ _id: receiptId }, { session })) {
          member(room, tokenHash);
          return;
        }
        if (body.action === "join")
          joinRoom(room, nicknameSchema.parse(body.nickname), tokenHash, now);
        else {
          const me = member(room, tokenHash);
          ensure(
            body.version === room.version,
            "房间状态已更新，请查看最新状态后重试。",
          );
          const p = await presence(db, code);
          const log = applyCommand(
            room,
            me,
            { ...body, recoveryHash: body.recoveryToken } as Command,
            now,
            p[room.hostId] || 0,
          );
          if (body.action === "start")
            await games.insertOne(
              {
                _id: room.gameId!,
                room: code,
                number: room.gameNumber,
                startedAt: now,
                members: room.members.map(({ id, nickname, team }) => ({
                  id,
                  nickname,
                  team,
                })),
                expiresAt: new Date(now + RETENTION_MS),
              },
              { session },
            );
          if (log) await logs.insertOne(log, { session });
          if (body.action === "end") {
            const expiresAt = new Date(now + RETENTION_MS);
            await games.updateOne(
              { _id: room.gameId! },
              { $set: { endedAt: now, expiresAt } },
              { session },
            );
            await logs.updateMany(
              { room: code, gameId: room.gameId! },
              { $set: { expiresAt } },
              { session },
            );
          }
        }
        await rooms.replaceOne({ _id: code }, room, { session });
        await receipts.insertOne(
          { _id: receiptId, expiresAt: new Date(now + RETENTION_MS) },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    const room = await rooms.findOne({ _id: code });
    ensure(room, "房间不存在。", 404);
    const me = member(room, tokenHash);
    await touch(db, room, me, now);
    return res.json({
      data: roomView(room, me, await presence(db, code), now),
    });
  } catch (e) {
    if (e instanceof RoomError)
      return sendError(res, e.status, `ROOM_${e.status}`, e.message);
    throw e;
  }
});
