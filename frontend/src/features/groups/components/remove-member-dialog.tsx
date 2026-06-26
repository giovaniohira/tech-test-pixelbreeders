import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type { GroupMember } from "@/shared/types";

interface RemoveMemberDialogProps {
  member: GroupMember | null;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RemoveMemberDialog({
  member,
  isPending,
  onOpenChange,
  onConfirm,
}: RemoveMemberDialogProps) {
  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover membro</DialogTitle>
          <DialogDescription>
            Remover <strong>{member?.username}</strong> do grupo? Os arquivos que essa pessoa
            compartilhou serão removidos do grupo (não serão excluídos da conta dela).
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            Remover membro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
