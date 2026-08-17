/**
 * Central application configuration.
 *
 * This is the single place to rename the product, change the default
 * artist, or tune global thresholds. Nothing else in the app should
 * hard-code the product name, artist, or these threshold values.
 */

export const APP_CONFIG = {
  /** Product name — change this once, it propagates everywhere. */
  productName: "Bangtan Ticket Watch",
  shortName: "BTW",
  tagline: "Resale ticket intelligence, not another ticket store.",

  /** Default artist shown when no artist filter is applied. MVP default. */
  defaultArtistSlug: "bts",

  /** Currency shown when a value needs to be normalized for comparison. */
  referenceCurrency: "USD" as const,

  /** How often production background refresh jobs should run, in minutes. */
  backgroundRefreshIntervalMinutes: 15,

  /** Links out to marketplaces are the only way to purchase — enforced in UI copy. */
  purchaseDisclaimer:
    "This is a monitoring tool, not a ticket seller. Purchases happen on the marketplace's own site.",
} as const;

export type AppConfig = typeof APP_CONFIG;
