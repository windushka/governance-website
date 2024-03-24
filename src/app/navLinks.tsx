import Link from '@/app/ui/common/link';
import { getAppContext } from '@/app/lib/appContext/getAppContext';
import { getPeriodPageUrl } from './actions';

export default function NavLinks() {
  const context = getAppContext();

  return <div className="flex flex-row gap-4">
    {context.config.contracts.map((contract) => {
      return (
        <Link
          key={contract.name}
          href={getPeriodPageUrl(contract.name)}
        >
          <span className="capitalize">{contract.name}</span>
        </Link>
      );
    })}
  </div>
}
