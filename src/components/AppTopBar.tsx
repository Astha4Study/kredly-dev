import Kredly from '@/assets/logo.png';
import UserAvatar from '@/components/UserAvatar';
import CreditTopup from '@/components/CreditTopup';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import {
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
import React, { useEffect, useState } from 'react';
import { getUserActivities, type Activity } from '@/lib/history-client';
import {
  getImportantActivities,
  getRecentActivities,
} from '@/lib/notification-utils';

export default function AppTopBar() {
  const [kredit, setKredit] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Notification states
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  useEffect(() => {
    fetch('/api/user/me/token-balance', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setKredit(data.current ?? 0))
      .catch(() => setKredit(0));
  }, []);

  // Fetch notifications function
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await getUserActivities();
      setActivities(data);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setNotifLoading(false);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Re-fetch on window focus (if stale > 5 minutes)
  useEffect(() => {
    const handleFocus = () => {
      const now = new Date();
      if (
        !lastFetched ||
        now.getTime() - lastFetched.getTime() > 5 * 60 * 1000
      ) {
        fetchNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lastFetched]);

  // Filter notifications: recent (24h) + important types only
  const notifications = getImportantActivities(
    getRecentActivities(activities, 24),
  );

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
                  <span className="font-semibold">
                    {kredit !== null ? kredit : '--'} Kredit
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <CreditTopup kredit={kredit ?? 0} />
            </DropdownMenu>
            <Button variant="default" asChild className="hidden md:flex">
              <Link to="/pricing" preload="intent">
                Daftar Harga
              </Link>
            </Button>
            <Separator orientation="vertical" className="hidden md:block" />
            <NotificationDropdown
              notifications={notifications}
              loading={notifLoading}
              onRefresh={fetchNotifications}
            />
            <Separator orientation="vertical" className="hidden md:block" />
            <UserAvatar />
            <AppMobileNav
              kredit={kredit ?? 0}
              open={mobileMenuOpen}
              setOpen={setMobileMenuOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
