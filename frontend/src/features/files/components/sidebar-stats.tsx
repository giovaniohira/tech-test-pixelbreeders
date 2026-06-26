import { Clock, FileText, HardDrive } from "lucide-react";

import { useFileStats } from "@/features/files/hooks/use-files";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatBytes, formatDate } from "@/shared/lib/utils";

export function SidebarStats() {
  const { data: stats, isLoading, isError } = useFileStats();

  if (isLoading) {
    return (
      <div className="space-y-2 px-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-1 text-[11px] text-destructive leading-snug">
        Não foi possível carregar estatísticas.
      </p>
    );
  }

  const latestLabel = stats?.latest_upload
    ? stats.latest_upload.original_filename
    : "Nenhum envio";

  const latestMeta = stats?.latest_upload
    ? formatDate(stats.latest_upload.uploaded_at)
    : "—";

  return (
    <dl className="grid gap-2 text-[11px] leading-tight text-muted-foreground">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-3 w-3 shrink-0 text-primary/70" aria-hidden />
        <div className="min-w-0">
          <dt className="sr-only">Total de arquivos</dt>
          <dd>
            <span className="font-medium text-foreground">{stats?.total_files ?? 0}</span>{" "}
            arquivos
          </dd>
        </div>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <HardDrive className="h-3 w-3 shrink-0" aria-hidden />
        <div className="min-w-0">
          <dt className="sr-only">Armazenamento</dt>
          <dd>{formatBytes(stats?.storage_used ?? 0)} usados</dd>
        </div>
      </div>
      <div className="flex items-start gap-2 min-w-0">
        <Clock className="h-3 w-3 shrink-0 mt-0.5" aria-hidden />
        <div className="min-w-0">
          <dt className="sr-only">Último envio</dt>
          <dd className="truncate" title={latestLabel}>
            {latestLabel}
          </dd>
          <dd className="text-[10px] opacity-80">{latestMeta}</dd>
        </div>
      </div>
    </dl>
  );
}
