import { BaseMockProvider } from "./base";

/**
 * TickPick adapter.
 *
 * LIVE INTEGRATION TODO: TickPick does not offer a self-serve public API at
 * the time of writing — access is by partnership agreement. Once approved,
 * set TICKPICK_API_KEY (see .env.example) and implement the live branch in
 * searchEvents/getEvent/getListings in base.ts's pattern, mapping TickPick's
 * response fields onto the normalized Listing shape in normalizeListing().
 * Until then this adapter runs in mock mode.
 */
export class TickPickProvider extends BaseMockProvider {
  id = "tickpick" as const;
  displayName = "TickPick";
  protected requiredEnvVars = ["TICKPICK_API_KEY"];
}
