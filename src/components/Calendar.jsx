import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ReservationForm from './ReservationForm'

const openingHour = 8
const closingHour = 21

const pad = n => String(n).padStart(2, '0')
const formatDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function getStartOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

export default function Calendar() {
  const [reservations, setReservations] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  const fetchReservations = async () => {
    const start = getStartOfWeek()
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
    const withDates = data.map(r => ({
      ...r,
      start: new Date(`${r.date}T${r.start_time}`),
      end: new Date(`${r.date}T${r.end_time}`),
    }))
    setReservations(withDates)
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleClick = (day, hour) => {
    const start = new Date(day)
    start.setHours(hour, 0, 0, 0)
    setSelectedSlot(start)
  }

  const closeForm = () => setSelectedSlot(null)

  const hours = []
  for (let h = openingHour; h < closingHour; h++) {
    hours.push(h)
  }

  const startOfWeek = getStartOfWeek()
  const days = [...Array(7).keys()].map(i => {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    return d
  })

  const isReserved = (day, hour) => {
    return reservations.find(r => {
      const start = new Date(r.start)
      return start.getDate() === day.getDate() && start.getHours() === hour
    })
  }

  return (
    <div>
      {errorMsg && <p className="error">{errorMsg}</p>}
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
                    className={reserved ? 'reserved' : 'free'}
                    onClick={() => !reserved && handleClick(day, hour)}
                  >
                    {reserved ? reserved.name : ''}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {selectedSlot && (
        <ReservationForm start={selectedSlot} onClose={closeForm} onSaved={fetchReservations} />
      )}
    </div>
  )
}
