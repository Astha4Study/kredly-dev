import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Keamanan</h2>
        <p className="text-sm text-muted-foreground">
          Kelola keamanan akun Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Autentikasi Dua Faktor</CardTitle>
          <CardDescription>
            Tambahkan lapisan keamanan ekstra untuk akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Aktifkan 2FA</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesi Aktif</CardTitle>
          <CardDescription>Kelola perangkat yang sedang login</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Browser Saat Ini</p>
                <p className="text-sm text-muted-foreground">Aktif sekarang</p>
              </div>
              <span className="text-xs text-green-600">Aktif</span>
            </div>
            <Button variant="outline" size="sm">
              Logout Semua Perangkat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
