import { useCallback, useState } from "react";
import { Upload, FileUp } from "lucide-react";
import { useUploadFile } from "@/features/files/hooks/use-files";
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_BYTES } from "@/shared/constants";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const upload = useUploadFile();

  const validateAndUpload = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error("File exceeds the 10 MB size limit.");
        return;
      }
      setProgress(0);
      upload.mutate(
        {
          file,
          onProgress: setProgress,
        },
        {
          onSettled: () => setProgress(null),
        },
      );
    },
    [upload],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      validateAndUpload(files[0]);
    },
    [validateAndUpload],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        upload.isPending && "pointer-events-none opacity-70",
      )}
    >
      <input
        type="file"
        id="file-upload"
        className="sr-only"
        accept={ACCEPTED_FILE_EXTENSIONS}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={upload.isPending}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-muted p-3">
          {isDragging ? (
            <FileUp className="h-6 w-6 text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {isDragging ? "Drop your file here" : "Drag and drop a file here"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, PDF, TXT — up to 10 MB
          </p>
        </div>
        <label htmlFor="file-upload">
          <Button variant="outline" size="sm" disabled={upload.isPending} type="button">
            <Upload className="h-4 w-4 mr-2" />
            Browse files
          </Button>
        </label>
      </div>
      {progress !== null && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">Uploading... {progress}%</p>
        </div>
      )}
    </div>
  );
}
