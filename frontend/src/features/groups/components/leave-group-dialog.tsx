import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface LeaveGroupDialogProps {
  open: boolean;
  sharedByMeCount: number;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave: (removeFiles: boolean) => void;
}

export function LeaveGroupDialog({
  open,
  sharedByMeCount,
  isPending,
  onOpenChange,
  onLeave,
}: LeaveGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sair do grupo</DialogTitle>
          <DialogDescription>
            {sharedByMeCount > 0
              ? `Você compartilhou ${sharedByMeCount} arquivo${sharedByMeCount > 1 ? "s" : ""} neste grupo. O que deseja fazer com eles?`
              : "Você não compartilhou arquivos neste grupo. Deseja sair?"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {sharedByMeCount > 0 && (
            <Button
              variant="secondary"
              onClick={() => onLeave(false)}
              disabled={isPending}
            >
              Manter arquivos no grupo
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => onLeave(sharedByMeCount > 0)}
            disabled={isPending}
          >
            {sharedByMeCount > 0 ? "Remover arquivos e sair" : "Sair do grupo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
