import { PromotionPeriod } from "@/app/lib/governance/state/state";
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent, natToPercent, formatPercentageCompact, formatDateTimeCompact } from "@/app/lib/governance/utils";
import { GovernanceConfig } from "@/app/lib/governance/config/config";
import { clsx } from "clsx";
import VotingPower from "@/app/ui/common/votingPower";
import NoData from "@/app/ui/common/noData";
import TotalVoteCard from "@/app/ui/voting/totalVoteCard";
import PayloadKey from './payloadKey';

interface PromotionStateProps {
  promotionPeriod: PromotionPeriod;
  config: GovernanceConfig;
}

export default function PromotionState({ promotionPeriod, config }: PromotionStateProps) {
  const tableCellClass = 'text-center border border-slate-500 p-2';

  const votersTable = promotionPeriod.voters.length ? <table className="table-auto w-full border-collapse border border-slate-500">
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
          <td className={tableCellClass}>{v.address} - {v.operationHash}</td>
          <td className={tableCellClass}><VotingPower value={v.votingPower} /></td>
          <td className={clsx(tableCellClass, v.vote === 'yea' && 'text-emerald-400', v.vote === 'nay' && 'text-red-400')}>{v.vote}</td>
          <td className={tableCellClass}>{formatDateTimeCompact(v.operationTime)}</td>
        </tr>)}
    </tbody>
  </table> : null;

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

      <div className="flex flex-col">
        <div>
          <span>Supermajority: </span>
          <span className={clsx(promotionSupermajority.gte(minimumPromotionSupermajority) ? 'text-emerald-400' : 'text-red-400')}>
            {`${formatPercentageCompact(promotionSupermajority)} of ${formatPercentageCompact(minimumPromotionSupermajority)}`}
          </span>
        </div>
        <div>
          <span>Quorum: </span>
          <span className={clsx(promotionQuorum.gte(minimumPromotionQuorum) ? 'text-emerald-400' : 'text-red-400')}>
            {`${formatPercentageCompact(promotionQuorum)} of ${formatPercentageCompact(minimumPromotionQuorum)}`}
          </span>
        </div>
      </div>
    </div>
    <div className="flex flex-row justify-between">
      <TotalVoteCard className="border-emerald-400" text="Yea voting power" value={promotionPeriod.yeaVotingPower} />
      <TotalVoteCard className="border-red-400" text="Nay voting power" value={promotionPeriod.nayVotingPower} />
      <TotalVoteCard className="border-slate-500" text="Pass voting power" value={promotionPeriod.passVotingPower} />
    </div>
    <br />
    <h2 className="text-xl mb-2">Voters</h2>
    {votersTable}
  </>
    : <NoData text="No voters" />
}