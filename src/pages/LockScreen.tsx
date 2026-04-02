import { useState } from 'react'

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
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password || loading) return
    setLoading(true)
    setError('')

    const hash = await sha256(password)
    if (hash === passwordHash) {
      onUnlock()
    } else {
      setError('비밀번호가 올바르지 않습니다.')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">잠금 화면</h1>
          <p className="text-slate-600">비밀번호를 입력하세요</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="비밀번호"
          autoFocus
          className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 text-lg text-center text-slate-800 focus:outline-none focus:border-primary"
        />

        {error && (
          <p className="text-center font-medium bg-red-100 text-red-800 py-3 px-4 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !password}
          className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-semibold hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  )
}
