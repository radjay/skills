export interface PostHogClientOptions {
  apiKey: string;
  host: string;
  projectId: string;
}

export interface PostHogProject {
  id: number;
  name: string;
  timezone: string;
  created_at: string;
}

export interface Person {
  id: string;
  name: string;
  distinct_ids: string[];
  properties: Record<string, unknown>;
  created_at: string;
}

export interface Insight {
  id: number;
  short_id: string;
  name: string;
  description: string | null;
  last_modified_at: string;
}

export interface Dashboard {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  pinned: boolean;
}

export interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  active: boolean;
  rollout_percentage: number | null;
  created_at: string;
}

export interface EventDefinition {
  id: string;
  name: string;
  volume_30_day: number | null;
  query_usage_30_day: number | null;
  created_at: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  property_type: string | null;
  is_numerical: boolean;
}

export interface HogQLQueryResponse {
  columns: string[];
  types: string[];
  results: unknown[][];
  hogql: string;
  hasMore?: boolean;
}

export interface WebOverviewItem {
  key: string;
  value: number | null;
  previous: number | null;
  kind: "unit" | "duration_s" | "percentage" | "currency";
  changeFromPreviousPct: number | null;
  isIncreaseBad: boolean;
}

export interface WebOverviewQueryResponse {
  results: WebOverviewItem[];
  dateFrom?: string;
  dateTo?: string;
  is_cached?: boolean;
}

export interface WebStatsTableQueryResponse {
  columns: string[];
  results: unknown[][];
  types?: string[];
  hogql?: string;
  hasMore?: boolean;
}

export interface WebGoalsQueryResponse {
  columns: string[];
  results: unknown[][];
  types?: string[];
  hogql?: string;
  hasMore?: boolean;
}

export interface TrendsResult {
  label: string;
  count: number;
  data: number[];
  labels: string[];
  days: string[];
  action: { id: string; name: string };
}

export interface TrendsQueryResponse {
  results: TrendsResult[];
  is_cached?: boolean;
}

export type WebStatsBreakdown =
  | "Page"
  | "InitialPage"
  | "ExitPage"
  | "InitialChannelType"
  | "InitialReferringDomain"
  | "InitialUTMSource"
  | "InitialUTMCampaign"
  | "InitialUTMMedium"
  | "InitialUTMTerm"
  | "InitialUTMContent"
  | "InitialUTMSourceMediumCampaign"
  | "Browser"
  | "OS"
  | "DeviceType"
  | "Viewport"
  | "Country"
  | "Region"
  | "City"
  | "Timezone"
  | "Language";

export class PostHogClient {
  private apiKey: string;
  private host: string;
  private projectId: string;

