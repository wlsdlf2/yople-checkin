import { useEffect, useState } from 'react'
import CheckIn from './pages/CheckIn'
import LockScreen from './pages/LockScreen'
import { supabase } from './lib/supabase'

type AppState = 'loading' | 'locked' | 'unlocked'

function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [passwordHash, setPasswordHash] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.rpc('get_kiosk_settings')

      if (error || !data) {
        setAppState('unlocked')
        return
      }

      const map: Record<string, string> = {}
      for (const row of data) {
        map[row.key] = row.value
      }

      if (map['lock_enabled'] === 'true' && map['lock_password_hash']) {
        setPasswordHash(map['lock_password_hash'])
        setAppState('locked')
      } else {
        setAppState('unlocked')
      }
    }
    init()
  }, [])

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-500">불러오는 중…</p>
      </div>
    )
  }

  if (appState === 'locked') {
    return (
      <LockScreen
        passwordHash={passwordHash}
        onUnlock={() => setAppState('unlocked')}
      />
    )
  }

  return <CheckIn />
}

export default App
