import { LinkPure } from '@/app/components';
import { getAppContext } from '@/lib/appContext';
import { getPeriodPageUrl } from '@/app/actions';

export const NavLinks = async () => {
  const context = getAppContext();
  const currentBlockLevel = await context.blockchain.getCurrentBlockLevel();
  const contracts = context.getContracts(currentBlockLevel);
  
  return <div className="flex flex-row flex-wrap gap-x-4 gap-y-2 justify-center items-center">
    {contracts.map((contract) => {
      return (
        <LinkPure
          key={contract.name}
          href={getPeriodPageUrl(contract.name)}>
          <span className="capitalize">{contract.name}</span>
        </LinkPure>
      );
    })}
  </div>
};
