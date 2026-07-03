import { useNavigate } from '@tanstack/react-router';
import { Clock } from 'lucide-react';
import type { Activity } from '@/lib/history-client';
import { getActivityIcon } from '@/lib/activity-icons';
import {
  formatTimeAgo,
  getNotificationTarget,
  isNew,
} from '@/lib/notification-utils';
import { Badge } from '@/components/ui/badge';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface NotificationItemProps {
  activity: Activity;
  onClose: () => void;
}

export function NotificationItem({ activity, onClose }: NotificationItemProps) {
  const navigate = useNavigate();
  const icon = getActivityIcon(activity.type);
  const timeAgo = formatTimeAgo(activity.createdAt);
  const target = getNotificationTarget(activity);
  const showNewBadge = isNew(activity.createdAt);

  const handleClick = () => {
    navigate({ to: target });
    onClose();
  };

  return (
    <DropdownMenuItem
      className="p-3 cursor-pointer hover:bg-muted transition-colors focus:bg-muted"
      onClick={handleClick}
    >
      <div className="flex gap-3 w-full">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight">
              {activity.title}
            </p>
            {showNewBadge && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">
                Baru
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {activity.description}
          </p>

          {/* Metadata - show score if available */}
          {activity.metadata?.score && (
            <p className="text-xs text-primary font-medium">
              Skor: {activity.metadata.score}/100
            </p>
          )}

          {/* Time ago */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </p>
        </div>
      </div>
    </DropdownMenuItem>
  );
}
