import { useState } from 'react'
import { createReservation, listReservations, fetchConfig } from '../apiClient'
import { sendEmail } from '../utils/email'
import {
  TIME_ZONE,
  formatDateInZone,
  formatTimeInZone,
  getStartOfWeek,
} from '../utils/dateHelpers'

export default function ReservationForm({ start, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [duration, setDuration] = useState(1)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    const startWeek = getStartOfWeek(start)
    const endWeek = new Date(startWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    let existing
    try {
      existing = await listReservations({
        name,
        start: formatDateInZone(startWeek, TIME_ZONE),
        end: formatDateInZone(endWeek, TIME_ZONE),
      })
    } catch {
      setSaving(false)
      setFormError('Erreur lors de la vérification des réservations')
      return
    }
    if (existing.length >= 2) {
      setSaving(false)
      setFormError('Limite de 2 réservations par semaine atteinte')
      return
    }
    const startTimeStr = formatTimeInZone(start, TIME_ZONE)
    const endTimeStr = formatTimeInZone(
      new Date(start.getTime() + duration * 60 * 60 * 1000),
      TIME_ZONE
    )
    try {
      await createReservation({
        name,
        email,
        date: formatDateInZone(start, TIME_ZONE),
        start_time: startTimeStr,
        end_time: endTimeStr,
      })
    } catch {
      setSaving(false)
      setFormError('Erreur lors de la reservation')
      return
    }
    setSaving(false)
    try {
      const cfg = await fetchConfig()
      const dateStr = start.toLocaleString('fr-FR', { timeZone: TIME_ZONE })
      await sendEmail(
        email,
        'Réservation enregistrée',
        `Votre réservation du ${dateStr} est en attente de validation.`
      )
      await sendEmail(
        cfg.adminEmail,
        'Nouvelle réservation',
        `${name} a réservé le ${dateStr}.`
      )
      onSaved()
      onClose()
    } catch {
      // email errors are non fatal
    }
  }

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="form">
        <h3>
          Réserver le{' '}
          {start.toLocaleString('fr-FR', { timeZone: TIME_ZONE })}
        </h3>
        <label htmlFor="name">Nom / Lot</label>
        <input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="duration">Durée (h)</label>
        <input
          id="duration"
          type="number"
          min="1"
          max="3"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
        />
        <div className="actions">
          <button type="submit" disabled={saving}>Réserver</button>
          <button type="button" onClick={onClose}>Annuler</button>
        </div>
        {formError && <p className="form-error">{formError}</p>}
      </form>
    </div>
  )
}
