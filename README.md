# Reservation App

Simple reservation calendar using React with a small Express/SQLite backend.

New reservations are now created in a **pending** state. Pending slots are shown
in orange on the calendar. They can be validated from the reservation details
dialog, turning the slot green.

```
# Install dependencies
npm install

# Start development server
npm run dev
```

Environment variables required:
- `VITE_VALIDATION_PASSWORD`
- `VITE_ADMIN_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `DB_FILE` (optional, SQLite file path)
- `PORT` (optional, defaults to 3001)

The Node server exposes REST endpoints for managing reservations and sending
emails. It stores reservation data in an SQLite database and serves the built
React application from the `dist` directory when running in production.

Copy `.env.example` to `.env` and fill in the actual values for these keys.

To run the server (and enable email notifications), start it with:

```
npm run server
```
