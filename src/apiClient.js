export async function fetchConfig() {
  if (!window.appConfig) {
    const res = await fetch('/api/config')
    window.appConfig = await res.json()
  }
  return window.appConfig
}

export async function listReservations(params = {}) {
  const query = new URLSearchParams(params).toString()
  const res = await fetch('/api/reservations' + (query ? `?${query}` : ''))
  if (!res.ok) throw new Error('Failed to fetch reservations')
  return res.json()
}

export async function createReservation(data) {
  const res = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create reservation')
  return res.json()
}

export async function deleteReservation(id) {
  const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete reservation')
}

export async function validateReservation(id) {
  const res = await fetch(`/api/reservations/${id}/validate`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to validate reservation')
}
