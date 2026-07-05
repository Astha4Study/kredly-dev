import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import type { Activity } from '@/lib/history-client';
import { NotificationItem } from '@/components/NotificationItem';
import { NotificationSkeleton } from '@/components/skeletons/NotificationSkeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getUnreadActivities,
  markNotificationsAsSeen,
  getLastSeenTimestamp,
} from '@/lib/notification-utils';

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
  const [lastSeen, setLastSeen] = useState<number | null>(
    getLastSeenTimestamp(),
  );
  const unreadCount = getUnreadActivities(notifications, lastSeen).length;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      const now = Date.now();
      markNotificationsAsSeen();
      setLastSeen(now);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative flex"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1 text-xs rounded-full bg-primary">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] sm:w-96 max-w-96"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 sm:p-3 border-b gap-2">
          <DropdownMenuLabel className="p-0 text-sm truncate">
            Notifikasi {unreadCount > 0 && `(${unreadCount} baru)`}
          </DropdownMenuLabel>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 text-xs shrink-0"
          >
            Refresh
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] sm:max-h-100 overflow-y-auto">
          {loading ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 ? (
            <div className="p-6 sm:p-8 text-center">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3" />
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
            <DropdownMenuItem
              asChild
              className="p-2 sm:p-3 text-center cursor-pointer"
            >
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
