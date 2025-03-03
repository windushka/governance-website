'use client'

import clsx from 'clsx'
import { appTheme, LinkPure, IntValuePure, useClientContext, PayloadKey, InformationLink } from '@/app/components'
import { Proposal, PayloadKey as PayloadKeyType } from '@/lib/governance'
import { useState } from 'react'

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

  const context = useClientContext();
  const baseItemClassName = 'flex flex-col gap-4 sm:flex-row justify-between sm:items-center p-2 border';
  const visibleProposals = showAll ? proposals : proposals.slice(0, defaultVisibleProposalsCount);
  const showAllButtonVisible = proposals.length > defaultVisibleProposalsCount;

  return <div className="flex flex-col gap-2 mb-12">
    <ul className="flex flex-col gap-6">
      {visibleProposals.map(p =>
        <li
          key={JSON.stringify(p.key)}
          className={clsx(
            `${baseItemClassName} ${appTheme.componentBgColor}`,
            JSON.stringify(p.key) === JSON.stringify(winnerCandidate) ? appTheme.accentBorderColor : appTheme.borderColor
          )}>
          <div className="flex flex-col gap-1">
            <div>
              <PayloadKey value={p.key} />
            </div>
            <span className={`break-all ${appTheme.disabledTextColor}`}>
              (by <LinkPure className="underline" href={context.explorer.getAccountUrl(p.proposer)} target="_blank">{p.proposer}</LinkPure>)
            </span>
            <InformationLink payloadKey={p.key} />
          </div>
          <div className="flex flex-row sm:flex-col gap-1">
            <span>Upvotes:</span>
            <IntValuePure className="sm:text-xl" value={p.upvotesVotingPower} />
          </div>
        </li>)}
    </ul>
    {showAllButtonVisible && <button onClick={handleShowAllClick} className={`${appTheme.textColorHover} inline-block self-center px-4`}>{showAll ? 'show less' : 'show all'}</button>}
  </div>
};
