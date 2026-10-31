import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { request } from '../src/valorant/api.js';

test('room requests stay on the website origin and preserve identity on retry', async (t) => {
  globalThis.window = { location: { origin: 'https://www.sscup.club' } };
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) throw new TypeError('Failed to fetch');
    return Response.json({ data: { code: 'ABCDEF' } });
  });
  await request('test-token', { action: 'join', code: 'ABCDEF', nickname: '测试' });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url.href, 'https://www.sscup.club/api/valorant');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
  assert.equal(calls[0].options.body, calls[1].options.body);
  assert.equal(calls[0].options.cache, 'no-store');
});

test('failed connections produce a readable error after bounded retries', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new DOMException('Timeout', 'AbortError'); });
  await assert.rejects(request('test-token', null, { code: 'ABCDEF' }), /连接超时/);
  assert.equal(globalThis.fetch.mock.callCount(), 2);
});

test('API errors keep their status and are not retried', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: { message: '房间不存在' } }, { status: 404 }));
  await assert.rejects(request('test-token', null, { code: 'ABCDEF' }), { status: 404, message: '房间不存在' });
  assert.equal(globalThis.fetch.mock.callCount(), 1);
});

test('API proxy routes precede the SPA fallback', () => {
  const { rewrites } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  for (const path of ['/api/valorant', '/api/sscup']) {
    const index = rewrites.findIndex(rule => rule.source === path);
    assert.ok(index >= 0 && index < rewrites.length - 1);
    assert.equal(rewrites[index].destination, `https://soma-api-one.vercel.app${path}`);
  }
});
