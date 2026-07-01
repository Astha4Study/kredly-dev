import { AssessmentCard } from './AssessmentCard';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { FolderSearch } from 'lucide-react';

interface Assessment {
  id: string;
  skillName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  isRecommended: boolean;
  category: string;
  status?: 'available' | 'in-progress' | 'completed';
}

interface RelatedSkilAsessmentsSectionProps {
  relatedAssessments: Assessment[];
  roleAssessmentCompleted: boolean;
}

export const RelatedSkilAsessmentsSection = ({
  relatedAssessments,
  roleAssessmentCompleted,
}: RelatedSkilAsessmentsSectionProps) => {
  return (
    <div className="space-y-4 pt-6">
      <div className="flex items-center justify-between pb-3 border-b">
        <h3 className="text-lg font-bold">Rekomendasi Asesmen Terkait</h3>
        <span className="text-sm font-medium text-muted-foreground">
          {relatedAssessments.length} Asesmen
        </span>
      </div>
      {relatedAssessments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedAssessments.map((assessment) => (
            <AssessmentCard
              key={assessment.id}
              assessment={assessment}
              isLocked={!roleAssessmentCompleted}
            />
          ))}
        </div>
      ) : (
        <Empty className="bg-white">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderSearch className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>Belum Ada Asesmen Terkait</EmptyTitle>
            <EmptyDescription>
              Belum ada asesmen terkait yang dapat direkomendasikan.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
};
