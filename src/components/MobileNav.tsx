import { cn } from '@/lib/utils';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Portal, PortalBackdrop } from '@/components/ui/portal';
import { XIcon, MenuIcon } from 'lucide-react';
import { navLinks } from '@/constants/navigation';
import { useAuth } from '@/contexts/auth';
import { Link } from '@tanstack/react-router';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const { isAuthenticated, isLoading, signOut } = useAuth();

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>
      {open && (
        <Portal className="top-14" id="mobile-menu">
          <PortalBackdrop />
          <div
            className={cn(
              'data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in',
              'size-full p-4',
            )}
            data-slot={open ? 'open' : 'closed'}
          >
            <div className="grid gap-y-2">
              {navLinks.map((link) => (
                <Button
                  asChild
                  className="justify-start"
                  key={link.label}
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  <Link to={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-2">
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <>
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/app" onClick={() => setOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        className="w-full text-red-600 hover:text-red-600 hover:bg-red-500/10"
                        variant="ghost"
                        onClick={async () => {
                          setOpen(false);
                          try {
                            await signOut();
                          } catch (err) {
                            console.error('Logout failed:', err);
                          }
                        }}
                      >
                        Keluar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/login" onClick={() => setOpen(false)}>
                          Masuk
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/register" onClick={() => setOpen(false)}>
                          Daftar Gratis
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
