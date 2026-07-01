import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Lock } from 'lucide-react';

interface Assessment {
  id: string;
  skillName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  isRecommended: boolean;
  category: string;
  progress?: number;
  status?: 'available' | 'in-progress' | 'completed';
  score?: number;
  completedDate?: string;
  passed?: boolean;
  sessionId?: string;
  level?: string;
}

interface AssessmentCardProps {
  assessment: Assessment;
  isLocked?: boolean;
}

export const AssessmentCard = ({
  assessment,
  isLocked,
}: AssessmentCardProps) => (
  <Card
    className={`h-full border transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col ${isLocked ? 'opacity-65 bg-muted/10' : ''}`}
  >
    <CardHeader className="space-y-3">
      <div>
        <CardTitle className="text-xl font-bold">
          {assessment.skillName}
        </CardTitle>
        <CardDescription className="mt-1.5">
          Uji kemampuan {assessment.skillName} Anda dan dapatkan kredensial
          terverifikasi
        </CardDescription>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {isLocked && (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 py-0.5 px-2"
          >
            <Lock className="h-3 w-3" /> Terkunci
          </Badge>
        )}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {assessment.estimatedTime}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {assessment.questionCount} soal
        </div>
      </div>
    </CardHeader>

    <CardContent className="flex-1">
      {!isLocked && assessment.status !== 'available' && (
        <div className="border-t pt-3 space-y-3">
          {assessment.status === 'in-progress' &&
            assessment.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{assessment.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${assessment.progress}%` }}
                  />
                </div>
              </div>
            )}

          {assessment.status === 'completed' && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                <p className="text-2xl font-bold">
                  {assessment.score || 0}
                  <span className="text-base text-muted-foreground font-normal">
                    /1000
                  </span>
                </p>
              </div>
              <Badge
                variant="secondary"
                className="text-xs px-3 py-1 font-semibold"
              >
                {assessment.level || 'Completed'}
              </Badge>
            </div>
          )}
        </div>
      )}
    </CardContent>

    <CardContent>
      {isLocked ? (
        <Button
          className="w-full text-xs font-semibold gap-2"
          disabled
          variant="secondary"
        >
          <Lock className="h-3.5 w-3.5" /> Selesaikan Asesmen Role-based
        </Button>
      ) : (
        assessment.status === 'available' && (
          <Button className="w-full" asChild>
            <Link
              to="/app/assessment/$assessmentId"
              params={{ assessmentId: assessment.id }}
              preload="intent"
            >
              Mulai Assessment
            </Link>
          </Button>
        )
      )}
      {!isLocked && assessment.status === 'in-progress' && (
        <Button className="w-full">Lanjutkan Assessment</Button>
      )}
      {!isLocked && assessment.status === 'completed' && (
        <div className="flex gap-2">
          {assessment.sessionId ? (
            <Button className="w-full font-semibold" asChild>
              <Link
                to="/app/certification/$id"
                params={{ id: assessment.sessionId }}
                preload="intent"
              >
                Lihat Sertifikat
              </Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full font-semibold" asChild>
              <Link to="/app/kredensial" preload="intent">
                Lihat Kredensial
              </Link>
            </Button>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);
