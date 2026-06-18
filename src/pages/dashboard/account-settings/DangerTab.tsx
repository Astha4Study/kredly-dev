import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DangerTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Zona Berbahaya</h2>
        <p className="text-sm text-muted-foreground">
          Tindakan permanen yang tidak dapat dibatalkan
        </p>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Hapus Akun</CardTitle>
          <CardDescription>
            Menghapus akun akan menghapus semua data Anda secara permanen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Hapus Akun Saya</Button>
        </CardContent>
      </Card>
    </div>
  );
}
