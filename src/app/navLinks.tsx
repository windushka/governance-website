import Link from '@/app//ui/common/link';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Kernel', href: '/period' },
  { name: 'Security', href: '', disabled: true },
  { name: 'Committee', href: '', disabled: true },
];

export default function NavLinks() {
  return (
    <div className="flex flex-row gap-4">
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            disabled={link.disabled}
            href={link.href}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
}
