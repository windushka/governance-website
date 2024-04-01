import { PromotionPeriod } from "@/app/lib/governance/state/state";
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent, natToPercent } from "@/app/lib/governance/utils";
import { GovernanceConfig } from "@/app/lib/governance/config/config";
import TotalVoteCard from "@/app/ui/voting/totalVoteCard";
import PayloadKey from './payloadKey';
import { ProgressPure, NoDataPure, appTheme } from '@/app/ui/common';
import { VotersTable } from './voterTable';

interface PromotionStateProps {
  contractAddress: string;
  promotionPeriod: PromotionPeriod;
  config: GovernanceConfig;
}

export default function PromotionState({ contractAddress, promotionPeriod, config }: PromotionStateProps) {
  const votingPowerSum = promotionPeriod.yeaVotingPower + promotionPeriod.nayVotingPower + promotionPeriod.passVotingPower;

  const promotionSupermajority = getPromotionSupermajorityPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower);
  const promotionQuorum = getPromotionQuorumPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower, promotionPeriod.passVotingPower, promotionPeriod.totalVotingPower);
  const minimumPromotionSupermajority = natToPercent(config.promotionSupermajority, config.scale);
  const minimumPromotionQuorum = natToPercent(config.promotionQuorum, config.scale);

  return promotionPeriod.votersBigMapId
    ? <>
      <div className="flex flex-row justify-between items-center mb-8">
        <div className="flex flex-col">
          <span>Candidate:</span>
          <PayloadKey value={promotionPeriod.winnerCandidate} />
        </div>

        <div className="flex flex-col gap-4">
          <ProgressPure text="Quorum" value={promotionQuorum} target={minimumPromotionQuorum} />
          <ProgressPure text="Supermajority" value={promotionSupermajority} target={minimumPromotionSupermajority} />
        </div>
      </div>
      <div className="flex flex-row justify-between mb-8 items-stretch gap-20">
        <TotalVoteCard className={appTheme.accentBorderColor} text="Total yea" votingPower={promotionPeriod.yeaVotingPower} totalVotingPower={votingPowerSum} />
        <TotalVoteCard className="border-red-400" text="Total nay" votingPower={promotionPeriod.nayVotingPower} totalVotingPower={votingPowerSum} />
        <TotalVoteCard className={appTheme.borderColor} text="Total pass" votingPower={promotionPeriod.passVotingPower} totalVotingPower={votingPowerSum} />
      </div>
      <h2 className="text-xl mb-2">Voters</h2>
      <VotersTable
        contractAddress={contractAddress}
        votersBigMapId={promotionPeriod.votersBigMapId}
        periodStartLevel={promotionPeriod.startLevel}
        periodEndLevel={promotionPeriod.endLevel} />
    </>
    : <NoDataPure text="No voters" />
}