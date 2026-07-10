type Milestone = {
  value: number
  label: string
}

type AttendanceGaugeProps = {
  current: number
  max: number
  milestones: Milestone[]
}

export function AttendanceGauge({ current, max, milestones }: AttendanceGaugeProps) {
  const pct = Math.min(100, (current / max) * 100)

  return (
    <div className="w-full max-w-xl bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500">누적 출석 인원</span>
        <span className="text-sm font-bold text-primary-dark">
          {current.toLocaleString()} <span className="text-slate-400 font-medium">/ {max.toLocaleString()}명</span>
        </span>
      </div>

      <div className="relative w-full h-4 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        {milestones.map((m) => (
          <div
            key={m.value}
            className="absolute top-0 bottom-0 w-px bg-white/70"
            style={{ left: `${(m.value / max) * 100}%` }}
          />
        ))}
      </div>

      {/* 각 목표 인원 지점 바로 아래에 선물 아이콘 + 라벨을 함께 배치 */}
      <div className="relative w-full h-11 mt-0.5">
        {milestones.map((m) => {
          const achieved = current >= m.value
          return (
            <div
              key={m.value}
              className="absolute top-0 flex flex-col items-center gap-0.5"
              style={{ left: `${(m.value / max) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <span className={`text-base leading-none ${achieved ? '' : 'grayscale opacity-40'}`}>🎁</span>
              <span className={`text-[9px] leading-tight font-semibold whitespace-nowrap ${achieved ? 'text-primary-dark' : 'text-slate-400'}`}>
                {m.label}
              </span>
              <span className={`text-[9px] leading-tight whitespace-nowrap ${achieved ? 'text-slate-600' : 'text-slate-400'}`}>
                {m.value}명
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
