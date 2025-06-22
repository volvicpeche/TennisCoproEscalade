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

Copy `.env.example` to `.env` and fill in the actual values for these keys.

To send notification emails, start the email server in another terminal with:

```
npm run server
```
