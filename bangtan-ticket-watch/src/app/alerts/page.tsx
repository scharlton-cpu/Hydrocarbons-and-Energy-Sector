import { getAlertEvents, getAlertRules } from "@/lib/data-access/alerts";
import { getStore } from "@/lib/demo-data/store";
import { AlertsClient } from "./AlertsClient";

export default function AlertsPage() {
  const events = getAlertEvents();
  const rules = getAlertRules();
  const store = getStore();
  const cities = store.cities.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Alert Center</h1>
        <p className="text-sm text-muted mt-1">In-app alerts for now — email, SMS, push, WhatsApp, and Telegram are wired for later (see Settings).</p>
      </div>
      <AlertsClient events={events} rules={rules} cities={cities} />
    </div>
  );
}
