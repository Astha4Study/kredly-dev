import Kredly from '@/assets/logo.png';
import UserAvatar from '@/components/UserAvatar';
import CreditTopup from '@/components/CreditTopup';
import {
  BellIcon,
  Coins,
  Home,
  Award,
  FileText,
  History,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@tanstack/react-router';
import AppTopbarItem from './AppTopbarItem';
import { AppMobileNav } from './AppMobileNav';
import React from 'react';

export default function AppTopBar() {
  // TODO: Fetch kredit dari API
  const kredit = 150;
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/app', label: 'Beranda', icon: Home },
    { path: '/app/assessment', label: 'Asesmen', icon: FileText },
    { path: '/app/certification', label: 'Kredensial', icon: Award },
    { path: '/app/jobs', label: 'Karier', icon: Briefcase },
  ];

  const NavItemsSecondary = [
    // ini lagi dinonaktifkan
    // {
    //   path: '/app/certification-test',
    //   label: 'Contoh Sertifikasi',
    //   icon: BarChart3,
    // },
    {
      path: '/app/certificate-verification',
      label: 'Verifikasi',
      icon: ShieldCheck,
    },
    {
      path: '/app/history',
      label: 'Riwayat',
      icon: History,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white text-foreground ${!mobileMenuOpen ? 'border-b shadow-sm' : ''}`}
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/app" preload="intent">
              <img
                src={Kredly}
                alt="Kredly"
                width={100}
                height={28}
                className="h-6 sm:h-7 w-auto aspect-100/28 object-contain"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <nav className="flex items-center gap-1 border bg-muted/50 p-1 h-10">
                {navItems.map((item) => (
                  <AppTopbarItem
                    key={item.path}
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </nav>

              <nav className="flex items-center border bg-muted/50 p-1 h-10">
                {NavItemsSecondary.map((item) => (
                  <AppTopbarItem
                    key={item.path}
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hidden md:flex items-center gap-2"
                  aria-label="Kredit"
                >
                  <Coins className="h-4 w-4" />
                  <span className="font-semibold">{kredit} Kredit</span>
                </Button>
              </DropdownMenuTrigger>
              <CreditTopup kredit={kredit} />
            </DropdownMenu>
            <Button variant="default" asChild className="hidden md:flex">
              <Link to="/app/pricing" preload="intent">
                Daftar Harga
              </Link>
            </Button>
            <Separator orientation="vertical" className="hidden md:block" />
            <Button
              aria-label="Notifications"
              size="icon"
              variant="outline"
              className="hidden md:flex"
            >
              <BellIcon />
            </Button>
            <Separator orientation="vertical" className="hidden md:block" />
            <UserAvatar />
            <AppMobileNav
              kredit={kredit}
              open={mobileMenuOpen}
              setOpen={setMobileMenuOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
