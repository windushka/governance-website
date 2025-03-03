// Info with links to web pages about proposals

import { PayloadKey } from '@/lib/governance';

interface LinkData {
  payloadKey: PayloadKey;
  href: string;
  title: string;
}

export const allLinkData: LinkData[] = [
  {
    payloadKey: '00224058a50dbf4c0b5f6d5e4ee672cd63d0911959b335e587b4112a7eea7b2323',
    href: 'https://medium.com/@etherlink/announcing-calypso-the-next-etherlink-upgrade-proposal-dbe92c576da9',
    title: 'Announcing Calypso: The Next Etherlink Upgrade Proposal',
  },
  {
    payloadKey: '00fda6968ec17ed11dee02dc91d15606e6f02c8d7e00d8baeaee24fc0188898261',
    href: 'https://medium.com/etherlink/announcing-bifr%C3%B6st-a-2nd-upgrade-proposal-for-etherlink-mainnet-ef1a7cf9715f',
    title: 'Announcing Bifröst: a 2nd upgrade proposal for Etherlink Mainnet',
  },
];
