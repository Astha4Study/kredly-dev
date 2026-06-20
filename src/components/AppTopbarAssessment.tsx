import { Link, useParams } from '@tanstack/react-router';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ArrowLeft, Clock, FileQuestion, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CVAssessment {
  id: string;
  type: 'general' | 'skill';
  title: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  topics?: string[];
  isRecommended: boolean;
  category?: string;
  status: string;
}

const difficultyColors = {
  Beginner:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  Intermediate:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  Advanced:
    'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
};

export default function AppTopbarAssessment() {
  const { assessmentId } = useParams({ strict: false }) as {
    assessmentId?: string;
  };
  const [assessment, setAssessment] = useState<CVAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssessment() {
      if (!assessmentId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile?.cvAssessments) {
            const matched = data.profile.cvAssessments.find(
              (a: CVAssessment) => a.id === assessmentId,
            );
            if (matched) {
              setAssessment(matched);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch assessment:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssessment();
  }, [assessmentId]);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="outline"
            size="icon"
            asChild
          >
            <Link
              to="/app/assessment"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="h-8 w-px bg-border shrink-0 hidden sm:block" />

          {isLoading ? (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20 hidden sm:block" />
            </div>
          ) : assessment ? (
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                {assessment.type === 'general' && (
                  <Sparkles className="h-4 w-4 text-primary shrink-0 hidden sm:block" />
                )}
                <h2 className="font-semibold text-base sm:text-lg text-foreground truncate">
                  {assessment.title}
                </h2>
              </div>

              <Badge
                variant="outline"
                className={`shrink-0 text-xs font-medium ${difficultyColors[assessment.difficulty]}`}
              >
                {assessment.difficulty}
              </Badge>

              <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {assessment.estimatedTime}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileQuestion className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {assessment.questionCount} Soal
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-base sm:text-lg text-foreground truncate">
                Persiapan Asesmen
              </h2>
            </div>
          )}
        </div>

        {assessment && (
          <div className="flex md:hidden items-center gap-2 text-xs text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{assessment.estimatedTime}</span>
          </div>
        )}
      </div>
    </header>
  );
}
