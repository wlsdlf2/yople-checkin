type KeypadProps = {
  value: string
  onChange: (value: string) => void
  maxLength?: number
  disabled?: boolean
  onReset?: () => void
}

const ROW1 = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
]
const ROW2 = [
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
]
const ROW3 = [
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
]

function BackspaceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7 sm:w-8 sm:h-8"
      aria-hidden
    >
      <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" />
    </svg>
  )
}

export function Keypad({ value, onChange, maxLength = 4, disabled = false, onReset }: KeypadProps) {
  const handleDigit = (digit: string) => {
    if (disabled || value.length >= maxLength) return
    onChange(value + digit)
  }

  const handleBackspace = () => {
    if (disabled) return
    onChange(value.slice(0, -1))
  }

  const renderDigitKey = (item: { digit: string; letters: string }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => handleDigit(item.digit)}
      className="min-h-[80px] sm:min-h-[88px] w-full rounded-2xl bg-white text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border border-slate-200/80 flex flex-col items-center justify-center select-none touch-manipulation active:scale-[0.97] disabled:opacity-50 hover:bg-slate-50"
    >
      <span className="text-3xl sm:text-4xl font-semibold leading-none">{item.digit}</span>
      {item.letters && (
        <span className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 tracking-wider uppercase">
          {item.letters}
        </span>
      )}
    </button>
  )

  return (
    <div className="w-full max-w-sm mx-auto bg-gray-200 rounded-3xl p-3 sm:p-4 gap-3 grid grid-cols-3">
      {ROW1.map((item) => (
        <div key={item.digit} className="min-h-[80px] sm:min-h-[88px]">
          {renderDigitKey(item)}
        </div>
      ))}
      {ROW2.map((item) => (
        <div key={item.digit} className="min-h-[80px] sm:min-h-[88px]">
          {renderDigitKey(item)}
        </div>
      ))}
      {ROW3.map((item) => (
        <div key={item.digit} className="min-h-[80px] sm:min-h-[88px]">
          {renderDigitKey(item)}
        </div>
      ))}
      {/* Row 4: 초기화 | 0 | 삭제 */}
      <div className="min-h-[80px] sm:min-h-[88px]">
        <button
          type="button"
          disabled={disabled || !onReset}
          onClick={onReset}
          className="min-h-[80px] sm:min-h-[88px] w-full rounded-2xl bg-white text-slate-600 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border border-slate-200/80 flex items-center justify-center select-none touch-manipulation active:scale-[0.97] disabled:opacity-50 hover:bg-slate-50 text-sm sm:text-base font-medium"
          aria-label="초기화"
        >
          초기화
        </button>
      </div>
      <div className="min-h-[80px] sm:min-h-[88px]">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleDigit('0')}
          className="min-h-[80px] sm:min-h-[88px] w-full rounded-2xl bg-white text-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border border-slate-200/80 flex flex-col items-center justify-center select-none touch-manipulation active:scale-[0.97] disabled:opacity-50 hover:bg-slate-50"
        >
          <span className="text-3xl sm:text-4xl font-semibold leading-none">0</span>
        </button>
      </div>
      <div className="min-h-[80px] sm:min-h-[88px]">
        <button
          type="button"
          disabled={disabled}
          onClick={handleBackspace}
          className="min-h-[80px] sm:min-h-[88px] w-full rounded-2xl bg-white text-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.08)] border border-slate-200/80 flex items-center justify-center select-none touch-manipulation active:scale-[0.97] disabled:opacity-50 hover:bg-slate-50"
          aria-label="삭제"
        >
          <BackspaceIcon />
        </button>
      </div>
    </div>
  )
}
