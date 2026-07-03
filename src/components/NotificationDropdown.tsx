import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import type { Activity } from '@/lib/history-client';
import { NotificationItem } from '@/components/NotificationItem';
import { NotificationSkeleton } from '@/components/skeletons/NotificationSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationDropdownProps {
  notifications: Activity[];
  loading: boolean;
  onRefresh: () => void;
}

export function NotificationDropdown({
  notifications,
  loading,
  onRefresh,
}: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hidden md:flex"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <DropdownMenuLabel className="p-0">
            Notifikasi {unreadCount > 0 && `(${unreadCount} baru)`}
          </DropdownMenuLabel>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 text-xs"
          >
            Refresh
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-100 overflow-y-auto">
          {loading ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Tidak ada notifikasi baru
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Aktivitas penting akan muncul di sini
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                activity={notification}
                onClose={() => setOpen(false)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-3 text-center cursor-pointer">
              <Link
                to="/app/history"
                className="text-sm text-primary hover:underline w-full block"
                onClick={() => setOpen(false)}
              >
                Lihat Semua Riwayat →
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
