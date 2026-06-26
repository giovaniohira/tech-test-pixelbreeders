import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { FileRecord } from "@/shared/types";
import { useFilePreview } from "@/features/files/hooks/use-file-preview";

interface ImagePreviewModalProps {
  file: FileRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ImagePreviewBody({ file }: { file: FileRecord }) {
  const { data: blob, isError, isLoading } = useFilePreview(file.id, true);

  const imageUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  if (isError) {
    return <p className="text-sm text-muted-foreground">Unable to load image preview.</p>;
  }

  if (isLoading || !imageUrl) {
    return <Skeleton className="h-48 w-full max-w-md" />;
  }

  return (
    <img
      src={imageUrl}
      alt={file.original_filename}
      className="max-w-full max-h-[60vh] object-contain rounded"
    />
  );
}

export function ImagePreviewModal({ file, open, onOpenChange }: ImagePreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.original_filename}</DialogTitle>
          <DialogDescription>Image preview</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center rounded-md bg-muted/50 p-4 min-h-[200px] max-h-[70vh] overflow-auto">
          {open ? (
            <ImagePreviewBody key={file.id} file={file} />
          ) : (
            <Skeleton className="h-48 w-full max-w-md" />
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
