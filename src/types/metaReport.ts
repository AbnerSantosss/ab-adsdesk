/** Dates are inclusive calendar days in the ad account's timezone. */
export interface MetaReportRange {
  since: string;
  until: string;
}

export interface MetaReportAction {
  type: string;
  value: number | null;
}

/** Missing metrics stay null. Clicks, reach and distinct action types are never added as contacts. */
export interface MetaReportMetrics {
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  reach: number | null;
  actions: MetaReportAction[] | null;
  messagingConversations: number | null;
  leads: number | null;
  purchases: number | null;
}

export interface MetaReportDay extends MetaReportMetrics {
  date: string;
}

export interface MetaReportCampaign extends MetaReportMetrics {
  id: string;
  name: string;
  status: string | null;
  objective: string | null;
}

export interface MetaReportCreative {
  id: string | null;
  name: string | null;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  videoId: string | null;
}

export interface MetaReportAd extends MetaReportMetrics {
  id: string;
  name: string;
  campaignId: string | null;
  campaignName: string | null;
  status: string | null;
  creative: MetaReportCreative | null;
}

export interface MetaReportSnapshot {
  apiVersion: string;
  fetchedAt: string;
  range: MetaReportRange;
  timezone: string;
  currency: string;
  /** True when the account insights request returned no rows, not an assumed zero. */
  isEmpty: boolean;
  /** Reach comes from one account-level request; never summed from campaigns or days. */
  totals: MetaReportMetrics;
  /** Most recent first. Days absent from the response are not synthesized. */
  daily: MetaReportDay[];
  campaigns: MetaReportCampaign[];
  ads: MetaReportAd[];
}
