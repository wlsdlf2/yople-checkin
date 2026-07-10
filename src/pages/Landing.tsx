type Props = {
  onSelectSunday: () => void
  onSelectDawnPrayer: () => void
}

export default function Landing({ onSelectSunday, onSelectDawnPrayer }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 sm:p-8 gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">출석 체크 화면 선택</h1>

      <button
        type="button"
        onClick={onSelectSunday}
        className="w-full max-w-sm min-h-[88px] rounded-2xl bg-white border-2 border-slate-200 text-xl font-semibold text-slate-800 shadow-sm hover:border-primary hover:bg-slate-50 active:scale-[0.99]"
      >
        주일 출석 체크
      </button>

      <button
        type="button"
        onClick={onSelectDawnPrayer}
        className="w-full max-w-sm min-h-[88px] rounded-2xl bg-primary text-white text-xl font-semibold shadow-sm hover:bg-primary-dark active:scale-[0.99]"
      >
        특별새벽기도회 출석체크
      </button>
    </div>
  )
}
