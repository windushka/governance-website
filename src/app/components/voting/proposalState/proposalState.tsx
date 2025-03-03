import { ProposalPeriod, GovernanceConfig } from '@/lib/governance';
import { getProposalQuorumPercent, natToPercent } from '@/lib/governance/utils';
import { ProgressPure, GlobalMessagePure } from '@/app/components';
import { UpvotersTable } from './upvotersTable';
import { ProposalList } from './proposalsList';

interface ProposalStateProps {
  contractAddress: string;
  proposalPeriod: ProposalPeriod | null;
  config: GovernanceConfig;
}

export const ProposalState = ({ contractAddress, proposalPeriod, config }: ProposalStateProps) => {
  if (!proposalPeriod)
    return <GlobalMessagePure>Loading...</GlobalMessagePure>;

  if (!proposalPeriod.proposals.length)
    return <GlobalMessagePure>Nothing has been proposed at this period</GlobalMessagePure>;

  const minimumProposalQuorum = natToPercent(config.proposalQuorum, config.scale);
  const proposalQuorum = getProposalQuorumPercent(proposalPeriod.candidateUpvotesVotingPower || BigInt(0), proposalPeriod.totalVotingPower)

  return <>
    <div className="flex flex-col gap-4 sm:flex-row justify-between sm:items-center mb-2">
      <h2 className="text-xl">Proposals</h2>
      <ProgressPure text="Quorum" value={proposalQuorum} target={minimumProposalQuorum} />
    </div>
    <ProposalList proposals={proposalPeriod.proposals} winnerCandidate={proposalPeriod.winnerCandidate} />

    <h2 className="text-xl mb-2">Upvoters</h2>
    <UpvotersTable
      contractAddress={contractAddress}
      upvotersBigMapId={proposalPeriod.upvotersBigMapId}
      periodStartLevel={proposalPeriod.startLevel}
      periodEndLevel={proposalPeriod.endLevel}
    />
  </>
}
