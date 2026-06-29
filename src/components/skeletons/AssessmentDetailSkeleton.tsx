import { AssessmentInfoCardSkeleton } from './AssessmentInfoCardSkeleton';
import { SkillTopicSelectionCardSkeleton } from './SkillTopicSelectionCardSkeleton';
import { GuidelinesCardSkeleton } from './GuidelinesCardSkeleton';
import { AsideAssessmentActionCardSkeleton } from './AsideAssessmentActionCardSkeleton';

export const AssessmentDetailSkeleton = () => {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-5xl">
        <div className="space-y-6">
          {/* Assessment Info Card */}
          <AssessmentInfoCardSkeleton />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Skill/Topic Selection & Guidelines */}
            <div className="lg:col-span-2 space-y-5">
              <SkillTopicSelectionCardSkeleton />
              <GuidelinesCardSkeleton />
            </div>

            {/* Right: Action Card */}
            <div className="lg:col-span-1">
              <AsideAssessmentActionCardSkeleton />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
