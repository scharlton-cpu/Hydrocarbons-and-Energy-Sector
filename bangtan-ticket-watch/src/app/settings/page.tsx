import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG } from "@/config/app.config";
import { PRICE_DROP_THRESHOLDS, DEAL_SCORE_THRESHOLDS, INVENTORY_INSIGHT_THRESHOLDS } from "@/config/thresholds.config";
import type { NotificationChannel } from "@/types/domain";

const CHANNELS: { id: NotificationChannel; label: string; configured: boolean }[] = [
  { id: "in_app", label: "In-app alerts", configured: true },
  { id: "email", label: "Email", configured: false },
  { id: "sms", label: "SMS", configured: false },
  { id: "push", label: "Push notifications", configured: false },
  { id: "whatsapp", label: "WhatsApp", configured: false },
  { id: "telegram", label: "Telegram", configured: false },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted mt-1">Application configuration. Product-wide values live in one file — see below.</p>
      </div>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Product</h2>
        <Row label="Product name" value={APP_CONFIG.productName} />
        <Row label="Default artist" value={APP_CONFIG.defaultArtistSlug.toUpperCase()} />
        <Row label="Reference currency" value={APP_CONFIG.referenceCurrency} />
        <Row label="Background refresh interval" value={`${APP_CONFIG.backgroundRefreshIntervalMinutes} minutes`} />
        <p className="text-xs text-muted-2 pt-1">
          Edit <code className="text-accent-strong">src/config/app.config.ts</code> to rename the product or change these
          defaults — nothing else in the codebase hard-codes them.
        </p>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Notification channels</h2>
        <p className="text-xs text-muted">
          The alert system is channel-agnostic (see <code className="text-accent-strong">NotificationLog</code> in the
          schema). Only in-app alerts are active in this MVP.
        </p>
        <div className="space-y-2">
          {CHANNELS.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-border-soft px-3 py-2">
              <span className="text-sm text-foreground">{c.label}</span>
              <Badge variant={c.configured ? "positive" : "neutral"}>{c.configured ? "Active" : "Not configured"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Price-drop thresholds</h2>
        <Row label="Minor drop" value={`${PRICE_DROP_THRESHOLDS.minor * 100}%+`} />
        <Row label="Notable drop" value={`${PRICE_DROP_THRESHOLDS.notable * 100}%+`} />
        <Row label="Major drop 🔥" value={`${PRICE_DROP_THRESHOLDS.major * 100}%+`} />
        <Row label="Exceptional drop 🚨" value={`${PRICE_DROP_THRESHOLDS.exceptional * 100}%+`} />
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Deal-score thresholds</h2>
        <Row label="🔥 Great Deal" value={`${DEAL_SCORE_THRESHOLDS.greatDeal * 100}%+ below median`} />
        <Row label="🟢 Good Deal" value={`${DEAL_SCORE_THRESHOLDS.goodDeal * 100}%+ below median`} />
        <Row label="🔴 Above Market" value={`${DEAL_SCORE_THRESHOLDS.aboveMarket * 100}%+ above median`} />
        <Row label="Low-inventory alert" value={`≤ ${INVENTORY_INSIGHT_THRESHOLDS.lowInventoryCount} listings`} />
        <p className="text-xs text-muted-2 pt-1">
          Edit <code className="text-accent-strong">src/config/thresholds.config.ts</code> to tune these.
        </p>
      </Card>

      <Card className="p-5">
        <p className="text-xs text-muted">{APP_CONFIG.purchaseDisclaimer}</p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
