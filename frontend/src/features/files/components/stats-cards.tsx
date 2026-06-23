import { useMemo } from "react";
import { FileText, HardDrive, Clock } from "lucide-react";
import { useFileStats } from "@/features/files/hooks/use-files";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatBytes, formatDate } from "@/shared/lib/utils";

export function StatsCards() {
  const { data: stats, isLoading } = useFileStats();

  const cards = useMemo(
    () => [
      {
        title: "Total files",
        value: stats?.total_files ?? 0,
        icon: FileText,
        description: "Files in your vault",
      },
      {
        title: "Storage used",
        value: formatBytes(stats?.storage_used ?? 0),
        icon: HardDrive,
        description: "Of 10 MB per file limit",
      },
      {
        title: "Latest upload",
        value: stats?.latest_upload
          ? stats.latest_upload.original_filename
          : "No uploads yet",
        icon: Clock,
        description: stats?.latest_upload
          ? formatDate(stats.latest_upload.uploaded_at)
          : "Upload your first file",
      },
    ],
    [stats],
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={String(card.value)}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
