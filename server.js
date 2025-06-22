/* eslint-env node */
/* global process */
import express from 'express'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text } = req.body
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.VITE_ADMIN_EMAIL,
      to,
      subject,
      text,
    })
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Email send failed' })
  }
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Email server running on port ${port}`)
})
