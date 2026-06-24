import { cn } from '@/lib/utils';
import { useScroll } from '@/hooks/use-scroll';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/MobileNav';
import Logo from '@/assets/logo.png';
import { navLinks } from '@/constants/navigation';
import { Link } from '@tanstack/react-router';
import { useAuth } from '@/contexts/auth';
import UserAvatar from '@/components/UserAvatar';

export function Navbar() {
  const scrolled = useScroll(10);
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out',
        {
          'border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow':
            scrolled,
        },
      )}
    >
      <nav
        className={cn(
          'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
          {
            'md:px-2': scrolled,
          },
        )}
      >
        <Link to="/" preload="intent">
          <img
            src={Logo}
            alt="Kredly Logo"
            width={100}
            height={24}
            className="h-6 w-auto aspect-100/24 object-contain"
          />
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <div>
            {navLinks.map((link) => (
              <Button asChild key={link.label} size="sm" variant="ghost">
                <Link to={link.href} preload="intent">
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app" preload="intent">
                      Dashboard
                    </Link>
                  </Button>
                  <UserAvatar />
                </>
              ) : (
                <>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/login" preload="intent">
                      Masuk
                    </Link>
                  </Button>

                  <Button asChild size="sm">
                    <Link to="/register" preload="intent">
                      Daftar Gratis
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
