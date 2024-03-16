import { ActiveProposalPeriod, FinishedProposalPeriod } from "@/app/lib/governance/state/state";

interface ProposalStateProps {
    proposalPeriod: ActiveProposalPeriod | FinishedProposalPeriod
}

export default function ProposalState({ proposalPeriod }: ProposalStateProps) {
    return <>
        <h1>Proposal</h1>
        <p>Period index: {proposalPeriod.periodIndex.toString()}</p>
        <p>Winner candidate: {JSON.stringify(proposalPeriod.winnerCandidate)}</p>
        <p>Total voting power: {proposalPeriod.totalVotingPower.toString()}</p>
        <p>Proposals: {JSON.stringify(Object.fromEntries(proposalPeriod.proposals), undefined, 2)}</p>
        <p>Upvoters: {JSON.stringify(Object.fromEntries(proposalPeriod.upvoters), undefined, 2)}</p>
    </>
}