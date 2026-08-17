import { BaseMockProvider } from "./base";

/**
 * StubHub adapter.
 *
 * LIVE INTEGRATION TODO: StubHub exposes partner/affiliate APIs that
 * require an approved integration agreement. Once approved, set
 * STUBHUB_CLIENT_ID and STUBHUB_CLIENT_SECRET (see .env.example) and
 * implement the OAuth client-credentials flow plus the live branch in
 * searchEvents/getEvent/getListings, mapping StubHub's response fields onto
 * the normalized Listing shape in normalizeListing(). Until then this
 * adapter runs in mock mode.
 */
export class StubHubProvider extends BaseMockProvider {
  id = "stubhub" as const;
  displayName = "StubHub";
  protected requiredEnvVars = ["STUBHUB_CLIENT_ID", "STUBHUB_CLIENT_SECRET"];
}
