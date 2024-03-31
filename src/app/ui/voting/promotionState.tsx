import { PromotionPeriod } from "@/app/lib/governance/state/state";
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent, natToPercent, formatDateTimeCompact } from "@/app/lib/governance/utils";
import { GovernanceConfig } from "@/app/lib/governance/config/config";
import { clsx } from "clsx";
import TotalVoteCard from "@/app/ui/voting/totalVoteCard";
import PayloadKey from './payloadKey';
import { LinkPure, ProgressPure, NoDataPure, IntValuePure } from '@/app/ui/common';
import { getAppContext } from '@/app/lib/appContext';

interface PromotionStateProps {
  promotionPeriod: PromotionPeriod;
  config: GovernanceConfig;
}

export default function PromotionState({ promotionPeriod, config }: PromotionStateProps) {
  const context = getAppContext();
  const tableCellClass = 'text-center border border-slate-500 p-2';

  const votersTable = promotionPeriod.voters.length ? <table className="table-auto w-full border-collapse border border-slate-500 text-sm">
    <thead>
      <tr>
        <th className={tableCellClass}>Baker</th>
        <th className={tableCellClass}>Voting power</th>
        <th className={tableCellClass}>Vote</th>
        <th className={tableCellClass}>Time</th>
      </tr>
    </thead>
    <tbody>
      {promotionPeriod.voters.map(v =>
        <tr key={v.address}>
          <td className={clsx(tableCellClass, 'underline')}>
            <LinkPure href={context.explorer.getOperationUrl(v.operationHash)} target="_blank">{v.alias || v.address}</LinkPure>
          </td>
          <td className={tableCellClass}><IntValuePure value={v.votingPower} /></td>
          <td className={clsx(tableCellClass, v.vote === 'yea' && 'text-emerald-400', v.vote === 'nay' && 'text-red-400')}>{v.vote}</td>
          <td className={tableCellClass}>{formatDateTimeCompact(v.operationTime)}</td>
        </tr>)}
    </tbody>
  </table> : null;

  const votingPowerSum = promotionPeriod.yeaVotingPower + promotionPeriod.nayVotingPower + promotionPeriod.passVotingPower;

  const promotionSupermajority = getPromotionSupermajorityPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower);
  const promotionQuorum = getPromotionQuorumPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower, promotionPeriod.passVotingPower, promotionPeriod.totalVotingPower);
  const minimumPromotionSupermajority = natToPercent(config.promotionSupermajority, config.scale);
  const minimumPromotionQuorum = natToPercent(config.promotionQuorum, config.scale);

  return votersTable ? <>
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
      <TotalVoteCard className="border-emerald-400" text="Total yea" votingPower={promotionPeriod.yeaVotingPower} totalVotingPower={votingPowerSum} />
      <TotalVoteCard className="border-red-400" text="Total nay" votingPower={promotionPeriod.nayVotingPower} totalVotingPower={votingPowerSum} />
      <TotalVoteCard className="border-slate-500" text="Total pass" votingPower={promotionPeriod.passVotingPower} totalVotingPower={votingPowerSum} />
    </div>
    <h2 className="text-xl mb-2">Voters</h2>
    {votersTable}
  </>
    : <NoDataPure text="No voters" />
}