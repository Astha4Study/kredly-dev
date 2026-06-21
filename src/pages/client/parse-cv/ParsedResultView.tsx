import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  ArrowRight,
  Plus,
  Pencil,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import surpriseImg from '@/assets/images/surprise.png';
import type { UseCVParserReturn } from './useCVParser';
import type { LevelType } from './types';
import { useNavigate } from '@tanstack/react-router';
import { sessionService } from '@/services/sessionService';

const HEADLINES: Record<LevelType, string> = {
  Senior: 'Waw, kami terkejut!',
  Mid: 'Kami mengenalmu sekarang',
  Junior: 'Awal yang luar biasa!',
};

type ParsedResultViewProps = Pick<
  UseCVParserReturn,
  | 'role'
  | 'skills'
  | 'allParsedSkills'
  | 'extractedLevel'
  | 'isExamReady'
  | 'setRole'
  | 'toggleSkill'
  | 'addCustomSkill'
  | 'resetParser'
>;

export default function ParsedResultView({
  role,
  skills,
  allParsedSkills,
  extractedLevel,
  isExamReady,
  setRole,
  toggleSkill,
  addCustomSkill,
  resetParser,
}: ParsedResultViewProps) {
  const [newSkill, setNewSkill] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [sessionError, setSessionError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleStartExam = async () => {
    setIsCreatingSession(true);
    setSessionError(null);
    try {
      const response = await sessionService.createSession({
        role: role,
        level: extractedLevel,
        skills: skills,
        cv_summary: `${role}, level ${extractedLevel}, skills: ${skills.join(', ')}`,
      });
      navigate({
        to: '/quiz/$sessionId',
        params: { sessionId: response.session_id },
      } as any);
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : 'Gagal membuat sesi ujian',
      );
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed) {
      addCustomSkill(trimmed);
      setNewSkill('');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Top Illustration & Heading */}
      <div className="flex flex-col items-center text-center space-y-4">
        <img
          src={surpriseImg}
          alt="Surprise"
          width={320}
          height={320}
          className="w-80 h-80 aspect-square object-contain animate-in zoom-in duration-700 delay-200 fill-mode-both"
        />
        <h2 className="text-3xl font-bold tracking-tight text-center">
          {HEADLINES[extractedLevel]}
        </h2>
      </div>

      {/* Middle Card */}
      <Card className="w-full bg-card/50 backdrop-blur-md border-border  rounded-xl overflow-hidden">
        <CardContent className="p-6 space-y-6">
          {/* Editable Role Section */}
          <div className="space-y-2">
            <Label
              htmlFor="role-input"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Briefcase className="h-4 w-4 text-primary" /> Role Pekerjaan
            </Label>
            <div className="flex justify-center border-b border-gray-200">
              <div className="flex items-center justify-center relative max-w-max">
                {isEditing ? (
                  <input
                    ref={inputRef}
                    id="role-input"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: Backend Engineer"
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditing(false);
                      }
                    }}
                    className={`border-none my-2 text-xl! font-medium text-center p-0 bg-transparent focus:outline-none focus:ring-0 w-auto h-auto ${
                      isEditing ? 'cursor-text' : 'cursor-default select-none'
                    }`}
                    style={{ width: `${Math.max(role.length || 15, 15)}ch` }}
                  />
                ) : (
                  <span className="border-none my-2 text-xl! font-medium text-center p-0 bg-transparent select-none cursor-default">
                    {role || 'Contoh: Backend Engineer'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleEditClick}
                  onMouseDown={(e) => e.preventDefault()}
                  className="p-1 hover:bg-muted rounded-md transition-all ml-2 shrink-0 flex items-center justify-center text-muted-foreground hover:text-primary"
                  style={{ transform: 'translateY(1px)' }}
                  aria-label={isEditing ? 'Simpan' : 'Edit role pekerjaan'}
                >
                  {isEditing ? (
                    <Check className="h-4 w-4 shrink-0 text-primary animate-in zoom-in duration-200" />
                  ) : (
                    <Pencil className="h-4 w-4 shrink-0 hover:scale-105 transition-transform" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Editable Skills Section (Checklist) */}
          <div className="space-y-4">
            <Label className="text-lg text-center font-medium mx-auto max-w-md">
              Kami menemukan beberapa skill yang siap kamu buktikan hari ini.
            </Label>
            <div className="flex gap-4 items-center justify-center">
              <Label className="text-sm text-foreground/50 flex items-center gap-1.5">
                Skill mana yang mau kamu buktikan?
              </Label>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {skills.length}/5 terpilih
              </span>
            </div>

            {/* Checklist Grid */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-h-56 overflow-y-auto pr-1">
              {allParsedSkills.map((s) => {
                const isSelected = skills.includes(s);
                const isDisabled = !isSelected && skills.length >= 5;

                return (
                  <label
                    key={s}
                    className={`flex items-center gap-3 p-1.5 rounded-xl border transition-all cursor-pointer select-none text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                        : isDisabled
                          ? 'opacity-40 border-border bg-muted/20 cursor-not-allowed text-muted-foreground'
                          : 'border-border hover:border-border/80 hover:bg-muted/35 text-foreground'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleSkill(s)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30 cursor-pointer disabled:cursor-not-allowed accent-primary"
                    />
                    <span className="text-sm font-medium truncate" title={s}>
                      {s}
                    </span>
                  </label>
                );
              })}
              {allParsedSkills.length === 0 && (
                <p className="text-xs text-muted-foreground italic col-span-2 text-center py-4">
                  Skillmu tidak ada di daftar?
                </p>
              )}
            </div>

            {/* Add custom skill input */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Label
                htmlFor="custom-skill-input"
                className="text-xs text-muted-foreground"
              >
                Skillmu tidak ada di daftar
              </Label>
              <form onSubmit={handleAddSkillSubmit} className="flex gap-2">
                <Input
                  id="custom-skill-input"
                  placeholder="Ada skill lain? Ketik di sini..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="bg-background border-border text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0"
                  disabled={
                    skills.length >= 5 &&
                    !allParsedSkills.includes(newSkill.trim())
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session error message banner */}
      {sessionError && (
        <div className="flex items-center gap-3 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl text-rose-300 text-sm w-full">
          <AlertCircle className="size-4 shrink-0" />
          <span>{sessionError}</span>
        </div>
      )}

      {/* Bottom Buttons */}
      <div
        className={`w-full flex flex-col sm:flex-row gap-3 transition-all duration-500 ${
          isExamReady && skills.length > 0
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4'
        }`}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={resetParser}
          disabled={isCreatingSession}
          className="w-full sm:w-1/3 text-base font-medium cursor-pointer border-border hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          Upload Ulang CV
        </Button>
        <Button
          size="lg"
          onClick={handleStartExam}
          disabled={!isExamReady || skills.length === 0 || isCreatingSession}
          className="flex-1 group text-base font-medium cursor-pointer"
        >
          {isCreatingSession ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Menyiapkan ujian...
            </>
          ) : (
            <>
              Mulai Ujian
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
