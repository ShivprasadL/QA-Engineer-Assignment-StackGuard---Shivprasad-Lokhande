import { randomUUID } from 'crypto';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/**
 * Builds a booking with a unique name so tests never touch data created by other people
 * (the API is shared and public) and can be run in parallel.
 */
export function buildBooking(overrides: Partial<BookingPayload> = {}): BookingPayload {
  const id = randomUUID().slice(0, 8);
  return {
    firstname: `Shiv${id}`,
    lastname: `Tester${id}`,
    totalprice: 250,
    depositpaid: true,
    bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

/** Required fields. Removing any one of them should be rejected by the API. */
export const REQUIRED_FIELDS: (keyof BookingPayload)[] = [
  'firstname',
  'lastname',
  'totalprice',
  'depositpaid',
  'bookingdates',
];

export const BAD_CREDENTIALS = [
  { name: 'wrong password', username: 'admin', password: 'wrong' },
  { name: 'wrong username', username: 'nobody', password: 'password123' },
  { name: 'empty credentials', username: '', password: '' },
];
