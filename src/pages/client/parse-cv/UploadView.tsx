import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import type { UseCVParserReturn } from './useCVParser';

type UploadViewProps = Pick<
  UseCVParserReturn,
  | 'file'
  | 'isDragging'
  | 'error'
  | 'isLoading'
  | 'handleDragOver'
  | 'handleDragLeave'
  | 'handleDrop'
  | 'handleFileChange'
  | 'parseCV'
>;

export default function UploadView({
  file,
  isDragging,
  error,
  isLoading,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  parseCV,
}: UploadViewProps) {
  return (
    <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Unggah CV Anda
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Unggah berkas CV berformat PDF. AI kami akan membaca teks
          dokumen dan merapikannya menjadi profil digital terstruktur.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 text-destructive text-sm animate-in fade-in duration-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div>{error}</div>
        </div>
      )}

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/30 bg-muted/30 hover:bg-muted/50'
          }`}
      >
        <input
          id="cv-upload-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <label
          htmlFor="cv-upload-input"
          className="cursor-pointer space-y-4 block"
        >
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground group-hover:text-foreground transition-colors">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold">
              Tarik & lepas file CV Anda disini
            </p>
            <p className="text-xs text-muted-foreground">
              Atau klik untuk menelusuri folder komputer Anda
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Mendukung file PDF (Maksimal 10MB)
          </div>
        </label>
      </div>

      {/* Selected File Details */}
      {file && (
        <Card className="bg-card border-border animate-in fade-in duration-500">
          <CardContent className="p-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium truncate max-w-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              onClick={parseCV}
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-lg shadow-primary/20"
            >
              Mulai Ekstraksi
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
