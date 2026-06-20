import { GithubIcon } from '@/components/GithubIcon';
import LogoWhite from '@/assets/logo-white.png';
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
    <footer className="mt-4 bg-foreground text-background">
      <div className="mx-auto max-w-7xl *:px-4 *:md:px-6">
        <div className="flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={LogoWhite}
                alt="Kredly Logo"
                className="h-6 w-auto aspect-[100/24] object-contain"
              />
            </div>
            <div className="flex items-center">
              {socialLinks.map(({ href, label, icon }) => (
                <Button
                  asChild
                  key={label}
                  size="icon"
                  variant="ghost"
                  className="text-zinc-400 hover:bg-white/10 hover:text-white"
                >
                  <a aria-label={label} href={href}>
                    {icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <nav>
            <ul className="flex flex-wrap gap-4 text-sm font-medium text-zinc-400 md:gap-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    className="transition-colors hover:text-white"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-4 border-t py-4 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} kredly.</p>
        </div>
      </div>
    </footer>
  );
}
