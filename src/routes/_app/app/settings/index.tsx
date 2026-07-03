import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import AppSidebarAccountSettings from '@/components/AppSidebarAccountSettings';
import ProfileTab from '@/pages/dashboard/settings/ProfileTab';
import PublicProfileTab from '@/pages/dashboard/settings/PublicProfileTab';
import AccountTab from '@/pages/dashboard/settings/AccountTab';
import SecurityTab from '@/pages/dashboard/settings/SecurityTab';
import NotificationsTab from '@/pages/dashboard/settings/NotificationsTab';
import DangerTab from '@/pages/dashboard/settings/DangerTab';

export const Route = createFileRoute('/_app/app/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeMenu, setActiveMenu] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return <ProfileTab />;
      case 'public-profile':
        return <PublicProfileTab />;
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
