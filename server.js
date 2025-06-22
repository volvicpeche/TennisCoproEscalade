/* eslint-env node */
/* global process */
import express from 'express'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbFile = process.env.DB_FILE || path.join(__dirname, 'reservations.db')
const db = new sqlite3.Database(dbFile)
const dbRun = promisify(db.run.bind(db))
const dbAll = promisify(db.all.bind(db))

db.run(`CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL
)`)

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

app.get('/api/reservations', async (req, res) => {
  const { start, end, name } = req.query
  try {
    let query = 'SELECT * FROM reservations WHERE 1=1'
    const params = []
    if (start) { query += ' AND date >= ?'; params.push(start) }
    if (end) { query += ' AND date <= ?'; params.push(end) }
    if (name) { query += ' AND name = ?'; params.push(name) }
    const rows = await dbAll(query, params)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reservations' })
  }
})

app.post('/api/reservations', async (req, res) => {
  const { name, email, date, start_time, end_time, status = 'pending' } = req.body
  try {
    const result = await dbRun(
      'INSERT INTO reservations (name, email, date, start_time, end_time, status) VALUES (?,?,?,?,?,?)',
      [name, email, date, start_time, end_time, status]
    )
    res.status(201).json({ id: result.lastID })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create reservation' })
  }
})

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM reservations WHERE id = ?', [req.params.id])
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete reservation' })
  }
})

app.post('/api/reservations/:id/validate', async (req, res) => {
  try {
    await dbRun('UPDATE reservations SET status = "validated" WHERE id = ?', [req.params.id])
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to validate reservation' })
  }
})

app.get('/api/config', (req, res) => {
  res.json({
    adminEmail: process.env.VITE_ADMIN_EMAIL,
  })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
