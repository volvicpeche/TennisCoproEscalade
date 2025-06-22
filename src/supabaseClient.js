import { createClient } from '@supabase/supabase-js'

let clientPromise

export async function getSupabase() {
  if (!clientPromise) {
    clientPromise = fetch('/api/config')
      .then(res => res.json())
      .then(cfg => createClient(cfg.supabaseUrl, cfg.supabaseAnonKey))
  }
  return clientPromise
}
