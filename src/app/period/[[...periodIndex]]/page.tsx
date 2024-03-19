import VotingState from "@/app/ui/voting/votingState";

export default async function Home({ params }: { params: { periodIndex: string[] | undefined } }) {
  const contractAddress = 'KT1MHAVKVVDSgZsKiwNrRfYpKHiTLLrtGqod';
  return <>
    <VotingState contractAddress={contractAddress} periodIndex={params.periodIndex} />
  </>;
}
