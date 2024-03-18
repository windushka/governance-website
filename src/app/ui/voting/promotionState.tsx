import { PromotionPeriod } from "@/app/lib/governance/state/state";
import BigNumber from 'bignumber.js';
import { getPromotionQuorumPercent, getPromotionSupermajorityPercent } from "../../lib/governance/utils/calculators";
import { GovernanceConfig } from "../../lib/governance/config/config";
import { clsx } from "clsx";

interface PromotionStateProps {
  promotionPeriod: PromotionPeriod;
  config: GovernanceConfig;
}

//TODO: separate file
interface TotalVoteCardProps {
  text: string;
  value: BigNumber;
}

const TotalVoteCard = ({ text, value }: TotalVoteCardProps) => {
  return <div className="flex flex-column gap-8 border border-slate-500 py-4 px-8">
    <span>{text}</span>
    <span>{value.toString()}</span>
  </div>
}

export default function PromotionState({ promotionPeriod, config }: PromotionStateProps) {
  const tableCellClass = 'text-center border border-slate-500 p-2';

  const votersTable = promotionPeriod.voters.length ? <table className="table-auto w-full border-collapse border border-slate-500">
    <thead>
      <tr>
        <th className={tableCellClass}>Baker</th>
        <th className={tableCellClass}>Voting Power</th>
        <th className={tableCellClass}>Vote</th>
      </tr>
    </thead>
    <tbody>
      {promotionPeriod.voters.map(v =>
        <tr key={v.address}>
          <td className={tableCellClass}>{v.address}</td>
          <td className={tableCellClass}>{v.votingPower.toString()}</td>
          <td className={tableCellClass}>{v.vote}</td>
        </tr>)}
    </tbody>
  </table> : <span className="block">No Voters</span>;

  const promotionSupermajority = getPromotionSupermajorityPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower);
  const promotionQuorum = getPromotionQuorumPercent(promotionPeriod.yeaVotingPower, promotionPeriod.nayVotingPower, promotionPeriod.passVotingPower, promotionPeriod.totalVotingPower);

  return <>
    <div className="flex flex-row justify-between items-center mb-8">
      <div className="flex flex-col">
        <span>Candidate:</span>
        <span className="text-xl">0x{(promotionPeriod.winnerCandidate as string)}</span>
      </div>
      <div className="flex flex-col">
        <span className={clsx({ 'text-emerald-500': promotionSupermajority.gte(config.promotionSupermajority) })}>
          Supermajority: {promotionSupermajority.toFixed(2)}% of {config.promotionSupermajority.toFixed(2)}%
        </span>
        <span className={clsx({ 'text-emerald-500': promotionQuorum.gte(config.promotionQuorum) })}>
          Quorum: {promotionQuorum.toFixed(2)}% of {config.promotionQuorum.toFixed(2)}%
        </span>
      </div>
    </div>
    <div className="flex flex-row justify-between">
      <TotalVoteCard text="Yea voting power" value={promotionPeriod.yeaVotingPower} />
      <TotalVoteCard text="Nay voting power" value={promotionPeriod.nayVotingPower} />
      <TotalVoteCard text="Pass voting power" value={promotionPeriod.passVotingPower} />
    </div>
    <br />
    {votersTable}
  </>
}