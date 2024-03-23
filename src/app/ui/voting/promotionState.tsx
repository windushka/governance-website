import { PromotionPeriod } from "@/app/lib/governance/state/state";
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent } from "@/app/lib/governance/utils/calculators";
import { GovernanceConfig } from "@/app/lib/governance/config/config";
import { clsx } from "clsx";
import VotingPower from "@/app/ui/common/votingPower";
import NoData from "@/app/ui/common/noData";
import TotalVoteCard from "@/app/ui/voting/totalVoteCard";

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
      </tr>
    </thead>
    <tbody>
      {promotionPeriod.voters.map(v =>
        <tr key={v.address}>
          <td className={tableCellClass}>{v.address}</td>
          <td className={tableCellClass}><VotingPower value={v.votingPower} /></td>
          <td className={clsx(tableCellClass, v.vote === 'yea' && 'text-emerald-400', v.vote === 'nay' && 'text-red-400')}>{v.vote}</td>
        </tr>)}
    </tbody>
  </table> : null;

  const promotionSupermajority = getPromotionSupermajorityPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower);
  const promotionQuorum = getPromotionQuorumPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower, promotionPeriod.passVotingPower, promotionPeriod.totalVotingPower);

  return votersTable ? <>
    <div className="flex flex-row justify-between items-center mb-8">
      <div className="flex flex-col">
        <span>Candidate:</span>
        <span className="text-xl">0x{(promotionPeriod.winnerCandidate as string)}</span>
      </div>

      <div className="flex flex-col">
        <div>
          <span>Supermajority: </span>
          <span className={clsx(promotionSupermajority.gte(config.promotionSupermajority) ? 'text-emerald-400' : 'text-red-400')}>
            {promotionSupermajority.toFixed(2)}% of {config.promotionSupermajority.toFixed(2)}%
          </span>
        </div>
        <div>
          <span>Quorum: </span>
          <span className={clsx(promotionQuorum.gte(config.promotionQuorum) ? 'text-emerald-400' : 'text-red-400')}>
            {promotionQuorum.toFixed(2)}% of {config.promotionQuorum.toFixed(2)}%
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