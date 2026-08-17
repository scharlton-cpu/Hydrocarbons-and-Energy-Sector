import { AddCityForm } from "./AddCityForm";

export default function AddCityPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add a City</h1>
        <p className="text-sm text-muted mt-1">
          Configure a new tour stop to monitor. No code changes required — this creates the city, venue, seat zones, and
          concert dates immediately.
        </p>
      </div>
      <AddCityForm />
    </div>
  );
}
