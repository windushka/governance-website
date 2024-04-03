import { ProposalPeriod, GovernanceConfig } from '@/app/lib/governance';
import { getProposalQuorumPercent, natToPercent } from '@/app/lib/governance/utils';
import { ProgressPure, NoDataPure } from '@/app/ui/common';
import { UpvotersTable } from './upvotersTable';
import { ProposalListPure } from './proposalsList';

interface ProposalStateProps {
  contractAddress: string;
  proposalPeriod: ProposalPeriod;
  config: GovernanceConfig;
}

export default function ProposalState({ contractAddress, proposalPeriod, config }: ProposalStateProps) {
  if (!proposalPeriod.proposals.length)
    return <NoDataPure text="Nothing has been proposed at this period" />

  const minimumProposalQuorum = natToPercent(config.proposalQuorum, config.scale);
  const proposalQuorum = getProposalQuorumPercent(proposalPeriod.candidateUpvotesVotingPower || BigInt(0), proposalPeriod.totalVotingPower)

  return <>
    <div className="flex flex-row justify-between items-center mb-2">
      <h2 className="text-xl">Proposals</h2>
      <ProgressPure text="Quorum" value={proposalQuorum} target={minimumProposalQuorum} />
    </div>
    <ProposalListPure proposals={proposalPeriod.proposals} winnerCandidate={proposalPeriod.winnerCandidate} />

    <h2 className="text-xl mb-2">Upvoters</h2>
    <UpvotersTable
      contractAddress={contractAddress}
      upvotersBigMapId={proposalPeriod.upvotersBigMapId}
      periodStartLevel={proposalPeriod.startLevel}
      periodEndLevel={proposalPeriod.endLevel}
    />
  </>
}