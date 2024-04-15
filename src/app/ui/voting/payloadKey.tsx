import { PayloadKey as PayloadKeyType } from '@/lib/governance/'

interface PayloadKeyProps {
  value: PayloadKeyType
}

export const PayloadKey = ({ value }: PayloadKeyProps) => {
  if (typeof value === 'string')
    return <span className="break-all">0x{value}</span>

  return <div>
    <span className="block break-all">Pool Address: 0x{value.poolAddress}</span>
    <span className="block break-all">Sequencer PK: {value.sequencerPublicKey}</span>
  </div>
}