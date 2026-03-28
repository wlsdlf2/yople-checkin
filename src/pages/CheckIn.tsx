import { useState, useCallback } from 'react'
import { Keypad } from '../components/Keypad'
import { supabase } from '../lib/supabase'

type Member = { id: string; name: string; phone: string }

function todayString(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function CheckIn() {
  const [digits, setDigits] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [matches, setMatches] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [showVisitor, setShowVisitor] = useState(false)

  const clearAfterDelay = useCallback(() => {
    const t = setTimeout(() => {
      setDigits('')
      setMatches([])
      setMessage(null)
      setShowVisitor(false)
    }, 2800)
    return () => clearTimeout(t)
  }, [])

  const showMsg = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text })
    clearAfterDelay()
  }, [clearAfterDelay])

  const recordAttendance = useCallback(async (memberId: string, memberName: string) => {
    const today = todayString()
    try {
      const { error } = await supabase.from('attendances').insert({
        member_id: memberId,
        date: today,
      })
      if (error) {
        if (error.code === '23505') {
          showMsg('info', '이미 오늘 출석 처리되었습니다.')
        } else {
          showMsg('error', '출석 처리에 실패했습니다.')
        }
        return
      }
      showMsg('success', `${memberName}님 출석 완료`)
      setMatches([])
      setDigits('')
      setShowVisitor(false)
    } catch {
      showMsg('error', '출석 처리에 실패했습니다.')
    }
  }, [showMsg])

  const recordVisitor = useCallback(async () => {
    const today = todayString()
    setLoading(true)
    try {
      const { error } = await supabase.from('visitors').insert({ date: today })
      if (error) {
        showMsg('error', '방문자 등록에 실패했습니다.')
        return
      }
      showMsg('success', '방문자로 등록되었습니다.')
      setDigits('')
      setMatches([])
      setShowVisitor(false)
    } catch {
      showMsg('error', '방문자 등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [showMsg])

  const searchMembers = useCallback(async (fourDigits: string) => {
    if (fourDigits.length !== 4) return
    setLoading(true)
    setMatches([])
    setShowVisitor(false)
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, phone')
        .ilike('phone', `%${fourDigits}`)

      if (error) {
        showMsg('error', '조회에 실패했습니다.')
        return
      }
      const list = (data ?? []) as Member[]
      if (list.length === 0) {
        setShowVisitor(true)
        setMessage({ type: 'info', text: '등록된 번호가 없습니다. 방문자로 등록할까요?' })
      } else if (list.length === 1) {
        await recordAttendance(list[0].id, list[0].name)
      } else {
        setMatches(list)
        setMessage(null)
      }
    } catch {
      showMsg('error', '조회에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [recordAttendance, showMsg])

  const handleDigitsChange = (next: string) => {
    setDigits(next)
    if (next.length === 4) {
      searchMembers(next)
    } else {
      setMatches([])
      setShowVisitor(false)
      setMessage(null)
    }
  }

  const handleReset = useCallback(() => {
    setDigits('')
    setMatches([])
    setMessage(null)
    setShowVisitor(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">출석 체크</h1>
      <p className="text-slate-600 mb-4">전화번호 뒷 4자리를 입력하세요</p>

      {!showVisitor && (
        <button
          type="button"
          disabled={loading}
          onClick={recordVisitor}
          className="w-full max-w-sm min-h-[52px] rounded-xl bg-primary text-white text-lg font-semibold hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 mb-6"
        >
          방문자로 출석
        </button>
      )}

      <div className="w-full max-w-sm mb-6 sm:mb-8">
        <div className="h-16 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-2xl sm:text-3xl font-mono tracking-[0.4em] text-slate-800 mb-4">
          {digits.padEnd(4, '·')}
        </div>

        {message && (
          <p
            className={`text-center text-lg font-medium mb-4 rounded-xl py-3 px-4 ${
              message.type === 'success'
                ? 'bg-green-100 text-primary-dark'
                : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
            }`}
          >
            {message.text}
          </p>
        )}

        {matches.length > 1 && (
          <div className="mb-4 space-y-2">
            <p className="text-slate-600 text-sm font-medium mb-2">본인을 선택하세요</p>
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={loading}
                onClick={() => recordAttendance(m.id, m.name)}
                className="w-full min-h-[56px] rounded-xl bg-white border-2 border-slate-200 text-lg font-medium text-slate-800 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50"
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {showVisitor && (
          <button
            type="button"
            disabled={loading}
            onClick={recordVisitor}
            className="w-full min-h-[56px] rounded-xl bg-primary text-white text-lg font-semibold hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50 mb-4"
          >
            방문자로 등록
          </button>
        )}
      </div>

      <Keypad value={digits} onChange={handleDigitsChange} maxLength={4} disabled={loading} onReset={handleReset} />
    </div>
  )
}
