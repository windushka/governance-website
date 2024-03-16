import { PromotionPeriod } from "@/app/lib/governance/state/state";

interface PromotionStateProps {
    promotionPeriod: PromotionPeriod
}

export default function PromotionState({ promotionPeriod }: PromotionStateProps) {
    const votersList = promotionPeriod.voters.length ? <ul>
        {promotionPeriod.voters.map(v => <li key={v.address}>{v.address} voted &quot;{v.vote}&quot; with voting power {v.votingPower.toString()}</li>)}
    </ul> : <span className="block">No Voters</span>
    return <>
        <h2>Promotion</h2>
        <p>Period index: {promotionPeriod.periodIndex.toString()}</p>
        <p>Winner candidate: {JSON.stringify(promotionPeriod.winnerCandidate)}</p>
        <p>Total voting power: {promotionPeriod.totalVotingPower.toString()}</p>
        <p>Yea voting power: {promotionPeriod.yeaVotingPower.toString()}</p>
        <p>Nay voting power: {promotionPeriod.nayVotingPower.toString()}</p>
        <p>Pass voting power: {promotionPeriod.passVotingPower.toString()}</p>
        <br />
        <h2>Voters</h2>
        {votersList}
    </>
}