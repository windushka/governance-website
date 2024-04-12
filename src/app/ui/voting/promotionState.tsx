import { PromotionPeriod } from "@/app/lib/governance/state/state";
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent, natToPercent } from "@/app/lib/governance/utils";
import { GovernanceConfig } from "@/app/lib/governance/config/config";
import { TotalVoteCard, TotalVoteType } from "@/app/ui/voting/totalVoteCard";
import { PayloadKey } from './payloadKey';
import { ProgressPure, NoDataPure, } from '@/app/ui/common';
import { VotersTable } from './votersTable';

interface PromotionStateProps {
  contractAddress: string;
  promotionPeriod: PromotionPeriod;
  config: GovernanceConfig;
}

export const PromotionState = ({ contractAddress, promotionPeriod, config }: PromotionStateProps) => {
  const votingPowerSum = promotionPeriod.yeaVotingPower + promotionPeriod.nayVotingPower + promotionPeriod.passVotingPower;

  const promotionSupermajority = getPromotionSupermajorityPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower);
  const promotionQuorum = getPromotionQuorumPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower, promotionPeriod.passVotingPower, promotionPeriod.totalVotingPower);
  const minimumPromotionSupermajority = natToPercent(config.promotionSupermajority, config.scale);
  const minimumPromotionQuorum = natToPercent(config.promotionQuorum, config.scale);

  return <>
    <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-12 gap-4">
      {promotionPeriod.winnerCandidate && <div className="flex flex-col">
        <span>Candidate:</span>
        <PayloadKey value={promotionPeriod.winnerCandidate} />
      </div>}

      <div className="flex flex-col gap-4">
        <ProgressPure text="Quorum" value={promotionQuorum} target={minimumPromotionQuorum} />
        <ProgressPure text="Supermajority" value={promotionSupermajority} target={minimumPromotionSupermajority} />
      </div>
    </div>
    {promotionPeriod.votersBigMapId
      ? <>
        <div className="flex flex-col xl:flex-row justify-between mb-12 items-stretch gap-y-2 gap-x-20">
          <TotalVoteCard type={TotalVoteType.Yea} votingPower={promotionPeriod.yeaVotingPower} totalVotingPower={votingPowerSum} />
          <TotalVoteCard type={TotalVoteType.Nay} votingPower={promotionPeriod.nayVotingPower} totalVotingPower={votingPowerSum} />
          <TotalVoteCard type={TotalVoteType.Pass} votingPower={promotionPeriod.passVotingPower} totalVotingPower={votingPowerSum} />
        </div>
        <h2 className="text-xl mb-2">Voters</h2>
        <VotersTable
          contractAddress={contractAddress}
          votersBigMapId={promotionPeriod.votersBigMapId}
          periodStartLevel={promotionPeriod.startLevel}
          periodEndLevel={promotionPeriod.endLevel} />
      </>
      : <NoDataPure text="No one has voted at this period" />}
  </>
}