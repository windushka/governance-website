import { LinkPure } from '@/app/ui/common';
import { getAppContext } from '@/app/lib/appContext/getAppContext';
import { getPeriodPageUrl } from './actions';

export default function NavLinks() {
  const context = getAppContext();

  return <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-center items-center">
    {context.config.contracts.map((contract) => {
      return (
        <LinkPure
          key={contract.name}
          href={getPeriodPageUrl(contract.name)}>
          <span className="capitalize">{contract.name}</span>
        </LinkPure>
      );
    })}
  </div>
}
