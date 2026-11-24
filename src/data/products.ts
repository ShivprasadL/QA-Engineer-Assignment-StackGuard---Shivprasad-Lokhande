export interface Product {
  name: string;
  price: number;
}

/** Catalogue as shown by the shop. Expected values live here, never read back from the page. */
export const PRODUCTS: Product[] = [
  { name: 'Sauce Labs Backpack', price: 29.99 },
  { name: 'Sauce Labs Bike Light', price: 9.99 },
  { name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  { name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  { name: 'Sauce Labs Onesie', price: 7.99 },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
];

export const BACKPACK = PRODUCTS[0];
export const BIKE_LIGHT = PRODUCTS[1];

export const TAX_RATE = 0.08;

/** Order maths in integer cents so floating point never causes false failures. */
export function calcTotals(products: Product[]) {
  const subtotalCents = products.reduce((sum, p) => sum + Math.round(p.price * 100), 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const fmt = (cents: number) => (cents / 100).toFixed(2);
  return {
    subtotal: fmt(subtotalCents),
    tax: fmt(taxCents),
    total: fmt(subtotalCents + taxCents),
  };
}

export const SORT_OPTIONS = [
  {
    label: 'Name (A to Z)',
    value: 'az',
    expected: () => PRODUCTS.map((p) => p.name).sort((a, b) => a.localeCompare(b)),
    by: 'name' as const,
  },
  {
    label: 'Name (Z to A)',
    value: 'za',
    expected: () => PRODUCTS.map((p) => p.name).sort((a, b) => b.localeCompare(a)),
    by: 'name' as const,
  },
  {
    label: 'Price (low to high)',
    value: 'lohi',
    expected: () => PRODUCTS.map((p) => p.price).sort((a, b) => a - b),
    by: 'price' as const,
  },
  {
    label: 'Price (high to low)',
    value: 'hilo',
    expected: () => PRODUCTS.map((p) => p.price).sort((a, b) => b - a),
    by: 'price' as const,
  },
];
