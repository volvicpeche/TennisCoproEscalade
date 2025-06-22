import { useEffect, useState } from 'react'
import './App.css'
import Calendar from './components/Calendar'
import Login from './components/Login'
import { supabase } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>Réservations</h1>
      {session ? (
        <>
          <button type="button" onClick={handleLogout}>
            Se déconnecter
          </button>
          <Calendar />
        </>
      ) : (
        <Login />
      )}
    </div>
  )
}
