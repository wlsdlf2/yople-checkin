import { useEffect, useState } from 'react'
import CheckIn from './pages/CheckIn'
import DawnPrayerCheckIn from './pages/DawnPrayerCheckIn'
import Landing from './pages/Landing'
import LockScreen from './pages/LockScreen'
import { supabase } from './lib/supabase'

type AppState = 'loading' | 'locked' | 'select' | 'sunday' | 'dawn-prayer'

function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [passwordHash, setPasswordHash] = useState('')
  const [dawnPrayerEnabled, setDawnPrayerEnabled] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.rpc('get_kiosk_settings')

      if (error || !data) {
        setAppState('select')
        return
      }

      const map: Record<string, string> = {}
      for (const row of data) {
        map[row.key] = row.value
      }

      const dawnEnabled = map['dawn_prayer_enabled'] !== 'false'
      setDawnPrayerEnabled(dawnEnabled)

      if (map['lock_enabled'] === 'true' && map['lock_password_hash']) {
        setPasswordHash(map['lock_password_hash'])
        setAppState('locked')
      } else {
        setAppState(dawnEnabled ? 'select' : 'sunday')
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
        onUnlock={() => setAppState(dawnPrayerEnabled ? 'select' : 'sunday')}
      />
    )
  }

  if (appState === 'sunday') {
    return <CheckIn onBack={dawnPrayerEnabled ? () => setAppState('select') : undefined} />
  }

  if (appState === 'dawn-prayer') {
    return <DawnPrayerCheckIn onBack={() => setAppState('select')} />
  }

  return (
    <Landing
      onSelectSunday={() => setAppState('sunday')}
      onSelectDawnPrayer={() => setAppState('dawn-prayer')}
    />
  )
}

export default App
