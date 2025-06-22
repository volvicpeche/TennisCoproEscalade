# Reservation App

Simple reservation calendar using React and Supabase.

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
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_VALIDATION_PASSWORD`
- `VITE_ADMIN_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `PORT` (optional, defaults to 3001)

The Node server uses Express to expose an API for sending emails and to provide
the Supabase configuration values at `/api/config`. It also serves the built
React application from the `dist` directory when running in production.

Copy `.env.example` to `.env` and fill in the actual values for these keys.

To run the server (and enable email notifications), start it with:

```
npm run server
```
