import { PromotionPeriod } from "@/app/lib/governance/state/state";

interface PromotionStateProps {
    promotionPeriod: PromotionPeriod
}

export default function PromotionState({ promotionPeriod }: PromotionStateProps) {
    return <>
        <h2>Promotion</h2>
        <p>Period index: {promotionPeriod.periodIndex.toString()}</p>
        <p>Winner candidate: {JSON.stringify(promotionPeriod.winnerCandidate)}</p>
        <p>Total voting power: {promotionPeriod.totalVotingPower.toString()}</p>
        <p>Yea voting power: {promotionPeriod.yeaVotingPower.toString()}</p>
        <p>Nay voting power: {promotionPeriod.nayVotingPower.toString()}</p>
        <p>Pass voting power: {promotionPeriod.passVotingPower.toString()}</p>
    </>
}