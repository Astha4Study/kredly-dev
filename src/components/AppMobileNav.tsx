import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Portal, PortalBackdrop } from '@/components/ui/portal';
import { XIcon, MenuIcon, Briefcase } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Home, Award, FileText, History, Coins, Upload } from 'lucide-react';

interface AppMobileNavProps {
  kredit: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AppMobileNav({ kredit, open, setOpen }: AppMobileNavProps) {
  const navItems = [
    { path: '/app', label: 'Beranda', icon: Home },
    { path: '/app/assessment', label: 'Asesmen', icon: FileText },
    { path: '/app/certification', label: 'Kredensial', icon: Award },
    { path: '/app/jobs', label: 'Karier', icon: Briefcase },
    {
      path: '/app/history',
      label: 'Riwayat',
      icon: History,
    },
  ];

  const handleClose = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <Button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="outline"
        className="ml-2 relative z-60"
      >
        {open ? (
          <XIcon className="size-4.5" />
        ) : (
          <MenuIcon className="size-4.5" />
        )}
      </Button>
      {open && (
        <Portal className="top-16" id="mobile-menu">
          <PortalBackdrop onClick={handleClose} data-state="open" />
          <div
            className={cn(
              'relative z-10 w-full flex flex-col overflow-y-auto bg-background shadow-lg',
              'animate-in slide-in-from-top-4 duration-300 ease-out',
              'border-b border-border',
            )}
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            {/* Navigation Items */}
            <div className="space-y-1 p-6">
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Navigasi
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    asChild
                    className="w-full justify-start gap-3 h-11"
                    key={item.path}
                    variant="ghost"
                    onClick={handleClose}
                  >
                    <Link to={item.path}>
                      <Icon className="h-5 w-5" />
                      <span className="text-base">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Credit and Actions */}
            <div className="space-y-3 p-6">
              <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Akun
              </p>
              <div className="flex items-center justify-between border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                    <Coins className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kredit Anda</p>
                    <p className="text-lg font-semibold">{kredit}</p>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full h-11" size="lg">
                <Link to="/app/pricing" onClick={handleClose}>
                  <Coins className="mr-2 h-4 w-4" />
                  Beli Kredit
                </Link>
              </Button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
