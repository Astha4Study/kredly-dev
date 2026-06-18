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
