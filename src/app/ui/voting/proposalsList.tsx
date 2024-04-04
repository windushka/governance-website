'use client'

import clsx from 'clsx'
import { appTheme, LinkPure, IntValuePure } from '@/app/ui/common'
import { PayloadKey } from './payloadKey'
import { getAppContext } from '@/app/lib/appContext'
import { Proposal, PayloadKey as PayloadKeyType } from '@/app/lib/governance'
import { memo, useState } from 'react'

interface ProposalListProps {
  proposals: Proposal[];
  winnerCandidate: NonNullable<PayloadKeyType> | null;
}

export const ProposalList = ({ proposals, winnerCandidate }: ProposalListProps) => {
  const [showAll, setShowAll] = useState(false);
  const handleShowAllClick = () => {
    setShowAll((v) => !v);
  }
  const defaultVisibleProposalsCount = 2;

  const context = getAppContext();
  const baseItemClassName = 'block flex flex-row justify-between items-center p-2 border';
  const visibleProposals = showAll ? proposals : proposals.slice(0, defaultVisibleProposalsCount);
  const showAllButtonVisible = proposals.length > defaultVisibleProposalsCount;

  return <div className="flex flex-col gap-2 mb-8">
    <ul className="flex flex-col gap-6">
      {visibleProposals.map(p =>
        <li
          key={JSON.stringify(p.key)}
          className={clsx(
            `${baseItemClassName} ${appTheme.componentBgColor}`,
            JSON.stringify(p.key) === JSON.stringify(winnerCandidate) ? appTheme.accentBorderColor : appTheme.borderColor
          )}>
          <div className="flex flex-col">
            <div>
              <PayloadKey value={p.key} />
            </div>
            <span className="mb-1">
              (by <LinkPure className="underline" href={context.explorer.getAccountUrl(p.proposer)} target="_blank">{p.proposer}</LinkPure>)
            </span>
          </div>
          <div className="flex flex-col">
            <span className="mb-1">upvotes:</span>
            <IntValuePure className="text-xl" value={p.upvotesVotingPower} />
          </div>
        </li>)}
    </ul>
    {showAllButtonVisible && <button onClick={handleShowAllClick} className={`${appTheme.textColorHover} inline-block self-center px-4`}>{showAll ? 'show less' : 'show all'}</button>}
  </div>
};

export const ProposalListPure = memo(ProposalList);