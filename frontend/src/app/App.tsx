import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AppRouter } from "@/app/router";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { ThemeProvider } from "@/shared/providers/theme-provider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AppRouter />
          <Toaster position="top-right" richColors closeButton theme="system" />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
