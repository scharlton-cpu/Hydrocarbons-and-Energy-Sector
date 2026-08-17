import type { ReactNode } from "react";

export function EmptyState({
  icon = "🎫",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 px-6 text-center">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-muted">{description}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-negative/30 bg-negative-soft py-16 px-6 text-center">
      <div className="text-3xl mb-3">⚠️</div>
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-muted">{description}</div>}
    </div>
  );
}

export function ProviderUnavailableNotice({ providerName }: { providerName: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
      <span aria-hidden>⚠️</span>
      {providerName} is temporarily unavailable — showing results from other marketplaces.
    </div>
  );
}
