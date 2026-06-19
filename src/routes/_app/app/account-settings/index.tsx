import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import AppSidebarAccountSettings from '@/components/AppSidebarAccountSettings';
import ProfileTab from '@/pages/dashboard/account-settings/ProfileTab';
import AccountTab from '@/pages/dashboard/account-settings/AccountTab';
import SecurityTab from '@/pages/dashboard/account-settings/SecurityTab';
import NotificationsTab from '@/pages/dashboard/account-settings/NotificationsTab';
import DangerTab from '@/pages/dashboard/account-settings/DangerTab';

export const Route = createFileRoute('/_app/app/account-settings/')({
  component: RouteComponent,
});

interface UserProfile {
  id: string;
  userId: string;
  cvFileName: string;
  cvFilePath: string;
  experience: string;
  isStudent: boolean;
  degree?: string;
  createdAt: string;
  updatedAt: string;
}

function RouteComponent() {
  const [activeMenu, setActiveMenu] = useState('profile');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return <ProfileTab userProfile={userProfile} />;
      case 'account':
        return <AccountTab />;
      case 'security':
        return <SecurityTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'danger':
        return <DangerTab />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AppSidebarAccountSettings
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-4">
              <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
              <div className="h-32 animate-pulse rounded-xl bg-muted" />
              <div className="h-48 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AppSidebarAccountSettings
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">{renderContent()}</div>
      </main>
    </div>
  );
}
