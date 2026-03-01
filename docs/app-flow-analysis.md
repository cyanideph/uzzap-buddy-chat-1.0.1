# App Flow Analysis (Uzzap Buddy Chat)

## 1) Current App Flow (high-level)

1. App starts in `app/index.tsx` and immediately redirects to `/ (auth)/login`.
2. Root layout bootstraps auth (`useAuthStore.initialize()`), then route-guards based on `user` + current segment.
3. Successful auth routes users into `(tabs)` where the main chatroom list is shown.
4. Opening a room (`/chatroom/[id]`) auto-joins the user, fetches room metadata/messages, subscribes to realtime inserts, and enables typing + message sends.
5. Register flow creates both auth user and `profiles` row, then pushes to email verification.

## 2) Flow Issues Found

### Issue A — Conflicting initial navigation causes route flicker and deep-link disruption
- `app/index.tsx` always redirects to login immediately.
- Root layout independently re-routes users based on auth state.
- This can cause a visible auth-screen flash for already-authenticated users and may interfere with deep links by forcing an unnecessary auth route hop.

**Where seen**
- `app/index.tsx`
- `app/_layout.tsx`

### Issue B — Login screen performs direct tab navigation before auth store settles
- `login.tsx` calls `router.replace('/(tabs)')` immediately after `signInWithPassword`.
- Root guard in `_layout.tsx` is already responsible for auth routing.
- If profile fetch in store initialization lags/fails, users can bounce between stacks or land in tabs without profile-dependent data ready.

**Where seen**
- `app/(auth)/login.tsx`
- `app/_layout.tsx`
- `store/useAuthStore.ts`

### Issue C — Duplicate auth management model (unused context + Zustand store)
- There is a full `AuthContext` implementation, but the app uses `useAuthStore` in routing/screens.
- Keeping two auth sources increases maintenance risk and onboarding confusion; stale implementation could diverge silently.

**Where seen**
- `context/AuthContext.tsx`
- usage search shows no `AuthProvider` mounts

### Issue D — Chatroom setup effect can leave screen stuck on loading when network/API fails
- In `/chatroom/[id]`, `setupChat` does async joins/fetches without `try/catch`.
- If `joinChatroom` or `getChatroomById` fails, `setRoomLoading(false)` may never run, leaving indefinite spinner.

**Where seen**
- `app/chatroom/[id].tsx`
- `services/chatroomService.ts`

### Issue E — Async cleanup pattern in chatroom subscription is fragile
- Effect cleanup stores `const cleanup = setupChat();` and later calls `cleanup.then(...)`.
- Unsubscribe is delayed until promise resolution; during quick navigation this can leave short-lived duplicate subscriptions and extra notifications.

**Where seen**
- `app/chatroom/[id].tsx`
- `store/useChatStore.ts`

### Issue F — Typing timeout not cleared on unmount
- `typingTimeoutRef` is set repeatedly in `handleTyping`, but no cleanup effect clears timeout on unmount.
- This can trigger late typing state writes after leaving room.

**Where seen**
- `app/chatroom/[id].tsx`

### Issue G — Membership/room counters can drift from real state
- Joining/leaving rooms updates membership rows, but no coordinated counter update is performed in the same flow (`member_count`, `last_activity_at` consistency depends on DB triggers not visible in app code).
- If DB trigger is absent/misconfigured, list sorting and room stats become inaccurate.

**Where seen**
- `services/chatroomService.ts`
- `app/chatroom/[id].tsx`

### Issue H — Service methods hide failures and reduce UI recoverability
- Multiple service methods catch errors and return `null`/`[]` without surfacing typed errors.
- UI screens often continue as if operation succeeded, preventing specific remediation messaging and retry strategies.

**Where seen**
- `services/authService.ts`
- `services/chatroomService.ts`
- `services/messageService.ts`
- `services/buddyService.ts`

### Issue I — Hardcoded Supabase endpoint/key fallback couples app to one backend
- Supabase URL and anon key are embedded as defaults if env vars are absent.
- This can accidentally point local/dev builds to production-like backend and complicates environment isolation.

**Where seen**
- `lib/supabase.ts`

## 3) Suggested Priority Order

1. **P0:** Fix startup/auth navigation conflicts (Issues A+B).
2. **P0:** Harden chatroom screen setup + cleanup to avoid stuck loading and ghost subscriptions (Issues D+E+F).
3. **P1:** Standardize error propagation contract for services (Issue H).
4. **P1:** Decide on one auth state architecture and remove dead path (Issue C).
5. **P2:** Remove hardcoded backend fallback; require explicit env in non-dev builds (Issue I).
6. **P2:** Ensure membership/activity counters are guaranteed via RPC/transaction/DB trigger checks (Issue G).
