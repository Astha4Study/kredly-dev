import { User, Mail, Bell, Shield, Trash2 } from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

const menuItems = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'account', label: 'Akun', icon: Mail },
  { id: 'security', label: 'Keamanan', icon: Shield },
  { id: 'notifications', label: 'Notifikasi', icon: Bell },
  { id: 'danger', label: 'Zona Berbahaya', icon: Trash2 },
];

export default function AppSidebarAccountSettings({
  activeMenu,
  setActiveMenu,
}: SidebarProps) {
  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-white p-6">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeMenu === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
