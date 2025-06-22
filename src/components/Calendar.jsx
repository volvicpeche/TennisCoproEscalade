import { useEffect, useState, useCallback } from 'react'
import { getSupabase } from '../supabaseClient'
import { sendEmail } from '../utils/email'
import ReservationForm from './ReservationForm'
import {
  TIME_ZONE,
  createZonedDate,
  formatDateInZone,
  getStartOfWeek,
} from '../utils/dateHelpers'

const VALIDATION_PASSWORD = import.meta.env.VITE_VALIDATION_PASSWORD

const openingHour = 8
const closingHour = 21

const MIN_WEEK_OFFSET = 0
const MAX_WEEK_OFFSET = 1

const formatDate = d => formatDateInZone(d)

export default function Calendar() {
  const [reservations, setReservations] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [weekOffset, setWeekOffset] = useState(MIN_WEEK_OFFSET)

  const fetchReservations = useCallback(async () => {
    const supabase = await getSupabase()
    const start = getStartOfWeek()
    start.setDate(start.getDate() + weekOffset * 7)
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('date', formatDate(start))
      .lte('date', formatDate(end))
    if (error) {
      console.error(error.message)
      // optionally set an error state for UI feedback
      setErrorMsg('Erreur lors du chargement des réservations')
      return
    }
    setErrorMsg(null)
    const withDates = data.map(r => {
      const [sh, sm, ss] = r.start_time.split(':').map(Number)
      const [eh, em, es] = r.end_time.split(':').map(Number)
      return {
        ...r,
        start: createZonedDate(new Date(r.date), sh, sm, ss, TIME_ZONE),
        end: createZonedDate(new Date(r.date), eh, em, es, TIME_ZONE),
        startHour: sh,
        dateStr: r.date,
      }
    })
    setReservations(withDates)
  }, [weekOffset])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const handleClick = (day, hour) => {
    const start = createZonedDate(day, hour, 0, 0, TIME_ZONE)
    setSelectedSlot(start)
  }

  const closeForm = () => setSelectedSlot(null)

  const closeReservationDetails = () => setSelectedReservation(null)

  const handleDelete = async reservation => {
    if (!window.confirm('Annuler cette réservation ?')) return
    const supabase = await getSupabase()
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservation.id)
    if (error) {
      console.error(error.message)
      setErrorMsg("Erreur lors de l'annulation")
      return
    }
    setErrorMsg(null)
    const dateStr = reservation.start.toLocaleString('fr-FR', { timeZone: TIME_ZONE })
    await sendEmail(
      reservation.email,
      'Réservation annulée',
      `Votre réservation du ${dateStr} a été annulée.`
    )
    await sendEmail(
      import.meta.env.VITE_ADMIN_EMAIL,
      'Réservation annulée',
      `La réservation de ${reservation.name} du ${dateStr} a été annulée.`
    )
    closeReservationDetails()
    fetchReservations()
  }

  const handleValidate = async reservation => {
    const pwd = window.prompt('Mot de passe pour valider :')
    if (pwd !== VALIDATION_PASSWORD) {
      setErrorMsg('Mot de passe incorrect')
      return
    }
    const supabase = await getSupabase()
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'validated' })
      .eq('id', reservation.id)
    if (error) {
      console.error(error.message)
      setErrorMsg("Erreur lors de la validation")
      return
    }
    setErrorMsg(null)
    const dateStr = reservation.start.toLocaleString('fr-FR', { timeZone: TIME_ZONE })
    await sendEmail(
      reservation.email,
      'Réservation validée',
      `Votre réservation du ${dateStr} a été validée.`
    )
    await sendEmail(
      import.meta.env.VITE_ADMIN_EMAIL,
      'Réservation validée',
      `La réservation de ${reservation.name} du ${dateStr} a été validée.`
    )
    closeReservationDetails()
    fetchReservations()
  }

  const hours = []
  for (let h = openingHour; h < closingHour; h++) {
    hours.push(h)
  }

  const startOfWeek = getStartOfWeek()
  startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7)
  const days = [...Array(7).keys()].map(i => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })

  const isReserved = (day, hour) => {
    const dayStr = formatDate(day)
    return reservations.find(r => r.dateStr === dayStr && r.startHour === hour)
  }

  return (
    <div>
      {errorMsg && <p className="error">{errorMsg}</p>}
      <div className="week-nav">
        <button
          type="button"
          onClick={() => setWeekOffset(Math.max(MIN_WEEK_OFFSET, weekOffset - 1))}
          disabled={weekOffset <= MIN_WEEK_OFFSET}
        >
          &lt;
        </button>
        <span>
          {days[0].toLocaleDateString('fr-FR', { timeZone: TIME_ZONE })} -{' '}
          {days[6].toLocaleDateString('fr-FR', { timeZone: TIME_ZONE })}
        </span>
        <button
          type="button"
          onClick={() => setWeekOffset(Math.min(MAX_WEEK_OFFSET, weekOffset + 1))}
          disabled={weekOffset >= MAX_WEEK_OFFSET}
        >
          &gt;
        </button>
      </div>
      <div className="calendar-wrapper">
        <table className="calendar">
        <thead>
          <tr>
            <th></th>
            {days.map(d => (
              <th key={d.toDateString()}>
                {d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td>{hour}h</td>
              {days.map(day => {
                const reserved = isReserved(day, hour)
                return (
                  <td
                    key={day.toDateString() + hour}
                    className={
                      reserved ? `reserved ${reserved.status || ''}` : 'free'
                    }
                    onClick={() =>
                      reserved
                        ? setSelectedReservation(reserved)
                        : handleClick(day, hour)
                    }
                  >
                    {reserved ? reserved.name : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      {selectedSlot && (
        <ReservationForm start={selectedSlot} onClose={closeForm} onSaved={fetchReservations} />
      )}
      {selectedReservation && (
        <div className="modal">
          <div className="form">
            <h3>Réservation de {selectedReservation.name}</h3>
            <p>
              {selectedReservation.start.toLocaleString('fr-FR', { timeZone: TIME_ZONE })}
            </p>
            <div className="actions">
              {selectedReservation.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => handleValidate(selectedReservation)}
                >
                  Valider
                </button>
              )}
              <button type="button" onClick={() => handleDelete(selectedReservation)}>
                Annuler
              </button>
              <button type="button" onClick={closeReservationDetails}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
