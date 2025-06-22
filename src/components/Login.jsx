import { supabase } from '../supabaseClient'

export default function Login() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook' })
  }

  return (
    <div className="login">
      <h2>Connexion</h2>
      <button type="button" onClick={handleLogin}>
        Se connecter avec Facebook
      </button>
    </div>
  )
}
