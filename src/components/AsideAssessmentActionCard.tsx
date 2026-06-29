import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AsideAssessmentActionCardProps {
  role: string;
  level: string;
  skills: string[];
  sessionError: string | null;
  isCreatingSession: boolean;
  onStartExam: () => void;
}

export const AsideAssessmentActionCard = ({
  role,
  level,
  skills,
  sessionError,
  isCreatingSession,
  onStartExam,
}: AsideAssessmentActionCardProps) => {
  return (
    <Card className="border-border/50 sticky top-20">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">
          Siap Memulai?
        </CardTitle>
        <CardDescription>
          Pastikan Anda sudah siap sebelum memulai asesmen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium text-foreground">
              {role || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Level</span>
            <span className="font-medium text-foreground">{level}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Skill Diuji</span>
            <span className="font-medium text-foreground">
              {skills.length} skill
            </span>
          </div>
        </div>

        {sessionError && (
          <div className="flex items-start gap-2 p-3 border border-rose-500/20 bg-rose-500/5 rounded-lg text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{sessionError}</span>
          </div>
        )}

        <Button
          size="lg"
          onClick={onStartExam}
          disabled={skills.length === 0 || isCreatingSession}
          className="w-full group cursor-pointer"
        >
          {isCreatingSession ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Membuat Sesi...
            </>
          ) : (
            <>Mulai Asesmen</>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Dengan memulai asesmen, Anda menyetujui{' '}
          <a href="#" className="text-primary hover:underline">
            syarat dan ketentuan
          </a>
        </p>
      </CardContent>
    </Card>
  );
};
