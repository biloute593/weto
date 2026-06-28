# Weto App Store Preflight

This checklist is for final production hardening before App Store / Play Store submission.

## 1) Mandatory Technical Checks

- Run `npm run -s typecheck`
- Run `npm run -s build:web`
- Run `npm run -s preflight:release`
- Verify Netlify function logs have no recurring 4xx/5xx spikes
- Verify chat API latency and payload size under realistic load

## 2) Functional Regression Sweep

- Chat location sharing opens map links correctly on web and native
- Chat call action opens meeting link and posts call event in thread
- Ephemeral mode 24h applies to all new thread messages
- Typing indicator appears and clears correctly
- Presence text updates (`en ligne` / `vu a ...`)
- Read receipts switch from gray to blue when peer reads
- Feed cards are not clipped when bottom overlays/prompts are visible

## 3) Security and Abuse Controls

- Input validation rejects oversized message payloads
- JSON endpoints reject non-JSON content-type bodies
- Expired/ephemeral message cleanup works and keeps thread size bounded
- Session logout invalidates token correctly
- Moderation actions (`hide-message`, `suspend-user`, `dismiss`) are admin-only

## 4) Mobile Readiness

- iOS and Android permission prompts are localized and justified
- Camera/microphone/location flows recover cleanly after denial
- Background/foreground transitions do not break chat state
- Keyboard, safe-area, and input bar alignment validated on small devices

## 5) Store Submission Assets

- Privacy policy URL updated and reachable
- Terms of use URL updated and reachable
- Age rating answers aligned with moderation capabilities
- App screenshots and metadata match implemented features

## 6) Release Decision Gate

Ship only if:

- No critical crash in QA run
- No blocker in chat core flows
- No backend error burst in monitoring during final smoke test window
