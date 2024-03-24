import { PayloadKey } from '@/app/lib/governance/'

interface PayloadKeyProps {
  value: PayloadKey
}

export default function PayloadKey({ value }: PayloadKeyProps) {
  if (typeof value === 'string')
    return `0x${value}`

  return <div>
    <span className="block">Pool Address: 0x{value.poolAddress}</span>
    <span className="block">Sequencer PK: {value.sequencerPublicKey}</span>
  </div>
}