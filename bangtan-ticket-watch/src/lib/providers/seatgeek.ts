import { BaseMockProvider } from "./base";

/**
 * SeatGeek adapter.
 *
 * LIVE INTEGRATION TODO: SeatGeek's Platform API supports client-id based
 * read access for events/listings and is the most accessible of the three
 * for a first live integration. Once approved, set SEATGEEK_CLIENT_ID and
 * SEATGEEK_CLIENT_SECRET (see .env.example) and implement the live branch
 * in searchEvents/getEvent/getListings, mapping SeatGeek's response fields
 * onto the normalized Listing shape in normalizeListing(). Until then this
 * adapter runs in mock mode.
 */
export class SeatGeekProvider extends BaseMockProvider {
  id = "seatgeek" as const;
  displayName = "SeatGeek";
  protected requiredEnvVars = ["SEATGEEK_CLIENT_ID", "SEATGEEK_CLIENT_SECRET"];
}
