import { ProposalPeriod, GovernanceConfig } from '@/app/lib/governance';
import { getProposalQuorumPercent, natToPercent, formatDateTimeCompact } from '@/app/lib/governance/utils';
import BigNumber from 'bignumber.js'
import clsx from 'clsx';
import PayloadKey from './payloadKey';
import { getAppContext } from '@/app/lib/appContext';
import { ProgressPure, LinkPure, NoDataPure, IntValuePure } from '@/app/ui/common';

interface ProposalStateProps {
  proposalPeriod: ProposalPeriod;
  config: GovernanceConfig;
}

export default function ProposalState({ proposalPeriod, config }: ProposalStateProps) {
  if (!proposalPeriod.proposals.length)
    return <NoDataPure text="No proposals" />

  const context = getAppContext();
  const minimumProposalQuorum = natToPercent(config.proposalQuorum, config.scale);

  const proposalList = <ul>
    {proposalPeriod.proposals.map(p =>
      <li key={JSON.stringify(p.key)} className={clsx("block flex flex-row justify-between items-center py-8 px-8 border mb-4", JSON.stringify(p.key) === JSON.stringify(proposalPeriod.winnerCandidate) ? 'border-emerald-400' : 'border-slate-500')}>
        <div className="flex flex-col">
          <span className="mb-1">
            Proposer: {p.proposer}
          </span>
          <div className="text-xl">
            <PayloadKey value={p.key} />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="mb-1">upvotes:</span>
          <IntValuePure className="text-xl" value={p.upvotesVotingPower} />
        </div>
      </li>)}
  </ul>

  const tableCellClass = 'text-center border border-slate-500 p-2';

  const upvotersTable = proposalPeriod.upvoters.length ? <table className="table-auto w-full border-collapse border border-slate-500">
    <thead>
      <tr>
        <th className={tableCellClass}>Baker</th>
        <th className={tableCellClass}>Voting power</th>
        <th className={tableCellClass}>Proposal</th>
        <th className={tableCellClass}>Time</th>
      </tr>
    </thead>
    <tbody>
      {proposalPeriod.upvoters.map(p => <tr key={JSON.stringify(p.proposalKey)}>
        <td className={clsx(tableCellClass, 'underline')}><LinkPure href={context.explorer.getOperationUrl(p.operationHash)} target="_blank">{p.alias || p.address}</LinkPure></td>
        <td className={tableCellClass}><IntValuePure value={p.votingPower} /></td>
        <td className={tableCellClass}><PayloadKey value={p.proposalKey} /></td>
        <td className={tableCellClass}>{formatDateTimeCompact(p.operationTime)}</td>
      </tr>)}
    </tbody>
  </table> : <span className="block">No Upvoters</span>

  const proposalQuorum = getProposalQuorumPercent(proposalPeriod.candidateUpvotesVotingPower || BigNumber(0), proposalPeriod.totalVotingPower)

  return <>
    <div className="flex flex-row justify-between items-center mb-2">
      <h2 className="text-xl">Proposals</h2>
      <ProgressPure text="Quorum" value={proposalQuorum} target={minimumProposalQuorum} />
    </div>
    {proposalList}

    <br />
    <h2 className="text-xl mb-2">Upvoters</h2>
    {upvotersTable}
  </>
}