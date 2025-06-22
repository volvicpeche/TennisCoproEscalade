export async function sendEmail(to, subject, text) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text }),
    })
  } catch (err) {
    console.error('Failed to send email', err)
  }
}
