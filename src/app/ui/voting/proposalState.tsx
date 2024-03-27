import { ProposalPeriod, GovernanceConfig } from '@/app/lib/governance';
import { getProposalQuorumPercent, natToPercent, toCompactPercentage } from '@/app/lib/governance/utils';
import BigNumber from 'bignumber.js'
import clsx from 'clsx';
import VotingPower from '@/app/ui/common/votingPower';
import NoData from '@/app/ui/common/noData';
import PayloadKey from './payloadKey';

interface ProposalStateProps {
  proposalPeriod: ProposalPeriod;
  config: GovernanceConfig;
}

export default function ProposalState({ proposalPeriod, config }: ProposalStateProps) {
  if (!proposalPeriod.proposals.length)
    return <NoData text="No proposals" />

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
          <VotingPower className="text-xl" value={p.upvotesVotingPower} />
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
      </tr>
    </thead>
    <tbody>
      {proposalPeriod.upvoters.map(p => <tr key={JSON.stringify(p.proposalKey)}>
        <td className={tableCellClass}>{p.address}</td>
        <td className={tableCellClass}><VotingPower value={p.votingPower} /></td>
        <td className={tableCellClass}><PayloadKey value={p.proposalKey} /></td>
      </tr>)}
    </tbody>
  </table> : <span className="block">No Upvoters</span>

  const proposalQuorum = getProposalQuorumPercent(proposalPeriod.candidateUpvotesVotingPower || BigNumber(0), proposalPeriod.totalVotingPower)

  return <>
    <div className="flex flex-row justify-between items-center mb-2">
      <h2 className="text-xl">Proposals</h2>
      <div>
        <span>Quorum: </span>
        <span className={clsx(proposalQuorum.gte(minimumProposalQuorum) ? 'text-emerald-400' : 'text-red-400')}>
          {`${toCompactPercentage(proposalQuorum)} of ${toCompactPercentage(minimumProposalQuorum)}`}
        </span>
      </div>
    </div>
    {proposalList}

    <br />
    <h2 className="text-xl mb-2">Upvoters</h2>
    {upvotersTable}
  </>
}