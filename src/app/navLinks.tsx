import Link from '@/app/ui/common/link';
import { createAppContext } from '@/app/lib/appContext/createAppContext';

export default function NavLinks() {
  const context = createAppContext();

  return <div className="flex flex-row gap-4">
    {context.config.contracts.map((contract) => {
      return (
        <Link
          key={contract.name}
          href={`/${contract.name}/period`}
        >
          <span className="capitalize">{contract.name}</span>
        </Link>
      );
    })}
  </div>
}
