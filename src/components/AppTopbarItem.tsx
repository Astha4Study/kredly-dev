import { Link, useLocation } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';

interface AppTopbarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export default function AppTopbarItem({
  to,
  icon: Icon,
  label,
}: AppTopbarItemProps) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-sm px-3 h-full text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
