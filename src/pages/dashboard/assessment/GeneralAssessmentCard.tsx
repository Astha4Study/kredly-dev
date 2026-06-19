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
import { BookOpen, Clock, FileQuestion, CheckCircle2 } from 'lucide-react';

interface GeneralAssessment {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  questionCount: number;
  topics: string[];
  isRecommended: boolean;
}

interface GeneralAssessmentCardProps {
  assessment: GeneralAssessment;
}

export const GeneralAssessmentCard = ({
  assessment,
}: GeneralAssessmentCardProps) => (
  <Card className="h-full border transition-all duration-300 shadow-xs hover:shadow-sm flex flex-col">
    <CardHeader className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">General Role</Badge>

        {assessment.isRecommended && (
          <Badge variant="default">Recommended</Badge>
        )}
      </div>

      <div>
        <CardTitle className="text-xl font-bold">
          {assessment.title}
        </CardTitle>

        <CardDescription className="mt-2 leading-5">
          {assessment.description}
        </CardDescription>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {assessment.estimatedTime}
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <FileQuestion className="h-3.5 w-3.5" />
          {assessment.questionCount} Soal
        </div>
      </div>
    </CardHeader>

    <CardContent className="flex-1">
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Materi Diujikan</span>
        </div>

        <ul className="space-y-2">
          {assessment.topics.map((topic, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />

              <span className="text-muted-foreground">{topic}</span>
            </li>
          ))}
        </ul>
      </div>
    </CardContent>

    <CardContent className="pt-0">
      <Button className="w-full" asChild>
        <Link
          to="/app/assasemen/$assessmentId"
          params={{ assessmentId: assessment.id }}
        >
          Mulai Asesmen
        </Link>
      </Button>
    </CardContent>
  </Card>
);
