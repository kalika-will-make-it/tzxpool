# Firestore Security Specifications

## 1. Data Invariants

- **User Profiles**: Every user profile doc must correspond exactly to their authenticated Google `uid`. Balances and withdrawn figures must hold valid non-negative counts.
- **Investments**: Any custom investment lock pool created must register a legitimate referenced `userId` pointing directly to the active signer. Total investAmount and mature amounts cannot sit beneath zero limits.
- **Withdrawals**: Transactions cash out amounts cannot claim negative USD parameters and must feature target phone numbers.
- **Notifications**: Read-state structures must occupy regular booleans.

## 2. The Dirty Dozen Payloads

These 12 malicious payloads attempt to hijack states, bypass validation, or poison fields. All must return `PERMISSION_DENIED`:

1. Anonymous profile creation matching existing user ID.
2. User profile injection utilizing a non-existent email verify tag.
3. User balance modification exceeding wallet amount without approval.
4. Investment lock pool creation claiming another user ID.
5. Investment payout status auto-transitioning to standard "matured" status bypassing validation.
6. Matured status payout injection on pending assets from non-admin accounts.
7. Withdrawal creation targeting mismatched target profiles.
8. Negative cash out values in mobile money requests.
9. Notification spoofing target recipient profiles.
10. Notification insertions trying to mark systemic global messages.
11. ID poisoning injecting excessively long junk strings as references.
12. Private user-owned document reads attempted by unverified external users.

## 3. Security Hardening Complete

Rules deploy enforces total compliance.
