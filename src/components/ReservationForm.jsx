import { useState } from 'react'
import { supabase } from '../supabaseClient'

const pad = n => String(n).padStart(2, '0')
const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const formatTime = d => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

export default function ReservationForm({ start, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(1)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    const { error } = await supabase.from('reservations').insert({
      name,
      date: formatDate(start),
      start_time: formatTime(start),
      end_time: formatTime(new Date(start.getTime() + duration * 60 * 60 * 1000)),
    })
    setSaving(false)
    if (!error) {
      onSaved()
      onClose()
    } else {
      setFormError('Erreur lors de la reservation')
    }
  }

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="form">
        <h3>
          Réserver le{' '}
          {start.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
        </h3>
        <label htmlFor="name">Nom / Lot</label>
        <input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
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
