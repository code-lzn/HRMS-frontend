# Task 2 Report: 我的档案 (My Profile) Page

## What was done

Implemented the full "我的档案" page at `src/pages/Profile/index.tsx`, replacing the placeholder.

### Key implementation details

1. **Data source**: Uses `useProfile()` hook (from `@/hooks/useProfile`, which wraps `@umijs/max` `useModel('profile')`) to fetch profile data from `getProfile()` service.

2. **View mode**: Displays all 15 fields in a bordered `Descriptions` component with 2 columns.

3. **Edit mode**: Clicking "编辑" toggles to edit mode. Only 4 editable fields (email, address, emergencyContact, emergencyPhone) become input controls. The "保存" button calls `updateProfile()`, and "取消" reverts changes.

4. **Locked fields**: Fields in the `lockedFields` array (name, phone, idCard, departmentName, positionName, jobLevel) display with grey text and a Tooltip "如需修改请联系 HR" on hover.

5. **Phone and ID card**: Always locked with Tooltip since these are sensitive fields.

6. **Status Tag**: Color-coded based on status value (green=正式, blue=other active, red=inactive).

7. **Unsaved changes protection**: Canceling with unsaved changes triggers `Modal.confirm` with "修改尚未保存，确定要取消吗？".

8. **Birthday field**: Uses `DatePicker` in edit mode with `dayjs` integration.

### Concerns

- The `birthday` field is editable in the UI but not included in `ProfileUpdateDTO`. It's sent as an extra field in the update payload; the backend should ignore unknown fields gracefully.
- The mock implementation of `updateProfile(_data: any)` ignores the payload, so birthday edits won't persist in mock mode until the real API is connected.

## Fixes

Applied the following fixes based on code review:

1. **Fix 1 -- Error handling in handleSave**: Added `catch (err: any)` block to `handleSave` in `src/pages/Profile/index.tsx` that displays `message.error(err?.message || '保存失败')` on failure. Previously, the `try/finally` only reset saving state but silently swallowed errors.

2. **Fix 2 -- Type safety for editData state**: Changed `useState<Record<string, any>>` to `useState<Partial<ProfileUpdateDTO>>` for both `editData` and `originalData` states in `src/pages/Profile/index.tsx`. Removed the `as ProfileUpdateDTO` cast in the `updateProfile()` call. Added `as any` casts in `renderField` for dynamic field accesses (`birthday` and the `[field]` pattern) since the render field handles arbitrary field keys that extend beyond the `ProfileUpdateDTO` type.

3. **Fix 3 -- Error handling in fetchProfile model**: Added `catch (err: any)` block to `fetchProfile` in `src/models/profile.ts` that logs `console.error('fetchProfile failed:', err)`. Previously, the `try/finally` only reset loading state without catching errors.

4. **isLocked return type**: Added explicit `: boolean` return type with `?? false` fallback to `isLocked()` function to fix `boolean | undefined` assignment errors.

All changes compile without errors (`npx tsc --noEmit` passes for Profile-related files).
