import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Plus, Upload } from 'lucide-react';

interface CustomizationAndReuploadSectionProps {
  allSkillsCompleted: boolean;
}

export const CustomizationAndReuploadSection = ({
  allSkillsCompleted,
}: CustomizationAndReuploadSectionProps) => {
  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <div>
          <h3 className="text-lg font-bold">Kustomisasi & Pembaruan Asesmen</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tambahkan asesmen mandiri atau perbarui profil kompetensi Anda
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Custom Assessment Card */}
        <Card
          className={`relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${!allSkillsCompleted ? 'opacity-65 bg-muted/10' : 'hover:shadow-md'}`}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Plus className="h-5 w-5" />
              </div>
              {!allSkillsCompleted && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
                >
                  <Lock className="h-3 w-3" /> Terkunci
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold mt-2">
              Tambah Asesmen Kustom
            </CardTitle>
            <CardDescription>
              Pilih secara spesifik skill yang ingin Anda uji secara mandiri di
              luar hasil ekstraksi CV Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 text-xs font-semibold"
              disabled={!allSkillsCompleted}
              variant={!allSkillsCompleted ? 'secondary' : 'default'}
            >
              {!allSkillsCompleted ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {!allSkillsCompleted
                ? 'Selesaikan Asesmen Skill'
                : 'Pilih Skill Baru'}
            </Button>
          </CardContent>
        </Card>

        {/* Re-upload CV Card */}
        <Card
          className={`relative overflow-hidden border transition-all duration-300 flex flex-col justify-between ${!allSkillsCompleted ? 'opacity-65 bg-muted/10' : 'hover:shadow-md'}`}
        >
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Upload className="h-5 w-5" />
              </div>
              {!allSkillsCompleted && (
                <Badge
                  variant="outline"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
                >
                  <Lock className="h-3 w-3" /> Terkunci
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold mt-2">
              Upload Ulang CV
            </CardTitle>
            <CardDescription>
              Ingin memperbarui rekomendasi asesmen? Upload CV terbaru Anda
              untuk mengekstrak ulang daftar skill dan role Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              className="w-full gap-2 text-xs font-semibold"
              disabled={!allSkillsCompleted}
              variant={!allSkillsCompleted ? 'secondary' : 'default'}
            >
              {!allSkillsCompleted ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {!allSkillsCompleted
                ? 'Selesaikan Asesmen Skill'
                : 'Upload CV Baru'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
