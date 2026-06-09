import * as React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useCVParser } from './useCVParser';
import UploadView from './UploadView';
import LoadingSequence from './LoadingSequence';
import ParsedResultView from './ParsedResultView';

export default function CVParserPage() {
  const parserState = useCVParser();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
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
                <h1 className="font-semibold text-lg leading-none text-foreground">
                  AI CV Parser
                </h1>
                <span className="text-xs text-muted-foreground">
                  Ekstrak & Strukturkan CV Anda
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 container mx-auto px-6 py-8 flex flex-col items-center justify-center relative">
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
          />
        )}
      </div>
    </div>
  );
}
