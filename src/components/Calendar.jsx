import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import ReservationForm from './ReservationForm'

const openingHour = 8
const closingHour = 21

function getStartOfWeek(date = new Date()) {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  return new Date(date.setDate(diff))
}

export default function Calendar() {
  const [reservations, setReservations] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('start', getStartOfWeek().toISOString())
      .lte('start', new Date(getStartOfWeek().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())
    if (!error) setReservations(data)
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
      <table className="calendar">
        <thead>
          <tr>
            <th></th>
            {days.map(d => (
              <th key={d.toDateString()}>{d.toLocaleDateString()}</th>
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
