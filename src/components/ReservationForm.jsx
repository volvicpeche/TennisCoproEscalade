import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ReservationForm({ start, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [duration, setDuration] = useState(1)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('reservations').insert({
      name,
      start: start.toISOString(),
      end: new Date(start.getTime() + duration * 60 * 60 * 1000).toISOString(),
    })
    setSaving(false)
    if (!error) {
      onSaved()
      onClose()
    } else {
      alert('Erreur lors de la reservation')
    }
  }

  return (
    <div className="modal">
      <form onSubmit={handleSubmit} className="form">
        <h3>Réserver le {start.toLocaleString()}</h3>
        <label>
          Nom / Lot
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Durée (h)
          <input
            type="number"
            min="1"
            max="3"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={saving}>Réserver</button>
          <button type="button" onClick={onClose}>Annuler</button>
        </div>
      </form>
    </div>
  )
}
