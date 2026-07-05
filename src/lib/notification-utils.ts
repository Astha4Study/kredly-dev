import type { Activity } from './history-client';

/**
 * Activity types that should appear as notifications
 */
const IMPORTANT_ACTIVITY_TYPES = [
  'credential_earned',
  'blockchain_issued',
  'assessment_completed',
  'onboarding_completed',
] as const;

/**
 * Filter activities to only important ones that should appear as notifications
 */
export function getImportantActivities(activities: Activity[]): Activity[] {
  return activities.filter((a) =>
    IMPORTANT_ACTIVITY_TYPES.includes(a.type as any),
  );
}

/**
 * Filter activities to only recent ones within the specified time window
 * @param activities - List of activities to filter
 * @param hoursAgo - Number of hours to look back (default: 24)
 */
export function getRecentActivities(
  activities: Activity[],
  hoursAgo = 24,
): Activity[] {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hoursAgo);

  return activities.filter((a) => {
    const activityTime = new Date(a.createdAt);
    return activityTime >= cutoff;
  });
}

/**
 * Format timestamp to human-readable relative time in Indonesian
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60),
  );

  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return time.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Check if an activity is "new" (within the last hour)
 */
export function isNew(timestamp: string): boolean {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMinutes = (now.getTime() - time.getTime()) / (1000 * 60);
  return diffMinutes <= 60;
}

const LAST_SEEN_KEY = 'notifications_last_seen';

/**
 * Get the timestamp when notifications were last seen
 */
export function getLastSeenTimestamp(): number | null {
  const stored = localStorage.getItem(LAST_SEEN_KEY);
  return stored ? parseInt(stored, 10) : null;
}

/**
 * Mark all current notifications as seen
 */
export function markNotificationsAsSeen(): void {
  localStorage.setItem(LAST_SEEN_KEY, Date.now().toString());
}

/**
 * Filter activities to only those that are unread (newer than last seen)
 */
export function getUnreadActivities(
  activities: Activity[],
  lastSeenOverride?: number | null,
): Activity[] {
  const lastSeen =
    lastSeenOverride !== undefined ? lastSeenOverride : getLastSeenTimestamp();
  if (!lastSeen) return activities;

  return activities.filter((activity) => {
    const activityTime = new Date(
      activity.date + ' ' + activity.time,
    ).getTime();
    return activityTime > lastSeen;
  });
}

/**
 * Get the navigation target path for a given activity
 */
export function getNotificationTarget(activity: Activity): string {
  switch (activity.type) {
    case 'assessment_completed':
    case 'credential_earned':
    case 'blockchain_issued':
      return '/app/certification';
    case 'onboarding_completed':
      return '/app';
    default:
      return '/app/history';
  }
}
