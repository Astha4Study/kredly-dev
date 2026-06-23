import { useAuth } from '@/contexts/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function AccountTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Akun</h2>
        <p className="text-sm text-muted-foreground">
          Kelola pengaturan akun Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Detail akun dan status verifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email</Label>
              <p className="text-sm">{user?.email}</p>
            </div>
            {user?.emailVerified ? (
              <Badge variant="default">Terverifikasi</Badge>
            ) : (
              <Button variant="outline" size="sm">
                Verifikasi Email
              </Button>
            )}
          </div>
          <Separator />
          <div>
            <Label>User ID</Label>
            <p className="font-mono text-sm">{user?.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
