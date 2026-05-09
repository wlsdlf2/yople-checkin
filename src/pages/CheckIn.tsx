import { useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { Keypad } from '../components/Keypad'
import { supabase } from '../lib/supabase'

type AnyMember = {
  id: string
  name: string
  phone: string
  birth_date: string | null
  source: 'member' | 'pastoral'
  role?: string | null
}

function isBirthdayThisWeek(birthDate: string | null): boolean {
  if (!birthDate) return false
  const today = new Date()
  const dow = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dow)
  const [, bMonth, bDay] = birthDate.split('-').map(Number)
  for (let i = 0; i <= 6; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    if (d.getMonth() + 1 === bMonth && d.getDate() === bDay) return true
  }
  return false
}

function triggerBirthdayConfetti() {
  confetti({ particleCount: 100, angle: 45, spread: 40, origin: { x: 0.1, y: 0.75 }, startVelocity: 45 })
  confetti({ particleCount: 100, angle: 135, spread: 40, origin: { x: 0.9, y: 0.75 }, startVelocity: 45 })
}

function todayString(): string {
  // KST(UTC+9) 기준 날짜 반환 — toISOString()은 UTC 기준이라 자정 전후 날짜가 어긋남
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return kst.toISOString().slice(0, 10)
}

export default function CheckIn() {
  const [digits, setDigits] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [matches, setMatches] = useState<AnyMember[]>([])
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

  const recordAttendance = useCallback(async (member: AnyMember) => {
    const today = todayString()
    try {
      const { data, error } = await supabase.rpc('record_attendance', {
        p_member_id: member.id,
        p_source: member.source,
        p_date: today,
      })
      if (error) {
        showMsg('error', '출석 처리에 실패했습니다.')
        return
      }
      if (!(data as { success: boolean }).success) {
        showMsg('info', '이미 오늘 출석 처리되었습니다.')
        return
      }
      if (isBirthdayThisWeek(member.birth_date)) {
        triggerBirthdayConfetti()
        showMsg('success', `🎂 ${member.name}님, 생일 축하해요! 출석 완료`)
      } else {
        showMsg('success', `${member.name}님 출석 완료`)
      }
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
      const { data, error } = await supabase.rpc('record_visitor', { p_date: today })
      if (error || !(data as { success: boolean } | null)?.success) {
        showMsg('error', '방문자 출석에 실패했습니다.')
        return
      }
      showMsg('success', '방문자로 출석되었습니다.')
      setDigits('')
      setMatches([])
      setShowVisitor(false)
    } catch {
      showMsg('error', '방문자 출석에 실패했습니다.')
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
      const { data, error } = await supabase.rpc('search_members_by_phone_suffix', { suffix: fourDigits })

      if (error) {
        showMsg('error', '조회에 실패했습니다.')
        return
      }
      const list: AnyMember[] = ((data ?? []) as Array<{
        id: string; name: string; phone: string; birth_date: string | null; source: string; role: string | null
      }>).map(row => ({ ...row, source: row.source as 'member' | 'pastoral' }))
      if (list.length === 0) {
        setShowVisitor(true)
      } else if (list.length === 1) {
        await recordAttendance(list[0])
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-8" style={{ zoom: 1.0 }}>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">출석 체크</h1>
      <p className="text-slate-600 text-xl mb-4">전화번호 뒷 4자리를 입력하세요</p>

      <div className="w-full max-w-sm mb-3 sm:mb-4">
        <div className="h-16 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center gap-4 text-2xl sm:text-3xl font-mono mb-0">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className={digits[i] ? 'text-slate-800' : 'text-slate-300'}>
              {digits[i] ?? '_'}
            </span>
          ))}
        </div>

        {message && !showVisitor && (
          <p
            className={`text-center text-lg font-medium mt-4 mb-1 rounded-xl py-3 px-4 ${
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
          <div className="mt-2 mb-0 space-y-2">
            <p className="text-slate-600 text-sm font-medium mb-2">본인을 선택하세요</p>
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={loading}
                onClick={() => recordAttendance(m)}
                className="w-full min-h-[56px] rounded-xl bg-white border-2 border-slate-200 text-lg font-medium text-slate-800 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50"
              >
                {m.name}{m.role ? ` (${m.role})` : ''}
              </button>
            ))}
          </div>
        )}

        {showVisitor && (
          <div className="mb-0 rounded-2xl bg-white shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-center text-base font-semibold text-slate-700">
                등록된 번호가 없습니다
              </p>
            </div>
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-1">처음 오셨나요?</p>
              <p className="text-sm text-slate-500">
                오른쪽 새가족 등록처로 오시면 안내드리겠습니다.
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-slate-700 mb-1">등록 없이 방문하셨나요?</p>
              <p className="text-sm text-slate-500 mb-3">
                아래 버튼을 눌러 출석해 주세요.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={recordVisitor}
                className="w-full min-h-[52px] rounded-xl bg-primary text-white text-lg font-semibold hover:bg-primary-dark active:scale-[0.99] disabled:opacity-50"
              >
                방문자로 출석
              </button>
            </div>
          </div>
        )}
      </div>

      <Keypad value={digits} onChange={handleDigitsChange} maxLength={4} disabled={loading} onReset={handleReset} />

    </div>
  )
}
