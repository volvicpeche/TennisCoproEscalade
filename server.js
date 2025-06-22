/* eslint-env node */
/* global process */
import express from 'express'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

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

app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
    adminEmail: process.env.VITE_ADMIN_EMAIL,
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Email server running on port ${port}`)
})
