import VotingState from "@/app/ui/voting/votingState";

export default async function Home({ params }: { params: { periodIndex: string[] | undefined } }) {
  return <>
    <VotingState periodIndex={params.periodIndex} />
  </>;
}
