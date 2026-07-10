import { useCallback, useEffect, useState } from 'react'
import { CheckInPanel } from '../components/CheckInPanel'
import { AttendanceGauge } from '../components/AttendanceGauge'
import { supabase } from '../lib/supabase'

// 2026년 7월 특별새벽기도회 기간 — yople-admin의 DAWN_PRAYER_DATES와 동일하게 유지
const DAWN_PRAYER_START = '2026-07-13'
const DAWN_PRAYER_END = '2026-07-17'

const GAUGE_MAX = 250
const MILESTONES = [
  { value: 150, label: '선물1' },
  { value: 200, label: '선물2' },
  { value: 230, label: '선물3' },
  { value: 250, label: '선물4' },
]

type Props = {
  onBack?: () => void
}

export default function DawnPrayerCheckIn({ onBack }: Props) {
  const [attendanceCount, setAttendanceCount] = useState(0)

  const fetchCount = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_dawn_prayer_attendance_count', {
      p_start: DAWN_PRAYER_START,
      p_end: DAWN_PRAYER_END,
    })
    if (!error && typeof data === 'number') {
      setAttendanceCount(data)
    }
  }, [])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  return (
    <CheckInPanel
      heading="새벽기도회 출석체크"
      subheading="전화번호 뒷 4자리를 입력하세요"
      background={{ type: 'image', src: '/특새배경.png' }}
      onBack={onBack}
      compact
      topSlot={<AttendanceGauge current={attendanceCount} max={GAUGE_MAX} milestones={MILESTONES} />}
      onAttendanceRecorded={fetchCount}
    />
  )
}
