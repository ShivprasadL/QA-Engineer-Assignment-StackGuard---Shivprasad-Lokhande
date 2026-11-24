import { test as base, expect } from '@playwright/test';
import { BookingClient, tokenHeader } from '../api/BookingClient';
import { API_ADMIN, API_BASE_URL } from '../config/env';
import { BookingPayload, buildBooking } from '../data/booking';

export interface CreatedBooking {
  id: number;
  payload: BookingPayload;
}

type ApiFixtures = {
  client: BookingClient;
  /** A booking created for this test only; deleted again afterwards. */
  booking: CreatedBooking;
  /** Cookie header with a valid admin token. */
  authHeaders: Record<string, string>;
};

type ApiWorkerFixtures = {
  token: string;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // One token per worker keeps the number of /auth calls small on a shared service.
  token: [
    async ({ playwright }, use) => {
      const ctx = await playwright.request.newContext({ baseURL: API_BASE_URL });
      const res = await ctx.post('/auth', { data: API_ADMIN });
      expect(res.status(), 'auth should succeed with the documented admin account').toBe(200);
      const { token } = await res.json();
      expect(token, 'auth response should contain a token').toBeTruthy();
      await ctx.dispose();
      await use(token);
    },
    { scope: 'worker' },
  ],

  client: async ({ request }, use) => use(new BookingClient(request)),

  authHeaders: async ({ token }, use) => use(tokenHeader(token)),

  booking: async ({ client, authHeaders }, use) => {
    const payload = buildBooking();
    const res = await client.create(payload);
    expect(res.status(), 'fixture: creating a booking').toBe(200);
    const body = await res.json();
    await use({ id: body.bookingid, payload });
    // best-effort cleanup so we leave nothing behind on the shared service
    await client.delete(body.bookingid, authHeaders);
  },
});

export { expect };
