import { ProposalPeriod, GovernanceConfig } from '@/app/lib/governance';
import { getProposalQuorumPercent, natToPercent } from '@/app/lib/governance/utils';
import clsx from 'clsx';
import PayloadKey from './payloadKey';
import { getAppContext } from '@/app/lib/appContext';
import { ProgressPure, LinkPure, NoDataPure, IntValuePure } from '@/app/ui/common';
import { UpvotersTablePure } from './upvotersTable';

interface ProposalStateProps {
  contractAddress: string;
  proposalPeriod: ProposalPeriod;
  config: GovernanceConfig;
}

export default function ProposalState({ contractAddress, proposalPeriod, config }: ProposalStateProps) {
  if (!proposalPeriod.proposals.length)
    return <NoDataPure text="No proposals" />

  const context = getAppContext();
  const minimumProposalQuorum = natToPercent(config.proposalQuorum, config.scale);

  const proposalList = <ul className="flex flex-col gap-6 mb-8">
    {proposalPeriod.proposals.map(p =>
      <li
        key={JSON.stringify(p.key)}
        className={clsx('block flex flex-row justify-between items-center p-2 border', JSON.stringify(p.key) === JSON.stringify(proposalPeriod.winnerCandidate) ? 'border-emerald-400' : 'border-slate-500')}>
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

  const proposalQuorum = getProposalQuorumPercent(proposalPeriod.candidateUpvotesVotingPower || BigInt(0), proposalPeriod.totalVotingPower)

  return <>
    <div className="flex flex-row justify-between items-center mb-2">
      <h2 className="text-xl">Proposals</h2>
      <ProgressPure text="Quorum" value={proposalQuorum} target={minimumProposalQuorum} />
    </div>
    {proposalList}

    <h2 className="text-xl mb-2">Upvoters</h2>
    <UpvotersTablePure
      contractAddress={contractAddress}
      upvotersBigMapId={proposalPeriod.upvotersBigMapId}
      periodStartLevel={proposalPeriod.startLevel}
      periodEndLevel={proposalPeriod.endLevel}
    />
  </>
}