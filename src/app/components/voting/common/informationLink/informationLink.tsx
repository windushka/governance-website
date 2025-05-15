import { PayloadKey } from '@/lib/governance';
import { LinkPure } from '@/app/components';

// Data about proposals and links to information about them
import { allLinkData } from "@/data/proposals";
import equal from 'fast-deep-equal';

interface InformationLinkProps {
  payloadKey: PayloadKey,
}

export const InformationLink: React.FC<InformationLinkProps> = ({
  payloadKey
}) => {
  const linkData = allLinkData.find((d) => equal(d.payloadKey, payloadKey));

  if (!linkData) {
    return null;
  }

  return <LinkPure className="underline text-gray-400" href={linkData.href} target="_blank">
    {linkData.title}
  </LinkPure>
}
