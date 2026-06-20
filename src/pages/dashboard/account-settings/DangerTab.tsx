import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DangerTab() {
  const [showFirstDialog, setShowFirstDialog] = useState(false);
  const [showSecondDialog, setShowSecondDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFirstConfirm = () => {
    setShowFirstDialog(false);
    setShowSecondDialog(true);
  };

  const handleFinalDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menghapus akun');
      }

      toast.success('Akun berhasil dihapus');

      // Logout and redirect to login page
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus akun',
      );
      setIsDeleting(false);
      setShowSecondDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Zona Berbahaya</h2>
        <p className="text-sm text-muted-foreground">
          Tindakan permanen yang tidak dapat dibatalkan
        </p>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Hapus Akun</CardTitle>
          <CardDescription>
            Menghapus akun akan menghapus semua data Anda secara permanen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowFirstDialog(true)}
            disabled={isDeleting}
          >
            Hapus Akun Saya
          </Button>
        </CardContent>
      </Card>

      {/* First Confirmation Dialog */}
      <AlertDialog open={showFirstDialog} onOpenChange={setShowFirstDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>

            <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>

            <AlertDialogDescription>
              Tindakan ini akan menghapus akun dan seluruh data yang terkait
              dengan akun Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={handleFirstConfirm}
            >
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Confirmation Dialog */}
      <AlertDialog open={showSecondDialog} onOpenChange={setShowSecondDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <AlertDialogTitle>Konfirmasi Penghapusan Akhir</AlertDialogTitle>

            <AlertDialogDescription>
              Ini adalah konfirmasi terakhir sebelum akun Anda dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Batalkan
            </AlertDialogCancel>

            <Button
              variant="destructive"
              onClick={handleFinalDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus Selamanya'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
