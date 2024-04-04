import { getPeriodPageUrl, preload } from './actions';
import { LinkPure, appTheme } from './ui/common';

export default async function Home() {
  preload();
  const linksClassName = `${appTheme.accentTextColor} underline hover:underline`;
  return <>
    <h2 className="text-xl mt-8 mb-4">Etherlink</h2>
    <p className="mb-2">
      Etherlink is an EVM-compatible layer-2 blockchain with a decentralized sequencer, offering very low fees and MEV protection, powered by Tezos Smart Rollup technology.
    </p>
    <ul className="mb-2 list-disc list-inside pl-4">
      <li>Decentralized: The decentralized sequencer reduces the risk of centralized control and manipulation.</li>
      <li>Secure: Built-in MEV protection protects users against exploitation.</li>
      <li>Low fees: Think $0.01 per transaction, not $20.</li>
    </ul>
    <p className="mb-8">Etherlink uses Smart Rollups on the decentralized Tezos protocol for data availability and will expand to use the Tezos Data Availability Layer.</p>
    <hr className={`${appTheme.borderColor}`} />
    <h2 className="text-xl mt-8 mb-4">Etherlink governance</h2>
    <p className="mb-2">
      Like Tezos, Etherlink has a built-in on-chain mechanism for proposing, selecting, testing, and activating upgrades without the need to hard fork. This mechanism makes Etherlink self-amending and empowers Tezos bakers to govern Etherlink’s kernel upgrades, security updates, and sequencer operators.
    </p>
    <p className="mb-8">
      Etherlink has separate governance processes for <LinkPure className={linksClassName} href={getPeriodPageUrl('kernel')}>the kernel</LinkPure>, for <LinkPure className={linksClassName} href={getPeriodPageUrl('security')}>security incidents</LinkPure>, and for <LinkPure className={linksClassName} href={getPeriodPageUrl('sequencer')}>the Sequencer Committee</LinkPure>. To ensure that decisions accurately reflect the consensus of the Etherlink community, all three governance processes are designed with the same robust safeguards. Like Tezos&apos;s governance process, Etherlink&apos;s governance process promotes transparency and fairness in decision-making.
    </p>
    <hr className={`${appTheme.borderColor}`} />
    <h2 className="text-xl mt-8 mb-4">Learn more</h2>
    <p className="mb-2">
      You may find more information by using the following links:
    </p>
    <ul className="mb-2 list-disc list-inside pl-4">
      <li><LinkPure className={linksClassName} target="_blank" href="https://www.etherlink.com/">Etherlink</LinkPure>  </li>
      <li><LinkPure className={linksClassName} target="_blank" href="https://docs.etherlink.com/">Etherlink documentation</LinkPure></li>
      <li><LinkPure className={linksClassName} target="_blank" href="#">Governance documentation</LinkPure></li>
    </ul>
  </>
}
