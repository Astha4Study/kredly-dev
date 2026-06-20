import * as React from 'react';
import type { LevelType, ParsedCVData } from './types';
import { useAuth } from '@/contexts/auth';

export function useCVParser() {
  const { user, refetch } = useAuth();
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // States
  const [isLoading, setIsLoading] = React.useState(false);
  const [parseStep, setParseStep] = React.useState('');
  const [isParsed, setIsParsed] = React.useState(false);

  // Extracted States
  const [role, setRole] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>([]);
  const [allParsedSkills, setAllParsedSkills] = React.useState<string[]>([]);
  const [extractedLevel, setExtractedLevel] = React.useState<LevelType>('Mid');
  const [isExamReady, setIsExamReady] = React.useState(false);

  // Prefill states if user already has parsed CV in database
  React.useEffect(() => {
    if (user?.cvRole && user?.cvSkills && user.cvSkills.length > 0) {
      setRole(user.cvRole);
      setExtractedLevel((user.cvLevel as LevelType) || 'Mid');
      setAllParsedSkills(user.cvSkills);
      setSkills(user.cvSkills.slice(0, 5));
      setIsParsed(true);
      setIsExamReady(true);
    }
  }, [user]);

  const resetParser = () => {
    setFile(null);
    setIsParsed(false);
    setIsExamReady(false);
    setRole('');
    setSkills([]);
    setAllParsedSkills([]);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        setError('Hanya file PDF yang didukung saat ini.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        setError('Hanya file PDF yang didukung saat ini.');
      }
    }
  };

  const parseCV = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setParseStep('Membaca CV kamu...');

    // Loading transition sequence
    const t1 = setTimeout(
      () => setParseStep('Mengidentifikasi skills...'),
      1500,
    );
    const t2 = setTimeout(() => setParseStep('Menentukan level...'), 3000);
    const t3 = setTimeout(() => setParseStep('Menyiapkan ujian...'), 4500);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error ||
            errData.details ||
            `Error server: ${response.status}`,
        );
      }

      const parsedResult: ParsedCVData = await response.json();

      let detectedLevel: LevelType = 'Mid';
      const rawLevel = (parsedResult.level || '').toLowerCase();
      if (
        rawLevel.includes('senior') ||
        rawLevel.includes('lead') ||
        rawLevel.includes('manager')
      ) {
        detectedLevel = 'Senior';
      } else if (
        rawLevel.includes('junior') ||
        rawLevel.includes('entry') ||
        rawLevel.includes('intern')
      ) {
        detectedLevel = 'Junior';
      }

      setRole(parsedResult.role || 'Software Engineer');
      setExtractedLevel(detectedLevel);

      const rawSkills = Array.isArray(parsedResult.skills)
        ? parsedResult.skills
        : [];
      setAllParsedSkills(rawSkills);
      // Select the first 5 by default
      setSkills(rawSkills.slice(0, 5));

      // Additional small delay so the loading text finishes before transitioning
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsParsed(true);

      // Refetch user data so that the profile state gets the newly parsed CV fields
      await refetch().catch((err) =>
        console.error('failed to refetch user info:', err),
      );

      // Delay start exam button
      setTimeout(() => {
        setIsExamReady(true);
      }, 1500);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Gagal memproses CV. Silakan periksa apakah backend Go sudah dijalankan.';
      setError(msg);
      setIsParsed(false);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsLoading(false);
      setParseStep('');
    }
  };

  const toggleSkill = (skillName: string) => {
    if (skills.includes(skillName)) {
      setSkills((prev) => prev.filter((s) => s !== skillName));
    } else {
      if (skills.length >= 5) return;
      setSkills((prev) => [...prev, skillName]);
    }
  };

  const addCustomSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    // Add to allParsedSkills if not already there
    if (!allParsedSkills.includes(trimmed)) {
      setAllParsedSkills((prev) => [...prev, trimmed]);
    }

    // Auto select if under limit
    if (skills.length < 5 && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
    }
  };

  return {
    file,
    isDragging,
    error,
    isLoading,
    parseStep,
    isParsed,
    role,
    skills,
    allParsedSkills,
    extractedLevel,
    isExamReady,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    parseCV,
    setRole,
    toggleSkill,
    addCustomSkill,
    resetParser,
  };
}
export type UseCVParserReturn = ReturnType<typeof useCVParser>;
