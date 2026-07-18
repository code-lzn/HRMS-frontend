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
