import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckInPanel, type AnyMember } from '../components/CheckInPanel'
import { AttendanceGauge } from '../components/AttendanceGauge'
import { supabase } from '../lib/supabase'
import { triggerCelebrationConfetti } from '../lib/confetti'

// 2026년 7월 특별새벽기도회 기간 — yople-admin의 DAWN_PRAYER_DATES와 동일하게 유지
const DAWN_PRAYER_START = '2026-07-13'
const DAWN_PRAYER_END = '2026-07-17'

const GAUGE_MAX = 170
const MILESTONES = [
  { value: 100, label: '선물1' },
  { value: 130, label: '선물2' },
  { value: 150, label: '선물3' },
  { value: 170, label: '선물4' },
]

type Props = {
  onBack?: () => void
}

export default function DawnPrayerCheckIn({ onBack }: Props) {
  const [attendanceCount, setAttendanceCount] = useState(0)
  const prevCountRef = useRef(0)

  const fetchCount = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_dawn_prayer_attendance_count', {
      p_start: DAWN_PRAYER_START,
      p_end: DAWN_PRAYER_END,
    })
    if (!error && typeof data === 'number') {
      setAttendanceCount(data)
      return data
    }
    return null
  }, [])

  useEffect(() => {
    fetchCount().then((count) => {
      if (count != null) prevCountRef.current = count
    })
  }, [fetchCount])

  const handleMemberCheckedIn = useCallback(async (member: AnyMember) => {
    const prevCount = prevCountRef.current
    const newCount = await fetchCount()
    if (newCount == null) return undefined
    prevCountRef.current = newCount

    const milestone = MILESTONES.find((m) => prevCount < m.value && newCount >= m.value)
    if (milestone) {
      triggerCelebrationConfetti()
      return `${member.name}님 출석 완료\n🎉새벽기도회 ${milestone.value}명 출석 달성!`
    }
    return `${member.name}님까지 새벽기도회에 ${newCount}명이 출석했어요!`
  }, [fetchCount])

  return (
    <CheckInPanel
      heading="새벽기도회 출석체크"
      subheading="전화번호 뒷 4자리를 입력하세요"
      background={{ type: 'image', src: '/특새배경.png' }}
      onBack={onBack}
      topSlot={<AttendanceGauge current={attendanceCount} max={GAUGE_MAX} milestones={MILESTONES} />}
      onMemberCheckedIn={handleMemberCheckedIn}
      birthdayCheck="day"
    />
  )
}
