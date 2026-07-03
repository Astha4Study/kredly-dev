import { useAuth } from '@/contexts/auth';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function UserAvatar() {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const { user, signOut } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      toast.success('Berhasil logout');
      navigate({ to: '/login', replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Gagal logout');
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20">
          <Avatar className="size-8">
            {!imageError && user?.image ? (
              <AvatarImage
                src={user.image}
                alt={user.name || 'User'}
                onError={() => setImageError(true)}
              />
            ) : null}

            <AvatarFallback className="bg-muted text-foreground">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate({ to: '/app/profile' })}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate({ to: '/app/settings' })}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Pengaturan</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
