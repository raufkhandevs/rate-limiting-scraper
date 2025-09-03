/**
 * HTTP related interfaces
 */
import { IProxy } from "./proxy.interface";

/**
 * HTTP response interface
 */
export interface IHttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  responseTime: number;
  proxy: IProxy;
  protocol: string;
}

/**
 * HTTP request options
 */
export interface IHttpRequestOptions {
  timeout?: number;
  maxRedirects?: number;
  userAgent?: string;
  followRedirects?: boolean;
}
