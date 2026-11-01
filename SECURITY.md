# Security and intended use

Odds Lab is an educational simulation. Virtual credits have no monetary value. No payments, prizes, real gambling accounts, or document uploads exist.

## Backend teaching demonstration

The control room exposes clearly labelled forced outcomes for a visitor's own session. It never changes another visitor's game or the independent probability lab. Each response discloses its mode, whether it was forced, the random sample, and the presented result. There is no secret global switch.

Session tokens are generated from 24 random bytes and sent in Authorization headers. Keep them private and do not put them in URLs or logs. The page holds its token only in memory; the exported audit omits it. Session state is in process memory, expires after 30 minutes, and can be explicitly deleted. The server caps active sessions at 500 and observations at 20 per session. Plans lock after the first observation. Idempotent round request IDs avoid duplicate settlement on retries.

The server restricts static assets to an allowlist, applies security headers, rejects cross-origin API requests, limits JSON bodies to 4 KiB, and validates game/plan inputs. Legacy global win/loss routes are not supported.

## Hosting limitations

The demo is a single-process educational server, not a production gambling or financial platform. HTTPS, request rate limits, connection/body timeouts and request-size enforcement should be configured at the hosting proxy for public use. The capacity cap bounds session storage but does not prevent denial of service. Multi-instance hosting needs sticky routing or a future shared session store; restart loses sessions. No authentication system for real people is supplied. An operator-controlled audit log is not independent proof of fairness.

Do not include personal information, tokens, or secrets in public issue reports. Report reproducible non-sensitive issues through the repository issue tracker.
