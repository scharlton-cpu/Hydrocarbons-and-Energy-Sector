import type { Listing } from "@/types/domain";
import { generateMockListings, type MockListingSeed } from "./mock-generator";
import type {
  NormalizeContext,
  RawListing,
  RawProviderEvent,
  TicketProvider,
  TicketProviderEventQuery,
} from "./types";
import type { ProviderId } from "@/types/domain";

/**
 * Shared scaffolding for a mock-mode provider adapter. Real adapters should
 * extend this, override `isLive`/`getListings` to call the live API when
 * `requiredEnvVars` are all set, and otherwise fall through to the mock
 * path so the app degrades gracefully instead of breaking.
 */
export abstract class BaseMockProvider implements TicketProvider {
  abstract id: ProviderId;
  abstract displayName: string;
  /** Env var names that must ALL be set for this provider to run live. */
  protected abstract requiredEnvVars: string[];

  isLive(): boolean {
    return this.requiredEnvVars.every((name) => Boolean(process.env[name]));
  }

  async searchEvents(query: TicketProviderEventQuery): Promise<RawProviderEvent[]> {
    if (this.isLive()) {
      // TODO(live-api): call the real search endpoint here using the
      // credentials in `this.requiredEnvVars`. Left unimplemented because
      // no live credentials are configured in this environment — see
      // README.md "Connecting live marketplace APIs".
      throw new Error(`${this.displayName}: live credentials detected but live search is not implemented yet.`);
    }
    return [
      {
        providerEventId: `${this.id}-evt-mock-${query.city}-${query.concertDate}`,
        name: `${query.artist} — ${query.city} — ${query.concertDate}`,
        url: `https://demo.${this.id}.example/event/mock`,
      },
    ];
  }

  async getEvent(providerEventId: string): Promise<RawProviderEvent | null> {
    if (this.isLive()) {
      throw new Error(`${this.displayName}: live credentials detected but getEvent is not implemented yet.`);
    }
    return {
      providerEventId,
      name: providerEventId,
      url: `https://demo.${this.id}.example/event/${providerEventId}`,
    };
  }

  async getListings(_providerEventId: string): Promise<RawListing[]> {
    if (this.isLive()) {
      throw new Error(`${this.displayName}: live credentials detected but getListings is not implemented yet.`);
    }
    // Mock adapters generate normalized listings directly (see
    // generateMockNormalizedListings) rather than round-tripping through a
    // fake "raw" shape — there is no real raw payload to imitate.
    return [];
  }

  normalizeListing(raw: RawListing, _context: NormalizeContext): Listing {
    throw new Error(
      `${this.displayName}.normalizeListing is only meaningful for live responses; mock listings are already normalized (see generateMockNormalizedListings).`
    );
  }

  /** Mock-mode helper: produce ready-to-use normalized listings for one seat zone. */
  generateMockNormalizedListings(seed: Omit<MockListingSeed, "provider">, now: string): Listing[] {
    return generateMockListings({ ...seed, provider: this.id }, now);
  }
}
