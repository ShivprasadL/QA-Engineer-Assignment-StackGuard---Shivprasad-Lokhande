import { APIRequestContext, APIResponse } from '@playwright/test';
import { BookingPayload } from '../data/booking';

/** Basic auth header for admin:password123, the alternative to the token cookie. */
export const BASIC_AUTH_HEADER = {
  Authorization: 'Basic ' + Buffer.from('admin:password123').toString('base64'),
};

export const tokenHeader = (token: string) => ({ Cookie: `token=${token}` });

/** Thin wrapper over the Restful-Booker endpoints so specs read like requirements. */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  auth(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  create(payload: unknown): Promise<APIResponse> {
    return this.request.post('/booking', { data: payload });
  }

  get(id: number | string): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  list(params: Record<string, string> = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params });
  }

  update(id: number | string, payload: BookingPayload, headers: Record<string, string> = {}) {
    return this.request.put(`/booking/${id}`, { data: payload, headers });
  }

  partialUpdate(id: number | string, payload: Partial<BookingPayload>, headers: Record<string, string> = {}) {
    return this.request.patch(`/booking/${id}`, { data: payload, headers });
  }

  delete(id: number | string, headers: Record<string, string> = {}) {
    return this.request.delete(`/booking/${id}`, { headers });
  }
}
