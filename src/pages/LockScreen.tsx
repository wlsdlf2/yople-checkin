import { useState } from 'react'
import { Keypad } from '../components/Keypad'

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

type Props = {
  passwordHash: string
  onUnlock: () => void
}

export default function LockScreen({ passwordHash, onUnlock }: Props) {
  const [digits, setDigits] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!digits || loading) return
    setLoading(true)
    setError('')

    const hash = await sha256(digits)
    if (hash === passwordHash) {
      onUnlock()
    } else {
      setError('비밀번호가 올바르지 않습니다.')
      setDigits('')
    }
    setLoading(false)
  }

  const handleReset = () => {
    setDigits('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">잠금 화면</h1>
      <p className="text-slate-600 mb-4">비밀번호를 입력하세요</p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !digits}
        className="w-full max-w-sm min-h-[52px] rounded-xl bg-primary text-white text-lg font-semibold hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 mb-6 transition-colors"
      >
        확인
      </button>

      <div className="w-full max-w-sm mb-6 sm:mb-8">
        <div className="h-16 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-3xl sm:text-4xl tracking-[0.5em] text-slate-800 mb-4">
          {'•'.repeat(digits.length) || <span className="text-slate-300 text-2xl tracking-normal">비밀번호</span>}
        </div>

        {error && (
          <p className="text-center text-lg font-medium mb-4 rounded-xl py-3 px-4 bg-red-100 text-red-800">
            {error}
          </p>
        )}
      </div>

      <Keypad
        value={digits}
        onChange={v => { setDigits(v); setError('') }}
        maxLength={20}
        disabled={loading}
        onReset={handleReset}
      />
    </div>
  )
}
