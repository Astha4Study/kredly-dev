import * as React from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { sessionService } from '@/services/sessionService';
import type { QuizItem, AnswerResponse } from './types';
import QuestionCard from '@/components/cat/QuestionCard';
import AnswerOptions from '@/components/cat/AnswerOptions';
import ProgressBar from '@/components/cat/ProgressBar';
import Timer from '@/components/cat/Timer';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function QuizPage() {
  const params = useParams({ strict: false });
  const sessionId = (params as any).sessionId || '';
  const navigate = useNavigate();

  // Quiz States
  const [currentItem, setCurrentItem] = React.useState<QuizItem | null>(null);
  const [questionNumber, setQuestionNumber] = React.useState(1);
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Feedback States
  const [showResult, setShowResult] = React.useState(false);
  const [feedback, setFeedback] = React.useState<AnswerResponse | null>(null);
  const [countdown, setCountdown] = React.useState(5);
  const [timerKey, setTimerKey] = React.useState(0);
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
    navigate({ to: '/parseCV' });
  };

  // Fetch first question on mount
  React.useEffect(() => {
    if (!sessionId) {
      setError('ID Sesi tidak ditemukan.');
      setIsLoading(false);
      return;
    }
    loadNextQuestion();
  }, [sessionId]);

  const loadNextQuestion = async () => {
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat soal berikutnya.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (overrideAnswer?: string) => {
    // If we are already submitting or showing result, do nothing
    if (isSubmitting || showResult) return;

    const finalAnswer =
      overrideAnswer !== undefined ? overrideAnswer : selectedAnswer;
    if (!finalAnswer && overrideAnswer === undefined) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Send answer to backend (use "" if skipped or timed out)
      const res = await sessionService.submitAnswer(
        sessionId,
        finalAnswer || '',
      );
      setFeedback(res);
      setShowResult(true);

      // Start countdown to next question
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
    // Clean up any remaining countdown intervals
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      setCountdownIntervalId(null);
    }

    setIsSubmitting(false);

    if (answerRes.completed) {
      navigate({ to: `/result/${sessionId}` });
    } else {
      setTimerKey((prev) => prev + 1);
      loadNextQuestion();
    }
  };

  const handleTimeUp = () => {
    // Auto-submit with empty answer when time runs out
    handleSubmit('');
  };

  // Safe manual skip or fast forward countdown
  const handleFastForward = () => {
    if (feedback) {
      handleNextStep(feedback);
    }
  };

  if (isLoading && !currentItem) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Skeleton Header */}
          <div className="flex justify-between items-center animate-pulse">
            <div className="h-8 w-24 bg-foreground/10 rounded-lg" />
            <div className="h-8 w-20 bg-foreground/10 rounded-lg" />
          </div>
          {/* Skeleton Progress */}
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-40 bg-foreground/10 rounded-lg" />
            <div className="h-3 w-full bg-foreground/10 rounded-lg" />
          </div>
          {/* Skeleton Card */}
          <Card className="border border-foreground/5 bg-background/30 backdrop-blur-sm animate-pulse">
            <CardContent className="h-48 flex flex-col justify-center space-y-4 p-6">
              <div className="h-4 w-1/4 bg-foreground/10 rounded-lg" />
              <div className="h-4 w-3/4 bg-foreground/10 rounded-lg" />
              <div className="h-4 w-5/6 bg-foreground/10 rounded-lg" />
            </CardContent>
          </Card>
          {/* Skeleton Options */}
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-foreground/10 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !currentItem) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-6">
        <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 backdrop-blur-md">
          <CardContent className="p-6 text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="size-12 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-rose-400">
                Terjadi Kesalahan
              </h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={loadNextQuestion}
              variant="outline"
              className="w-full border-rose-500/30 hover:bg-rose-500/10"
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-6 md:space-y-8 my-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitWarning(true)}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="mr-2 size-4" /> Kembali
          </Button>

          {currentItem && !showResult && (
            <Timer
              duration={120} // 2 minutes per question
              isActive={!isLoading && !showResult}
              onTimeUp={handleTimeUp}
              resetKey={timerKey}
            />
          )}
        </div>

        {/* Progress Tracker */}
        <ProgressBar
          currentQuestion={questionNumber}
          minQuestions={10}
          maxQuestions={30}
        />

        {/* Main Quiz Area */}
        {currentItem && (
          <div className="space-y-6">
            {/* Question Box */}
            <QuestionCard
              question={currentItem.pertanyaan}
              topic={currentItem.topic}
              questionNumber={questionNumber}
            />

            {/* Answer Selections */}
            {currentItem.type === 'essay' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-muted-foreground">
                    Jawaban Essay Anda:
                  </label>
                  <span className="text-xs text-muted-foreground/60">
                    Tuliskan penjelasan teknis yang mendalam
                  </span>
                </div>
                <textarea
                  disabled={isLoading || isSubmitting || showResult}
                  value={selectedAnswer || ''}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  placeholder="Ketik penjelasan teknis Anda secara detail di sini..."
                  className="w-full min-h-[160px] p-4 rounded-2xl border border-foreground/10 bg-background/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 resize-y text-sm leading-relaxed"
                />
              </motion.div>
            ) : (
              <AnswerOptions
                options={currentItem.pilihan || []}
                selectedAnswer={selectedAnswer}
                onSelect={setSelectedAnswer}
                disabled={isLoading || isSubmitting || showResult}
                correctAnswer={feedback?.correct_answer}
                showResult={showResult}
              />
            )}

            {/* Explanation box shown after submission */}
            <AnimatePresence>
              {showResult && feedback && currentItem.type !== 'essay' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="border border-foreground/5 bg-foreground/5 backdrop-blur-sm mt-4">
                    <CardContent className="p-5 space-y-3">
                      <h4 className="text-sm font-bold text-foreground/90 uppercase tracking-wider">
                        Penjelasan Jawaban
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {feedback.explanation}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions Bar */}
            <div className="flex items-center justify-end pt-2">
              {!showResult ? (
                <Button
                  size="lg"
                  disabled={!(selectedAnswer && selectedAnswer.trim() !== '') || isSubmitting}
                  onClick={() => handleSubmit()}
                  className="w-full md:w-auto font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />{' '}
                      Menyerahkan...
                    </>
                  ) : (
                    <>
                      Kirim Jawaban <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="w-full" />
              )}
            </div>

            {/* Error banner inside quiz */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-rose-300 text-sm"
              >
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Result Banner */}
            <AnimatePresence>
              {showResult && feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-2xl border px-5 py-4',
                    currentItem.type === 'essay'
                      ? 'border-blue-500/20 bg-blue-500/5'
                      : feedback.correct
                        ? 'border-emerald-500/20 bg-emerald-500/5'
                        : 'border-rose-500/20 bg-rose-500/5',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-9 items-center justify-center rounded-xl font-bold border text-base',
                        currentItem.type === 'essay'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : feedback.correct
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                      )}
                    >
                      {currentItem.type === 'essay' ? 'i' : feedback.correct ? '✓' : '✗'}
                    </div>
                    <p
                      className={cn(
                        'font-semibold text-sm',
                        currentItem.type === 'essay'
                          ? 'text-blue-400'
                          : feedback.correct
                            ? 'text-emerald-400'
                            : 'text-rose-400',
                      )}
                    >
                      {currentItem.type === 'essay'
                        ? 'Jawaban Essay Tersimpan'
                        : feedback.correct
                          ? 'Jawaban Benar!'
                          : 'Jawaban Salah'}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFastForward}
                    className="border-foreground/10 hover:bg-foreground/5 text-xs font-semibold shrink-0"
                  >
                    Lanjutkan ({countdown}s){' '}
                    <ArrowRight className="ml-2 size-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Ujian?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar? Sesi ujian CAT ini akan dihentikan sementara, namun progress Anda tetap tersimpan dan tidak akan diselesaikan secara otomatis. Anda dapat melanjutkannya nanti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitWarning(false)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
