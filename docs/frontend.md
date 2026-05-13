# Frontend Specification

This frontend supports a teacher-friendly student portfolio interface for SSK school.

## Features

- Login screen with department selection and email validation for @ssk.ac.th users.
- Admin login by selecting `Admin` and using password `adminssk`.
- Home screen with searchable, filterable achievement cards.
- Manage screen showing user-related records and a detail modal.
- Record screen with dynamic competition entries and file upload support.
- All frontend network calls use the single constant `APPSCRIPT_URL` in `frontend/auth.js`.
- Session persistence uses `localStorage` keys `ssk_user_token`, `ssk_user_email`, and `ssk_user_dept`.

## File Structure

- `frontend/auth.js` - token-based login, validation, localStorage session persistence, and retry logic.
- `frontend/app.js` - page wiring, record submission, list rendering, pagination helper, and UI state.
- `src/main.js` - Vite entrypoint that loads `frontend/app.js`.
- `index.html` - page markup and root Vite bootstrap.

## Environment

- `VITE_APPSCRIPT_URL` must be set in Vercel to the deployed Apps Script web app URL.
- `VITE_SHEET_ID` is also configured in Vercel for reference and future backend integration.
