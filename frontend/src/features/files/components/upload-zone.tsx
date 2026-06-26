import { useCallback, useRef, useState } from "react";

import { Upload, FileUp } from "lucide-react";

import { useUploadFile } from "@/features/files/hooks/use-files";

import {

  ACCEPTED_FILE_EXTENSIONS,

  MAX_FILE_SIZE_MB,

} from "@/shared/constants";

import { validateFileForUpload } from "@/shared/lib/file-validation";

import { Button } from "@/shared/components/ui/button";

import { Progress } from "@/shared/components/ui/progress";

import { cn } from "@/shared/lib/utils";

import { toast } from "sonner";



export function UploadZone({ folderId }: { folderId?: string | null }) {

  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [progress, setProgress] = useState<number | null>(null);

  const upload = useUploadFile();



  const validateAndUpload = useCallback(

    (file: File) => {

      const validationError = validateFileForUpload(file);

      if (validationError) {

        toast.error(validationError);

        return;

      }

      setProgress(0);

      upload.mutate(
        {
          file,
          onProgress: setProgress,
          folderId,
        },
        {
          onSettled: () => setProgress(null),
        },
      );

    },

    [upload, folderId],

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

        ref={inputRef}

        type="file"

        className="sr-only"

        accept={ACCEPTED_FILE_EXTENSIONS}

        onChange={(e) => {

          handleFiles(e.target.files);

          e.target.value = "";

        }}

        disabled={upload.isPending}

        aria-label="Upload file"

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
            {isDragging ? "Solte o arquivo aqui" : "Arraste e solte um arquivo aqui"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, PDF, TXT — até {MAX_FILE_SIZE_MB} MB
          </p>

        </div>

        <Button

          variant="outline"

          size="sm"

          disabled={upload.isPending}

          type="button"

          onClick={() => inputRef.current?.click()}

        >

          <Upload className="h-4 w-4 mr-2" />

          Browse arquivos

        </Button>

      </div>

      {progress !== null && (

        <div className="mt-4 space-y-2">

          <Progress value={progress} />

          <p className="text-xs text-muted-foreground">Enviando... {progress}%</p>

        </div>

      )}

    </div>

  );

}

