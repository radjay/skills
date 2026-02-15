const BASE_URL = "https://api.kit.com/v4";

export interface KitClientOptions {
  apiKey: string;
}

export interface Pagination {
  has_previous_page: boolean;
  has_next_page: boolean;
  start_cursor: string | null;
  end_cursor: string | null;
  per_page: number;
}

export interface AccountUser {
  id: number;
  email: string;
}

export interface AccountInfo {
  id: number;
  name: string;
  plan_type: string;
  primary_email_address: string;
  created_at: string;
}

export interface Subscriber {
  id: number;
  email_address: string;
  first_name: string | null;
  state: string;
  created_at: string;
}

export interface Broadcast {
  id: number;
  subject: string;
  created_at: string;
  published_at?: string | null;
  send_at?: string | null;
  description?: string | null;
  stats?: {
    recipients: number;
    open_rate: number;
    click_rate: number;
    unsubscribes: number;
    total_clicks: number;
    show_total_clicks: boolean;
    status: string;
    progress: number;
  };
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface Form {
  id: number;
  name: string;
  type: string;
  format: string | null;
  created_at: string;
  archived: boolean;
}

export interface Sequence {
  id: number;
  name: string;
  created_at: string;
}

export class KitClient {
  private apiKey: string;

  constructor(opts: KitClientOptions) {
    this.apiKey = opts.apiKey;
  }

  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    const res = await fetch(url.toString(), {
      headers: {
        "X-Kit-Api-Key": this.apiKey,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Kit API error ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async getAccount(): Promise<{ user: AccountUser; account: AccountInfo }> {
    return this.request("/account");
  }

  async listSubscribers(opts?: {
    status?: string;
    tagId?: string;
    since?: string;
    until?: string;
    limit?: string;
    cursor?: string;
  }): Promise<{ subscribers: Subscriber[]; pagination: Pagination }> {
    const params: Record<string, string> = {};
    if (opts?.status) params["status"] = opts.status;
    if (opts?.tagId) params["tag_id"] = opts.tagId;
    if (opts?.since) params["created_after"] = opts.since;
    if (opts?.until) params["created_before"] = opts.until;
    if (opts?.limit) params["per_page"] = opts.limit;
    if (opts?.cursor) params["after"] = opts.cursor;
    return this.request("/subscribers", params);
  }

  async listBroadcasts(opts?: {
    status?: string;
    limit?: string;
    cursor?: string;
  }): Promise<{ broadcasts: Broadcast[]; pagination: Pagination }> {
    const params: Record<string, string> = {};
    if (opts?.status) params["status"] = opts.status;
    if (opts?.limit) params["per_page"] = opts.limit;
    if (opts?.cursor) params["after"] = opts.cursor;
    return this.request("/broadcasts", params);
  }

  async listTags(opts?: {
    cursor?: string;
  }): Promise<{ tags: Tag[]; pagination: Pagination }> {
    const params: Record<string, string> = {};
    if (opts?.cursor) params["after"] = opts.cursor;
    return this.request("/tags", params);
  }

  async listForms(opts?: {
    status?: string;
    cursor?: string;
  }): Promise<{ forms: Form[]; pagination: Pagination }> {
    const params: Record<string, string> = {};
    if (opts?.status) params["status"] = opts.status;
    if (opts?.cursor) params["after"] = opts.cursor;
    return this.request("/forms", params);
  }

  async listSequences(opts?: {
    cursor?: string;
  }): Promise<{ sequences: Sequence[]; pagination: Pagination }> {
    const params: Record<string, string> = {};
    if (opts?.cursor) params["after"] = opts.cursor;
    return this.request("/sequences", params);
  }
}
