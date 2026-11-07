# GOT Agent Firestore Security Specification

## 1. Data Invariants
- **Master Gate & Identity Integrity**: Every `/users/{userId}` document must have `uid == request.auth.uid` and `userId == request.auth.uid`.
- **PII Isolation**: User PII (`email`, `ipAddress`) is stored strictly inside `/users/{userId}/private/{docId}` and is readable ONLY by the document owner (`request.auth.uid == userId`) or a verified Admin (`isAdmin()`).
- **Subcollection Relational Sync**: Every `/users/{userId}/chats/{chatId}` document requires parent `/users/{userId}` existence (`exists(/databases/$(database)/documents/users/$(userId))`) and `uid == userId`.
- **Privilege Escalation Prevention**: Users creating `/users/{userId}` can only set `role == 'user'`, `unlimitedTokens == false`, `isBlocked == false`, and `tokenBalance <= 5000`. Only `isAdmin()` can promote `role == 'co-admin'` or set `unlimitedTokens == true`.
- **Temporal Integrity**: All `createdAt` and `updatedAt` fields must equal `request.time`, and `createdAt` / `uid` are immutable across updates.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Create `/users/usr1` with `auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: Create `/users/usr1` with `email_verified == false` -> `PERMISSION_DENIED`.
3. **Identity Spoofing**: User `u1` creates `/users/u2` with `uid: "u2"` -> `PERMISSION_DENIED`.
4. **Self-Admin Escalation**: User `u1` creates `/users/u1` with `role: "co-admin"` or `unlimitedTokens: true` -> `PERMISSION_DENIED`.
5. **Shadow Ghost Field Injection**: Update `/users/u1` with `ghostField: true` -> `PERMISSION_DENIED`.
6. **ID Poisoning**: Create `/users/u1/chats/invalid$id!` -> `PERMISSION_DENIED`.
7. **Value Poisoning (Oversized String)**: Create `/users/u1/chats/c1` with `messagesSummary` > 20,000 chars -> `PERMISSION_DENIED`.
8. **Cross-User PII Leak**: User `u2` reads `/users/u1/private/info` -> `PERMISSION_DENIED`.
9. **Orphaned Subcollection Write**: Create `/users/nonexistent/chats/c1` when `/users/nonexistent` does not exist -> `PERMISSION_DENIED`.
10. **Immutable Field Tampering**: Update `/users/u1` changing `createdAt` or `uid` -> `PERMISSION_DENIED`.
11. **Forged Client Timestamp**: Create `/users/u1` with `createdAt` != `request.time` -> `PERMISSION_DENIED`.
12. **Unauthorized Site Config Mutation**: Non-admin updates `/site_config/global` -> `PERMISSION_DENIED`.
