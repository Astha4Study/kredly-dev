import { Link } from '@tanstack/react-router';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AppTopbarAssessment() {
  return (
    <header className="border-b border-border bg-background/60 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/app/assessment"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Button variant="ghost" size="icon" className="hover:bg-accent">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-lg leading-none text-foreground">
              Persiapan Ujian
            </h1>
            <span className="text-xs text-muted-foreground">
              Tinjau skill dan informasi ujian sebelum memulai
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
