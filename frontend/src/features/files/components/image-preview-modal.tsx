import { useEffect, useState } from "react";
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
import { getPreviewUrl } from "@/features/files/api/files-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

interface ImagePreviewModalProps {
  file: FileRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewModal({ file, open, onOpenChange }: ImagePreviewModalProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !accessToken) return;

    let objectUrl: string | null = null;
    setError(false);
    setImageUrl(null);

    fetch(getPreviewUrl(file.id), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preview");
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => setError(true));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, file.id, accessToken]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.original_filename}</DialogTitle>
          <DialogDescription>Image preview</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center rounded-md bg-muted/50 p-4 min-h-[200px] max-h-[70vh] overflow-auto">
          {!imageUrl && !error && <Skeleton className="h-48 w-full max-w-md" />}
          {error && (
            <p className="text-sm text-muted-foreground">Unable to load image preview.</p>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={file.original_filename}
              className="max-w-full max-h-[60vh] object-contain rounded"
            />
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
