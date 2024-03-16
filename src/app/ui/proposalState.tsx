import { ActiveProposalPeriod, FinishedProposalPeriod } from "@/app/lib/governance/state/state";

interface ProposalStateProps {
    proposalPeriod: ActiveProposalPeriod<string> | FinishedProposalPeriod<string>
}

export default function ProposalState({ proposalPeriod }: ProposalStateProps) {
    const proposalList = proposalPeriod.proposals.length ? <ul>
        {proposalPeriod.proposals.map(p => <li key={p.key}>{p.key} (proposer: {p.proposer}), upvotes: {p.upvotesVotingPower.toString()}</li>)}
    </ul> : <span className="block">No Proposals</span>

    const upvoterList = proposalPeriod.upvoters.length ? <ul>
        {proposalPeriod.upvoters.map(p => <li key={p.proposalKey}>{p.address} upvoted for {p.proposalKey} with voting power {p.votingPower.toString()}</li>)}
    </ul> : <span className="block">No Upvoters</span>

    return <>
        <h2>Proposal</h2>
        <p>Period index: {proposalPeriod.periodIndex.toString()}</p>
        <p>Winner candidate: {JSON.stringify(proposalPeriod.winnerCandidate)}</p>
        <p>Total voting power: {proposalPeriod.totalVotingPower.toString()}</p>
        <br />
        <h2>Proposals</h2>
        {proposalList}
       
        <br />
        <h2>Upvoters</h2>
        {upvoterList}
    </>
}