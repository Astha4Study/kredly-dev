import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ClipboardCheck } from 'lucide-react';
import { AssessmentCard } from './AssessmentCard';

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

interface FinishedTabProps {
  completedAssessments: Assessment[];
  profileExists: boolean;
}

export const FinishedTab = ({
  completedAssessments,
  profileExists,
}: FinishedTabProps) => {
  return (
    <TabsContent value="completed" className="space-y-6 mt-6">
      {!profileExists ? (
        <Card className="py-12 border">
          <CardContent className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Belum ada data skill
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Silakan unggah CV Anda terlebih dahulu.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : completedAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedAssessments.map((assessment) => (
            <AssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      ) : (
        <Empty className="bg-white">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardCheck className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>Belum Ada Assessment</EmptyTitle>
            <EmptyDescription className="max-w-sm">
              Anda belum menyelesaikan assessment apa pun.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </TabsContent>
  );
};
