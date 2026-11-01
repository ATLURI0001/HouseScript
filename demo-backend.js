import { randomBytes } from 'node:crypto';
import { trial, model, STAKE } from './public/engine.js';

// Every forced result is disclosed in the response and in the visitor interface.
// These sessions never affect the independent probability lab or another visitor.
const TTL = 30 * 60 * 1000;
const MAX_SESSIONS = 500;
const MODES = new Set(['random', 'win', 'loss', 'sequence']);
const GAMES = new Set(['mines', 'dice', 'roulette', 'crash', 'slots']);
export function createDemoService({ now = Date.now } = {}) {
  const sessions = new Map();
  function prune() { for (const [token, s] of sessions) if (now() - s.created >= TTL) sessions.delete(token); }
  function fail(status, message) { const e = new Error(message); e.status = status; throw e; }
  function session(token) {
    prune();
    if (!token || !sessions.has(token)) fail(401, 'Demo session expired or missing. Start a new demo.');
    return sessions.get(token);
  }
  function publicState(s) {
    return {mode:s.mode, sequence:[...s.sequence], used:s.rows.length, limit:20, rows:structuredClone(s.rows), expiresAt:s.created+TTL,
      notice:'EDUCATIONAL SIMULATION. Forced outcomes are explicitly disclosed. No real funds.'};
  }
  return {
    create() {
      prune();
      if (sessions.size >= MAX_SESSIONS) fail(503, 'The demo is at capacity. Please try later.');
      const token = randomBytes(24).toString('hex');
      const s = {created:now(), mode:'random', sequence:['win','win','loss','loss','loss'], rows:[], requests:new Map()};
      sessions.set(token,s);
      return {token, ...publicState(s)};
    },
    read(token) {return publicState(session(token));},
    remove(token) {session(token); sessions.delete(token); return {deleted:true};},
    configure(token, input) {
      const s = session(token);
      if (!input || !MODES.has(input.mode)) fail(400, 'Choose random, win, loss, or sequence.');
      if (!Array.isArray(input.sequence) || input.sequence.length<1 || input.sequence.length>20 || input.sequence.some(x=>!['win','loss'].includes(x))) fail(400, 'Use a sequence of 1–20 win/loss entries.');
      if (s.rows.length) fail(409, 'Start a fresh demo to change the plan. Existing audit records are preserved.');
      s.mode=input.mode; s.sequence=[...input.sequence];
      return publicState(s);
    },
    play(token, input) {
      const s=session(token);
      if (!input || !GAMES.has(input.game) || typeof input.requestId !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(input.requestId)) fail(400, 'Invalid game or request ID.');
      const fingerprint=JSON.stringify({game:input.game});
      if(s.requests.has(input.requestId)) {
        const cached=s.requests.get(input.requestId);
        if(cached.fingerprint!==fingerprint) fail(409,'Request ID already used with a different game.');
        return {row:structuredClone(cached.row),state:publicState(s)};
      }
      if(s.rows.length>=20) fail(409,'Twenty observations complete. Review the audit before starting another demo.');
      if(s.mode==='sequence' && s.rows.length>=s.sequence.length) fail(409,'Your scripted sequence is complete. Review the audit or start a new demo.');
      const underlying=trial(input.game);
      const planned=s.mode==='sequence'?s.sequence[s.rows.length]:s.mode;
      const forced=planned!=='random';
      const won=forced?planned==='win':underlying.won;
      const returned=won?STAKE*model(input.game).payout:0;
      const row={round:s.rows.length+1, game:input.game, mode:s.mode, planned,
        forced, underlying:{...underlying}, displayed:{won,returned,net:returned-STAKE}, stake:STAKE,
        explanation:forced?'The server replaced the sampled result with your disclosed teaching script. Published random-model odds do not describe this scripted outcome.':'The server used the sampled result without an override.',
        timestamp:new Date(now()).toISOString()};
      s.rows.push(row);
      const response={row:structuredClone(row),state:publicState(s)};
      s.requests.set(input.requestId,{fingerprint,row:structuredClone(row)});
      return response;
    }
  };
}
export const demoService = createDemoService();
