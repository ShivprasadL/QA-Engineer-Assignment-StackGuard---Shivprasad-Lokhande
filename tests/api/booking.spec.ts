import { test, expect } from '../../src/fixtures/api';
import { BASIC_AUTH_HEADER } from '../../src/api/BookingClient';
import { BAD_CREDENTIALS, REQUIRED_FIELDS, buildBooking } from '../../src/data/booking';
import { API_ADMIN } from '../../src/config/env';

const MISSING_ID = 999999999;

test.describe('Restful-Booker API', () => {
  test.describe('health and auth', () => {
    test('GET /ping reports the service is up', async ({ client }) => {
      const res = await client.ping();
      expect(res.status()).toBe(201);
      expect(await res.text()).toBe('Created');
    });

    test('POST /auth with valid credentials returns a token', async ({ client }) => {
      const res = await client.auth(API_ADMIN.username, API_ADMIN.password);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(typeof body.token).toBe('string');
      expect(body.token.length).toBeGreaterThan(5);
    });

    for (const c of BAD_CREDENTIALS) {
      test(`POST /auth refuses ${c.name} and returns no token`, async ({ client }) => {
        const res = await client.auth(c.username, c.password);
        const body = await res.json();
        expect(body.token).toBeUndefined();
        expect(body.reason).toBe('Bad credentials');
      });
    }
  });

  test.describe('create', () => {
    test('POST /booking creates a booking and echoes the data back', async ({ client, authHeaders }) => {
      const payload = buildBooking();
      const res = await client.create(payload);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.bookingid).toEqual(expect.any(Number));
      expect(body.booking).toEqual(payload);
      await client.delete(body.bookingid, authHeaders); // clean up
    });

    for (const field of REQUIRED_FIELDS) {
      test(`POST /booking without "${field}" is rejected`, async ({ client }) => {
        const payload: Record<string, unknown> = { ...buildBooking() };
        delete payload[field];
        const res = await client.create(payload);
        expect(res.status(), `missing ${field} must not succeed`).toBeGreaterThanOrEqual(400);
      });
    }
  });

  test.describe('read', () => {
    test('GET /booking/:id returns exactly what was created', async ({ client, booking }) => {
      const res = await client.get(booking.id);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(booking.payload);
    });

    test('GET /booking?firstname=&lastname= finds the new booking', async ({ client, booking }) => {
      const res = await client.list({
        firstname: booking.payload.firstname,
        lastname: booking.payload.lastname,
      });
      expect(res.status()).toBe(200);
      const ids: { bookingid: number }[] = await res.json();
      expect(ids.map((i) => i.bookingid)).toContain(booking.id);
    });

    test('GET /booking?firstname= with an unused name returns an empty list', async ({ client }) => {
      const res = await client.list({ firstname: `nobody-${Date.now()}` });
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual([]);
    });

    test('GET /booking/:id for an unknown id returns 404', async ({ client }) => {
      const res = await client.get(MISSING_ID);
      expect(res.status()).toBe(404);
    });
  });

  test.describe('update', () => {
    test('PUT /booking/:id with a token replaces the booking', async ({ client, booking, authHeaders }) => {
      const updated = buildBooking({ totalprice: 999, depositpaid: false, additionalneeds: 'Late checkout' });
      const res = await client.update(booking.id, updated, authHeaders);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual(updated);

      // the change must be persisted, not just echoed
      const reread = await client.get(booking.id);
      expect(await reread.json()).toEqual(updated);
    });

    test('PUT /booking/:id also accepts Basic auth', async ({ client, booking }) => {
      const updated = buildBooking({ totalprice: 321 });
      const res = await client.update(booking.id, updated, BASIC_AUTH_HEADER);
      expect(res.status()).toBe(200);
      expect((await res.json()).totalprice).toBe(321);
    });

    test('PATCH /booking/:id changes only the supplied fields', async ({ client, booking, authHeaders }) => {
      const res = await client.partialUpdate(booking.id, { firstname: 'Renamed' }, authHeaders);
      expect(res.status()).toBe(200);
      expect(await res.json()).toEqual({ ...booking.payload, firstname: 'Renamed' });
    });

    test('PUT without a token is forbidden and changes nothing', async ({ client, booking }) => {
      const res = await client.update(booking.id, buildBooking({ totalprice: 1 }));
      expect(res.status()).toBe(403);
      expect((await (await client.get(booking.id)).json()).totalprice).toBe(booking.payload.totalprice);
    });

    test('PUT with an invalid token is forbidden', async ({ client, booking }) => {
      const res = await client.update(booking.id, buildBooking(), { Cookie: 'token=not-a-real-token' });
      expect(res.status()).toBe(403);
    });

    test('PATCH without a token is forbidden', async ({ client, booking }) => {
      const res = await client.partialUpdate(booking.id, { firstname: 'Hacker' });
      expect(res.status()).toBe(403);
    });

    test('PUT on an unknown id does not succeed', async ({ client, authHeaders }) => {
      const res = await client.update(MISSING_ID, buildBooking(), authHeaders);
      // Restful-Booker answers 405 here; 404 would be equally valid REST
      expect([404, 405]).toContain(res.status());
    });
  });

  test.describe('delete', () => {
    test('DELETE /booking/:id removes the booking', async ({ client, authHeaders }) => {
      const created = await (await client.create(buildBooking())).json();

      const res = await client.delete(created.bookingid, authHeaders);
      expect(res.status()).toBe(201);

      const after = await client.get(created.bookingid);
      expect(after.status()).toBe(404);
    });

    test('DELETE without a token is forbidden and the booking survives', async ({ client, booking }) => {
      const res = await client.delete(booking.id);
      expect(res.status()).toBe(403);
      expect((await client.get(booking.id)).status()).toBe(200);
    });

    test('DELETE with an invalid token is forbidden', async ({ client, booking }) => {
      const res = await client.delete(booking.id, { Cookie: 'token=bad' });
      expect(res.status()).toBe(403);
    });

    test('DELETE on an unknown id does not succeed', async ({ client, authHeaders }) => {
      const res = await client.delete(MISSING_ID, authHeaders);
      expect([404, 405]).toContain(res.status());
    });
  });
});
