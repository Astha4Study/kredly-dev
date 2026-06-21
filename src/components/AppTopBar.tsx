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
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@tanstack/react-router';
import AppTopbarItem from './AppTopbarItem';

export default function AppTopBar() {
  // TODO: Fetch kredit dari API
  const kredit = 150;

  const navItems = [
    { path: '/app', label: 'Beranda', icon: Home },
    { path: '/app/certification', label: 'Sertifikasi', icon: Award },
    { path: '/app/assessment', label: 'Asesmen', icon: FileText },
  ];

  const NavItemsSecondary = [
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
    <header className="sticky top-0 z-10 border-b bg-white text-foreground">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/app" preload="intent">
              <img
                src={Kredly}
                alt="Kredly"
                width={100}
                height={28}
                className="h-7 w-auto aspect-[100/28] object-contain"
              />
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <nav className="flex items-center gap-1 rounded-md border bg-muted/50 p-1 h-10">
                {navItems.map((item) => (
                  <AppTopbarItem
                    key={item.path}
                    to={item.path}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
              </nav>

              <nav className="flex items-center rounded-md border bg-muted/50 p-1 h-10">
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
          <div className="flex items-center gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  aria-label="Kredit"
                >
                  <Coins className="h-4 w-4" />
                  <span className="font-semibold">{kredit} Kredit</span>
                </Button>
              </DropdownMenuTrigger>
              <CreditTopup kredit={kredit} />
            </DropdownMenu>
            <Button variant="default" asChild>
              <Link to="/app/pricing" preload="intent">
                Daftar Harga
              </Link>
            </Button>
            <Separator orientation="vertical" />
            <Button aria-label="Notifications" size="icon" variant="outline">
              <BellIcon />
            </Button>
            <Separator orientation="vertical" />
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
