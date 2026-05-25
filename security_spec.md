# Security Specification for Girok

## Data Invariants
1. A Note must belong to an authenticated user and be stored under their specific unique path (`/users/{userId}/notes/{noteId}`).
2. A Category must belong to an authenticated user and be stored under their specific unique path (`/users/{userId}/categories/{categoryId}`).
3. Users can only read, write, update, or delete their own data.
4. `userId` in the data must strictly match the `request.auth.uid`.

## The "Dirty Dozen" Payloads (Threat Models)
1. **Payload 1: Identity Spoofing (Write to another user's collection)**
   - Target: `/users/victim_uid/notes/malicious_note`
   - Payload: `{ userId: 'attacker_uid', ... }`
   - Expected: `PERMISSION_DENIED`

2. **Payload 2: Identity Spoofing (Data userId mismatch)**
   - Target: `/users/attacker_uid/notes/note_1`
   - Payload: `{ userId: 'victim_uid', ... }`
   - Expected: `PERMISSION_DENIED`

3. **Payload 3: Cross-User Read**
   - Operation: `get` or `list` on `/users/victim_uid/notes`
   - Expected: `PERMISSION_DENIED`

4. **Payload 4: Malicious ID Injection**
   - Target: `/users/attacker_uid/notes/very_long_junk_id_over_128_chars_...`
   - Expected: `PERMISSION_DENIED`

5. **Payload 5: Schema Violation (Missing fields)**
   - Payload: `{ categoryId: 'some-id' }` (Missing `textContent`, `date`, etc.)
   - Expected: `PERMISSION_DENIED`

6. **Payload 6: Type Poisoning (Number as string)**
   - Payload: `{ date: "not-a-number" }`
   - Expected: `PERMISSION_DENIED`

7. **Payload 7: Resource Exhaustion (Huge textContent)**
   - Payload: `{ textContent: "A".repeat(1000001) }` (Over 1MB text)
   - Expected: `PERMISSION_DENIED`

8. **Payload 8: Immutable Field Violation (Change userId)**
   - Operation: `update`
   - Payload: `{ userId: 'new_uid' }`
   - Expected: `PERMISSION_DENIED`

9. **Payload 9: Photo URL List Overflow**
   - Payload: `{ photoUrls: ["url"].repeat(101) }`
   - Expected: `PERMISSION_DENIED`

10. **Payload 10: Category Name Injection in Note**
    - Payload: `{ categoryName: "B".repeat(201) }`
    - Expected: `PERMISSION_DENIED`

11. **Payload 11: Invalid ID format**
    - Target: `/users/attacker_uid/notes/ID with spaces`
    - Expected: `PERMISSION_DENIED`

12. **Payload 12: Anonymous Access**
    - Operation: Any write without `request.auth`
    - Expected: `PERMISSION_DENIED`
