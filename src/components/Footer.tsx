import { GithubIcon } from '@/components/GithubIcon';
import Logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '#', label: 'Features' },
  { href: '#', label: 'Blog' },
  { href: '#', label: 'About' },
  { href: '#', label: 'Contact' },
  { href: '#', label: 'Licence' },
  { href: '#', label: 'Privacy' },
];

const socialLinks = [
  {
    href: '#',
    label: 'Github',
    icon: <GithubIcon />,
  },
];

export default function Footer() {
  return (
    <footer className="mt-4">
      <div className="mx-auto max-w-6xl *:px-4 *:md:px-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="Kredly Logo" className="h-6" />
            </div>
            <div className="flex items-center">
              {socialLinks.map(({ href, label, icon }) => (
                <Button asChild key={label} size="icon" variant="ghost">
                  <a aria-label={label} href={href}>
                    {icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <nav>
            <ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a className="hover:text-foreground" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-4 border-t py-4 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} efferd</p>
        </div>
      </div>
    </footer>
  );
}
