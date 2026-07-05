import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useCVParser } from '@/pages/client/parse-cv/useCVParser';
import UploadView from '@/pages/client/parse-cv/UploadView';
import LoadingSequence from '@/pages/client/parse-cv/LoadingSequence';
import ParsedResultView from '@/pages/client/parse-cv/ParsedResultView';
import Illustration1 from '@/assets/images/Illustration1.png';
import * as React from 'react';
import { useAppLayout } from '@/contexts/app-layout';

export const Route = createFileRoute('/_app/app/new-assessment/upload-cv/')({
  component: NewAssessmentUploadCVPage,
});

function NewAssessmentUploadCVPage() {
  const { setShowTopBar } = useAppLayout();
  const parserState = useCVParser();

  // Hide top bar for onboarding look and feel
  React.useEffect(() => {
    setShowTopBar(false);
    return () => setShowTopBar(true);
  }, [setShowTopBar]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12 bg-background text-foreground font-sans">
      {/* Decorative Glow Left */}
      <div className="pointer-events-none absolute -left-24 top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl md:block" />

      {/* Decorative Glow Right */}
      <div className="pointer-events-none absolute -right-24 top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl md:block" />

      {/* Illustration */}
      <div className="pointer-events-none absolute bottom-0 -left-3 hidden lg:block">
        <img
          src={Illustration1}
          alt="Illustration"
          width={400}
          height={500}
          className="w-100 h-auto aspect-6/5 object-contain select-none opacity-90 xl:w-125"
          loading="lazy"
        />
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-2xl bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              to="/app/assessment"
              preload="intent"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-base sm:text-lg leading-none text-foreground">
                  Pembaruan Asesmen via CV
                </h1>
                <span className="text-xs text-muted-foreground">
                  Dapatkan rekomendasi kompetensi baru
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Upload View */}
        {!parserState.isLoading && !parserState.isParsed && (
          <UploadView
            file={parserState.file}
            isDragging={parserState.isDragging}
            error={parserState.error}
            isLoading={parserState.isLoading}
            handleDragOver={parserState.handleDragOver}
            handleDragLeave={parserState.handleDragLeave}
            handleDrop={parserState.handleDrop}
            handleFileChange={parserState.handleFileChange}
            parseCV={parserState.parseCV}
          />
        )}

        {/* Loading Fullscreen Sequence */}
        {parserState.isLoading && (
          <LoadingSequence parseStep={parserState.parseStep} />
        )}

        {/* Step 2: Parsed Result View */}
        {!parserState.isLoading && parserState.isParsed && (
          <ParsedResultView
            role={parserState.role}
            skills={parserState.skills}
            allParsedSkills={parserState.allParsedSkills}
            extractedLevel={parserState.extractedLevel}
            isExamReady={parserState.isExamReady}
            setRole={parserState.setRole}
            toggleSkill={parserState.toggleSkill}
            addCustomSkill={parserState.addCustomSkill}
            resetParser={parserState.resetParser}
          />
        )}
      </div>
    </main>
  );
}
