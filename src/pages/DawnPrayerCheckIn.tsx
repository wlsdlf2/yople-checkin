import { CheckInPanel } from '../components/CheckInPanel'

type Props = {
  onBack?: () => void
}

export default function DawnPrayerCheckIn({ onBack }: Props) {
  return (
    <CheckInPanel
      heading="새벽기도회 출석체크"
      subheading="전화번호 뒷 4자리를 입력하세요"
      background={{ type: 'image', src: '/특새배경.png' }}
      onBack={onBack}
    />
  )
}
