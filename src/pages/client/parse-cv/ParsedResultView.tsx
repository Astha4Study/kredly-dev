import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Briefcase, Wrench, ArrowRight, Plus, Pencil } from 'lucide-react';
import surpriseImg from '@/assets/images/surprise.png';
import type { UseCVParserReturn } from './useCVParser';
import type { LevelType } from './types';

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
}: ParsedResultViewProps) {
  const [newSkill, setNewSkill] = React.useState('');

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
          className="w-80 h-80 object-contain animate-in zoom-in duration-700 delay-200 fill-mode-both"
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
            <div className="relative flex items-center border-b">
              <Input
                id="role-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Contoh: Backend Engineer"
                className="border-none my-2 text-xl!  pr-8 pl-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Pencil className="absolute right-0 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>


          {/* Editable Skills Section (Checklist) */}
          <div className="space-y-4">
            <Label className="text-lg text-center font-medium mx-auto max-w-md">Kami menemukan beberapa skill  yang siap kamu buktikan hari ini.
            </Label>
            <div className="flex gap-4 items-center justify-center">
              <Label className="text-sm text-foreground/50 flex items-center gap-1.5">Skill mana yang mau kamu buktikan?
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
                    className={`flex items-center gap-3 p-1.5 rounded-xl border transition-all cursor-pointer select-none text-left ${isSelected
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

      {/* Bottom Button */}
      <Button
        size="lg"
        disabled={!isExamReady || skills.length === 0}
        className={`w-full group text-base font-medium transition-all duration-500 ${isExamReady && skills.length > 0
          ? 'opacity-100 translate-y-0 '
          : 'opacity-0 translate-y-4'
          }`}
      >
        Mulai Ujian
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
