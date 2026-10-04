# Security Specification & Test-Driven Hardening

## 1. Data Invariants

1. **User Identity Boundary**: A user can only access, create, update, or read documents inside their own `/users/{userId}` hierarchy. Under no circumstances can a user read, write, or list documents belonging to another `userId`.
2. **Transaction Integrity**: Every transaction must have an immutable `userId` matching `request.auth.uid`, a positive or negative numeric amount, a valid ISO or formatted date, a category of max 64 characters, and an account string.
3. **Card Vault Privacy**: Payment cards stored under `/users/{userId}/cards/{cardId}` must never be queryable or readable by other users. The `userId` must match `request.auth.uid`.
4. **Budget Isolation**: Budgets under `/users/{userId}/budgets/{budgetId}` are strictly private to the authenticated owner.
5. **No Anonymous Client Forgery**: Non-authenticated requests are denied on all paths by default.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Spoofed User ID Write**: An attacker tries to write to `/users/victim_123` with `auth.uid = "attacker_456"`. Expected: `PERMISSION_DENIED`.
2. **Ghost Field Injection**: An attacker submits a transaction with an unauthorized shadow field `isAdmin: true` or `verified: true`. Expected: `PERMISSION_DENIED` via `hasOnly()`.
3. **Cross-Tenant Transaction Injection**: An attacker tries to insert a transaction into `/users/victim_123/transactions/tx_1` setting `userId: "attacker_456"`. Expected: `PERMISSION_DENIED`.
4. **ID Poisoning Attack**: An attacker attempts to create a document with a 2KB garbage ID string or path traversal characters `../`. Expected: `PERMISSION_DENIED` via `isValidId()`.
5. **Unauthenticated Public Read**: An unauthenticated request attempts to list `/users` or `/users/some_user/transactions`. Expected: `PERMISSION_DENIED`.
6. **Negative Budget Allocation Poisoning**: An attacker tries to create a budget with `allocatedAmount: -50000`. Expected: `PERMISSION_DENIED`.
7. **Type Juggling Attack**: An attacker submits `amount: "fifty thousand"` (string instead of number) for a transaction. Expected: `PERMISSION_DENIED`.
8. **Resource Denial of Wallet**: An attacker submits a `notes` field with a 50KB payload. Expected: `PERMISSION_DENIED` via `notes.size() <= 500`.
9. **Transaction Ownership Hijack**: An attacker attempts to update an existing transaction to change its `userId` or `id`. Expected: `PERMISSION_DENIED` via immutable field checks.
10. **Card Type Injection**: An attacker submits an invalid card type `type: "super_admin_pass"`. Expected: `PERMISSION_DENIED` via `type in ['credit', 'debit']`.
11. **User Deletion Exploit**: An authenticated user attempts to delete the root `/users/{userId}` document. Expected: `PERMISSION_DENIED` (delete: false).
12. **Blanket Query Scraping**: A user attempts to query across collection groups without scoping to their own `userId`. Expected: `PERMISSION_DENIED`.
