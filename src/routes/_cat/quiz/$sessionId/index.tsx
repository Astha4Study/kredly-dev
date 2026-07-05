import * as React from 'react';
import {
  createFileRoute,
  useParams,
  useNavigate,
} from '@tanstack/react-router';
import { sessionService } from '@/services/sessionService';
import type { QuizItem, AnswerResponse } from '@/pages/client/cat/types';
import ProgressBar from '@/components/cat/ProgressBar';
import QuizCountdown from '@/components/cat/QuizCountdown';
import ResumeSessionBanner from '@/components/cat/ResumeSessionBanner';
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
  const [retryAttempt, setRetryAttempt] = React.useState(0);
  const [loadingMessage, setLoadingMessage] = React.useState('Memuat soal...');
  const [submitRetryAttempt, setSubmitRetryAttempt] = React.useState(0);
  const [submitLoadingMessage, setSubmitLoadingMessage] = React.useState(
    'Mengirim jawaban...',
  );

  // Countdown timer: 0 means no time limit
  const [estimatedSeconds, setEstimatedSeconds] = React.useState(0);

  // Resume session state
  const [isResumingSession, setIsResumingSession] = React.useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = React.useState<string>('');
  const [resumedQuestionsCount, setResumedQuestionsCount] = React.useState(0);

  // Feedback States
  const [showResult, setShowResult] = React.useState(false);
  const [feedback, setFeedback] = React.useState<AnswerResponse | null>(null);
  const [countdown, setCountdown] = React.useState(3);
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
    setCountdown(3);
    setRetryAttempt(0);
    setLoadingMessage('Memuat soal...');

    const maxRetries = 3;
    let attempt = 0;

    const tryFetch = async (): Promise<void> => {
      try {
        if (attempt > 0) {
          setLoadingMessage(
            `Menghubungkan ke server Kredly${'.'.repeat((attempt % 3) + 1)}`,
          );
        }

        const res = await sessionService.getNextItem(
          sessionId,
          attempt,
          maxRetries,
        );
        setCurrentItem(res.item);
        setQuestionNumber(res.question_number);
        if (res.max_questions !== undefined) setMaxQuestions(res.max_questions);
        if (res.min_questions !== undefined) setMinQuestions(res.min_questions);
        setIsLoading(false);
      } catch (err: any) {
        attempt++;
        setRetryAttempt(attempt);

        if (attempt <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          setLoadingMessage(
            `Menghubungkan ke server Kredly, mencoba kembali...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return tryFetch();
        } else {
          console.error(err);
          setError(err.message || 'Gagal memuat soal berikutnya.');
          setIsLoading(false);
        }
      }
    };

    await tryFetch();
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

        // --- Resume TTL check ---
        // If the session can no longer be resumed (expired or abandoned),
        // redirect the user to the dashboard with an informative message.
        if (!sess.is_resumable) {
          navigate({
            to: '/app',
            search: { sessionExpired: '1' } as any,
          });
          return;
        }

        // If the user already answered some questions, show the resume banner
        if (sess.total_items > 0) {
          setIsResumingSession(true);
          setResumedQuestionsCount(sess.total_items);
          setSessionExpiresAt(sess.expires_at);
        }
        // --- End resume TTL check ---

        setMaxQuestions(sess.max_items);
        setMinQuestions(sess.min_items);
        setAssessmentId(sess.assessment_id);
        if (sess.estimated_time_seconds && sess.estimated_time_seconds > 0) {
          setEstimatedSeconds(sess.estimated_time_seconds);
        }
      } catch (err: any) {
        console.error('Failed to pre-fetch session metadata:', err);
      }
      loadNextQuestion();
    }

    initSession();
  }, [sessionId, loadNextQuestion]);

  /**
   * Called when the exam countdown reaches zero.
   * Navigates to the result/certification page.
   * The backend GetResult handler will force-complete the session if min items are met.
   */
  const handleTimeUp = React.useCallback(() => {
    isNavigatingAway.current = true;
    navigate({ to: `/app/certification/${sessionId}` });
  }, [navigate, sessionId]);

  const handleSubmit = async (overrideAnswer?: string) => {
    if (isSubmitting || showResult) return;

    const finalAnswer =
      overrideAnswer !== undefined ? overrideAnswer : selectedAnswer;
    if (!finalAnswer && overrideAnswer === undefined) return;

    setIsSubmitting(true);
    setError(null);
    setSubmitRetryAttempt(0);
    setSubmitLoadingMessage('Mengirim jawaban...');

    const maxRetries = 3;
    let attempt = 0;

    const trySubmit = async (): Promise<void> => {
      try {
        if (attempt > 0) {
          setSubmitLoadingMessage(
            `Menghubungkan ke server Kredly${'.'.repeat((attempt % 3) + 1)}`,
          );
        }

        const res = await sessionService.submitAnswer(
          sessionId,
          finalAnswer || '',
          attempt,
          maxRetries,
        );

        setFeedback(res);
        setShowResult(true);

        let counter = 3;
        const interval = setInterval(() => {
          counter -= 1;
          setCountdown(counter);
          if (counter <= 0) {
            clearInterval(interval);
            handleNextStep(res);
          }
        }, 1000);
        setCountdownIntervalId(interval);
        setIsSubmitting(false);
      } catch (err: any) {
        attempt++;
        setSubmitRetryAttempt(attempt);

        if (attempt <= maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          setSubmitLoadingMessage(
            `Menghubungkan ke server Kredly, mencoba kembali...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return trySubmit();
        } else {
          console.error(err);
          setError(err.message || 'Gagal mengirimkan jawaban.');
          setIsSubmitting(false);
        }
      }
    };

    await trySubmit();
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
    return <QuizSkeleton loadingMessage={loadingMessage} />;
  }

  if (error && !currentItem) {
    return (
      <QuizErrorView
        error={error}
        onRetry={loadNextQuestion}
        retryAttempt={retryAttempt}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppTopbarAssessment
        assessmentId={assessmentId}
        onBack={() => setShowExitWarning(true)}
      />
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-6 md:space-y-8 my-auto">
          {/* Resume banner — shown when user returns to an in-progress session */}
          {isResumingSession && sessionExpiresAt && (
            <ResumeSessionBanner
              questionsAnswered={resumedQuestionsCount}
              expiresAt={sessionExpiresAt}
            />
          )}

          {/* Progress bar + Countdown timer row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ProgressBar
                currentQuestion={questionNumber}
                minQuestions={minQuestions}
                maxQuestions={maxQuestions}
              />
            </div>
            {estimatedSeconds > 0 && (
              <QuizCountdown
                totalSeconds={estimatedSeconds}
                onTimeUp={handleTimeUp}
              />
            )}
          </div>

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
                submitLoadingMessage={submitLoadingMessage}
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
