import { useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  TIME_ZONE,
  formatDateInZone,
  formatTimeInZone,
  getStartOfWeek,
} from '../utils/dateHelpers'

export default function ReservationForm({ start, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(1)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    const startWeek = getStartOfWeek(start)
    const endWeek = new Date(startWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    const { data: existing, error: fetchError } = await supabase
      .from('reservations')
      .select('id')
      .eq('name', name)
      .gte('date', formatDateInZone(startWeek, TIME_ZONE))
      .lte('date', formatDateInZone(endWeek, TIME_ZONE))
    if (fetchError) {
      setSaving(false)
      setFormError('Erreur lors de la vérification des réservations')
      return
    }
    if (existing.length >= 2) {
      setSaving(false)
      setFormError('Limite de 2 réservations par semaine atteinte')
      return
    }
    const { error } = await supabase.from('reservations').insert({
      name,
      date: formatDateInZone(start, TIME_ZONE),
      start_time: formatTimeInZone(start, TIME_ZONE),
      end_time: formatTimeInZone(
        new Date(start.getTime() + duration * 60 * 60 * 1000),
        TIME_ZONE
      ),
      status: 'pending',
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
          {start.toLocaleString('fr-FR', { timeZone: TIME_ZONE })}
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
