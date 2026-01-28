export interface HttpResponse<T> {
  status: number;
  data: T;
  headers?: Record<string, string | string[] | number | boolean | undefined>;
}

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface HttpClient {
  get<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}
