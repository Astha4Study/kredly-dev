import * as React from 'react';
import {
  createFileRoute,
  useParams,
  useNavigate,
} from '@tanstack/react-router';
import { sessionService } from '@/services/sessionService';
import type { QuizItem, AnswerResponse } from '@/pages/client/cat/types';
import ProgressBar from '@/components/cat/ProgressBar';
import AppTopbarAssessment from '@/components/AppTopbarAssessment';

// Section components
import QuizSkeleton from '@/pages/client/cat/quiz/QuizSkeleton';
import QuizErrorView from '@/pages/client/cat/quiz/QuizErrorView';
import QuizContent from '@/pages/client/cat/quiz/QuizContent';
import QuizActions from '@/pages/client/cat/quiz/QuizActions';
import QuizExitDialog from '@/pages/client/cat/quiz/QuizExitDialog';

export const Route = createFileRoute('/_cat/quiz/$sessionId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const params = useParams({ strict: false });
  const sessionId = (params as any).sessionId || '';
  const navigate = useNavigate();

  // Quiz States
  const [currentItem, setCurrentItem] = React.useState<QuizItem | null>(null);
  const [questionNumber, setQuestionNumber] = React.useState(1);
  const [maxQuestions, setMaxQuestions] = React.useState(30);
  const [minQuestions, setMinQuestions] = React.useState(10);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [assessmentId, setAssessmentId] = React.useState<string | undefined>(
    undefined,
  );

  // Feedback States
  const [showResult, setShowResult] = React.useState(false);
  const [feedback, setFeedback] = React.useState<AnswerResponse | null>(null);
  const [countdown, setCountdown] = React.useState(5);
  const [countdownIntervalId, setCountdownIntervalId] =
    React.useState<ReturnType<typeof setInterval> | null>(null);

  // Exit warning states
  const [showExitWarning, setShowExitWarning] = React.useState(false);
  const isNavigatingAway = React.useRef(false);

  // Intercept browser back button
  React.useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isNavigatingAway.current) return;
      window.history.pushState(null, '', window.location.href);
      setShowExitWarning(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleConfirmExit = async () => {
    isNavigatingAway.current = true;
    try {
      await sessionService.abandonSession(sessionId);
    } catch (err) {
      console.error('Failed to abandon session:', err);
    }
    navigate({ to: '/app' });
  };

  const loadNextQuestion = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback(null);
    setCountdown(5);

    try {
      const res = await sessionService.getNextItem(sessionId);
      setCurrentItem(res.item);
      setQuestionNumber(res.question_number);
      if (res.max_questions !== undefined) setMaxQuestions(res.max_questions);
      if (res.min_questions !== undefined) setMinQuestions(res.min_questions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat soal berikutnya.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Fetch session details and first question on mount
  React.useEffect(() => {
    if (!sessionId) {
      setError('ID Sesi tidak ditemukan.');
      setIsLoading(false);
      return;
    }

    async function initSession() {
      try {
        const sess = await sessionService.getSession(sessionId);
        setMaxQuestions(sess.max_items);
        setMinQuestions(sess.min_items);
        setAssessmentId(sess.assessment_id);
      } catch (err: any) {
        console.error('Failed to pre-fetch session metadata:', err);
      }
      loadNextQuestion();
    }

    initSession();
  }, [sessionId, loadNextQuestion]);

  const handleSubmit = async (overrideAnswer?: string) => {
    if (isSubmitting || showResult) return;

    const finalAnswer =
      overrideAnswer !== undefined ? overrideAnswer : selectedAnswer;
    if (!finalAnswer && overrideAnswer === undefined) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await sessionService.submitAnswer(
        sessionId,
        finalAnswer || '',
      );
      setFeedback(res);
      setShowResult(true);

      let counter = 5;
      const interval = setInterval(() => {
        counter -= 1;
        setCountdown(counter);
        if (counter <= 0) {
          clearInterval(interval);
          handleNextStep(res);
        }
      }, 1000);
      setCountdownIntervalId(interval);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal mengirimkan jawaban.');
      setIsSubmitting(false);
    }
  };

  const handleNextStep = (answerRes: AnswerResponse) => {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      setCountdownIntervalId(null);
    }

    setIsSubmitting(false);

    if (answerRes.completed) {
      navigate({ to: `/app/certification/${sessionId}` });
    } else {
      loadNextQuestion();
    }
  };

  const handleFastForward = () => {
    if (feedback) {
      handleNextStep(feedback);
    }
  };

  if (isLoading && !currentItem) {
    return <QuizSkeleton />;
  }

  if (error && !currentItem) {
    return <QuizErrorView error={error} onRetry={loadNextQuestion} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppTopbarAssessment
        assessmentId={assessmentId}
        onBack={() => setShowExitWarning(true)}
      />
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-3xl space-y-6 md:space-y-8 my-auto">
          <ProgressBar
            currentQuestion={questionNumber}
            minQuestions={minQuestions}
            maxQuestions={maxQuestions}
          />

          {currentItem && (
            <div className="space-y-6">
              <QuizContent
                currentItem={currentItem}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                isLoading={isLoading}
                isSubmitting={isSubmitting}
                showResult={showResult}
                feedback={feedback}
                questionNumber={questionNumber}
              />

              <QuizActions
                showResult={showResult}
                selectedAnswer={selectedAnswer}
                isSubmitting={isSubmitting}
                onSubmit={() => handleSubmit()}
                onContinue={handleFastForward}
                countdown={countdown}
                error={error}
              />
            </div>
          )}
        </div>
      </div>

      <QuizExitDialog
        open={showExitWarning}
        onOpenChange={setShowExitWarning}
        onConfirm={handleConfirmExit}
      />
    </div>
  );
}
