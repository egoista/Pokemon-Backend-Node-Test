import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  HttpClient,
  HttpRequestOptions,
  HttpResponse,
} from './http-client.interface';

// ARCH: Generic HTTP adapter using Nest HttpService.
@Injectable()
export class NestHttpClient implements HttpClient {
  constructor(private readonly httpService: HttpService) {}

  async get<T>(
    url: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const response = await firstValueFrom(this.httpService.get<T>(url, options));
    return {
      status: response.status,
      data: response.data,
      headers: this.normalizeHeaders(response.headers),
    };
  }

  private normalizeHeaders(
    headers: unknown,
  ): Record<string, string | string[] | number | boolean | undefined> | undefined {
    if (!headers) {
      return undefined;
    }
    if (typeof (headers as { toJSON?: () => unknown }).toJSON === 'function') {
      const json = (headers as { toJSON: () => unknown }).toJSON();
      return json as Record<
        string,
        string | string[] | number | boolean | undefined
      >;
    }
    return headers as Record<
      string,
      string | string[] | number | boolean | undefined
    >;
  }
}
