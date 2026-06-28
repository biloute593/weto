# Weto - Agent Handover Context

Last updated: 2026-05-20
Purpose: persistent project context for next prompts/agents.

## 1) Executive Summary

This repository has been upgraded for production readiness with a focus on chat reliability, real-time quality, moderation safety, and backend performance hardening before app-store style release.

Major outcomes now in code:
- Functional call action in chat (meeting link flow)
- Real location sharing (map link + CTA)
- Ephemeral mode at thread level (24h auto expiry for new messages)
- Typing indicator pipeline end-to-end
- Presence status (online / last seen)
- Read receipts support (metadata for gray/blue checks)
- Feed bottom clipping fix under overlays
- Backend hardening: validation, payload bounds, anti-burst, email index, cleanup

## 2) Chronological Change Log (Conversation to Code)

### Phase A - Product fixes requested
User asked to fix core chat/feed defects and make the app professional and performant:
- Location sharing should share actionable map location, not useless text
- Notification/dilemma feed clipping at bottom should be fixed
- Call action in chat should actually work
- 24h ephemeral mode should erase messages automatically
- Live red dot and online/last-seen status should be visible
- Read receipts should distinguish unread/read (gray/blue checks)
- Overall polish for production deployment readiness

### Phase B - End-to-end chat architecture upgrades
Implemented across types, store, API and Netlify service layer:
- Added metadata contracts for expiresAt and seenByRecipient
- Added typing and chat mode API endpoints
- Extended store actions and optimistic message model
- Added backend thread metadata (typingByUserId, ephemeralMode24h)
- Added message visibility filtering with expiry
- Added presence from session activity, not only profile timestamp

### Phase C - UI behavior polish
In chat details screen:
- Presence labels and live status row
- Typing debounce and stop behavior
- Location message rendering with map-open button
- Call button opens external room and posts event in thread
- Ephemeral mode toggle and informational system messaging
- Read receipt visual support via message metadata

In feed screen:
- Added bottom spacing logic to prevent card clipping when overlays are active

### Phase D - Backend hardening for release
Recent deep hardening pass in service and function HTTP layer:
- Email index persisted to avoid O(n) user scan on auth path
- Input sanitization and limits for chat payloads
- Expired-message cleanup and history bounds
- Typing-state stale cleanup
- Anti-burst rate guard for message flood
- Security headers and strict JSON content-type checks

## 3) Current Technical State by File

### netlify/functions/_lib/service.ts
Key production logic now includes:
- Email index helper and maintenance
  - emailIndex/{emailLower}.txt -> userId
  - saveUser updates/deletes index on email changes
  - getUserByEmail uses index first, then fallback scan + self-heal index
- Message validation and normalization
  - Reject empty/oversized text
  - Bound media URI size
  - Bound dilemma payload shape and choice count
- Ephemeral and lifecycle controls
  - 24h expiry in thread ephemeral mode
  - getVisibleMessages excludes hidden/expired messages
- Thread cleanup and bounded payload
  - Prune expired messages
  - Hard cap on stored thread messages
  - loadChatThread returns only recent visible window
- Real-time robustness
  - Typing state with stale-entry cleanup
  - Anti-burst limiter on sendMessageToContact

### netlify/functions/_lib/http.ts
- Common secure response headers for API JSON responses
- parseJsonBody enforces application/json and returns 415 otherwise
- Existing typed error behavior preserved

### src/store/useWetoStore.ts
- Added setTypingState and setChatEphemeralMode actions
- Optimistic message model enriched with expiresAt and seenByRecipient=false
- API aliasing for remote chat mode call maintained

### src/screens/ChatDetailScreen.tsx
- Presence and typing UI
- Call/location interaction flows
- Ephemeral mode controls and message UX
- Polling + debounce + cleanup behavior

### src/screens/FeedScreen.tsx
- Bottom overlay clipping mitigation for dilemma list continuity

### src/services/wetoApi.ts
- Added API calls for typing and thread ephemeral mode

### src/types/index.ts
- Extended chat type contracts with expiry/read/presence metadata

## 4) Operational Commands

- Type check
  - npm run -s typecheck
- Build web (Expo export + postbuild assets)
  - npm run -s build:web
- Release preflight
  - npm run -s preflight:release

Additional release checklist:
- See RELEASE_PREP_APP_STORE.md

## 5) Deployment Notes

Platform indicators in repository:
- netlify.toml configured
  - Build command: npm run build:web
  - Publish directory: dist
  - Functions dir: netlify/functions

Expected deployment modes:
- Automatic deploy via GitHub -> Netlify (already documented in README)
- Optional CLI deploy if Netlify auth/site context is available in environment

## 6) Risk Register (Current)

Residual risks to verify in final QA:
- Burst limiter threshold may need tuning under high-message edge cases
- Chat history limit must be validated against UX expectations on long conversations
- Presence correctness depends on session token activity heartbeat patterns
- Real device validation required for iOS/Android permission edge cases

## 7) What the Next Agent Should Do First

1. Read this file fully.
2. Run npm run -s typecheck.
3. Run npm run -s preflight:release.
4. Validate chat flows manually (typing, read receipt color, call, location, ephemeral 24h).
5. Deploy using Netlify pipeline available in current environment.

## 8) Quick Diff of Latest Hardening Additions

- service.ts constants:
  - THREAD_VISIBLE_HISTORY_LIMIT
  - THREAD_MAX_MESSAGES
  - MAX_MESSAGE_TEXT_LENGTH
  - MAX_MEDIA_URI_LENGTH
  - MESSAGE_BURST_WINDOW_MS
  - MESSAGE_BURST_MAX
- service.ts key functions:
  - emailIndexKey
  - sanitizeChatMessageInput
  - pruneThreadMessages
  - pruneThreadTypingState
  - assertMessageRateLimit
- http.ts:
  - getDefaultHeaders
  - parseJsonBody JSON content-type guard
- package.json:
  - preflight:release script
- docs:
  - RELEASE_PREP_APP_STORE.md
  - this AGENT_HANDOVER_CONTEXT.md