  constructor(opts: PostHogClientOptions) {
    this.apiKey = opts.apiKey;
    this.host = opts.host.replace(/\/+$/, "");
    this.projectId = opts.projectId;
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.host}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`PostHog API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.host}${path}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PostHog API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  private projectPath(path: string): string {
    return `/api/projects/${this.projectId}${path}`;
  }

  private envPath(path: string): string {
    return `/api/environments/${this.projectId}${path}`;
  }

  // --- Project ---

  async getProject(): Promise<PostHogProject> {
    return this.get(this.projectPath("/"));
  }

  // --- Query API ---

  async hogqlQuery(sql: string): Promise<HogQLQueryResponse> {
    return this.post(this.projectPath("/query/"), {
      query: { kind: "HogQLQuery", query: sql },
    });
  }

  async trendsQuery(opts: {
    event: string;
    dateFrom?: string;
    dateTo?: string;
    interval?: string;
    breakdown?: string;
    breakdownType?: string;
  }): Promise<TrendsQueryResponse> {
    const series: Record<string, unknown>[] = [
      { kind: "EventsNode", event: opts.event, math: "total" },
    ];

    const query: Record<string, unknown> = {
      kind: "TrendsQuery",
      series,
      dateRange: {
        date_from: opts.dateFrom ?? "-7d",
        ...(opts.dateTo ? { date_to: opts.dateTo } : {}),
      },
      interval: opts.interval ?? "day",
    };

    if (opts.breakdown) {
      query.breakdownFilter = {
        breakdown: opts.breakdown,
        breakdown_type: opts.breakdownType ?? "event",
      };
    }

    return this.post(this.projectPath("/query/"), { query });
  }

  async webOverviewQuery(opts?: {
    dateFrom?: string;
    dateTo?: string;
    compare?: boolean;
  }): Promise<WebOverviewQueryResponse> {
    const query: Record<string, unknown> = {
      kind: "WebOverviewQuery",
      properties: [],
      dateRange: {
        date_from: opts?.dateFrom ?? "-7d",
        ...(opts?.dateTo ? { date_to: opts.dateTo } : {}),
      },
    };

    if (opts?.compare !== false) {
      query.compareFilter = { compare: true };
    }

    return this.post(this.projectPath("/query/"), { query });
  }

  async webStatsTableQuery(opts: {
    breakdownBy: WebStatsBreakdown;
    dateFrom?: string;
    dateTo?: string;
    includeBounceRate?: boolean;
    limit?: number;
  }): Promise<WebStatsTableQueryResponse> {
    return this.post(this.projectPath("/query/"), {
      query: {
        kind: "WebStatsTableQuery",
        properties: [],
        breakdownBy: opts.breakdownBy,
        dateRange: {
          date_from: opts.dateFrom ?? "-7d",
          ...(opts.dateTo ? { date_to: opts.dateTo } : {}),
        },
        includeBounceRate: opts.includeBounceRate ?? false,
        limit: opts.limit,
      },
    });
  }

  async webGoalsQuery(opts?: {
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<WebGoalsQueryResponse> {
    return this.post(this.projectPath("/query/"), {
      query: {
        kind: "WebGoalsQuery",
        properties: [],
        dateRange: {
          date_from: opts?.dateFrom ?? "-7d",
          ...(opts?.dateTo ? { date_to: opts.dateTo } : {}),
        },
        limit: opts?.limit,
      },
    });
  }

  // --- REST endpoints ---

  async listPersons(opts?: {
    search?: string;
    distinctId?: string;
    properties?: string;
    limit?: string;
  }): Promise<{ results: Person[] }> {
    const params: Record<string, string> = {};
    if (opts?.search) params["search"] = opts.search;
    if (opts?.distinctId) params["distinct_id"] = opts.distinctId;
    if (opts?.properties) params["properties"] = opts.properties;
    if (opts?.limit) params["limit"] = opts.limit;
    return this.get(this.projectPath("/persons/"), params);
  }

  async listInsights(opts?: {
    limit?: string;
    search?: string;
  }): Promise<{ results: Insight[] }> {
    const params: Record<string, string> = {};
    if (opts?.limit) params["limit"] = opts.limit;
    if (opts?.search) params["search"] = opts.search;
    return this.get(this.envPath("/insights/"), params);
  }

  async listDashboards(opts?: {
    limit?: string;
  }): Promise<{ results: Dashboard[] }> {
    const params: Record<string, string> = {};
    if (opts?.limit) params["limit"] = opts.limit;
    return this.get(this.envPath("/dashboards/"), params);
  }

  async listFeatureFlags(opts?: {
    limit?: string;
    search?: string;
  }): Promise<{ results: FeatureFlag[] }> {
    const params: Record<string, string> = {};
    if (opts?.limit) params["limit"] = opts.limit;
    if (opts?.search) params["search"] = opts.search;
    return this.get(this.projectPath("/feature_flags/"), params);
  }

  async listEventDefinitions(opts?: {
    limit?: string;
    search?: string;
  }): Promise<{ results: EventDefinition[] }> {
    const params: Record<string, string> = {};
    if (opts?.limit) params["limit"] = opts.limit;
    if (opts?.search) params["search"] = opts.search;
    return this.get(this.projectPath("/event_definitions/"), params);
  }

  async listPropertyDefinitions(opts?: {
    limit?: string;
    search?: string;
    type?: string;
  }): Promise<{ results: PropertyDefinition[] }> {
    const params: Record<string, string> = {};
    if (opts?.limit) params["limit"] = opts.limit;
    if (opts?.search) params["search"] = opts.search;
    if (opts?.type) params["type"] = opts.type;
    return this.get(this.projectPath("/property_definitions/"), params);
  }
}
