export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const VALID_INFO: CheckoutInfo = {
  firstName: 'Shivprasad',
  lastName: 'Lokhande',
  postalCode: '411001',
};

/** Negative cases: one required field left empty at a time, plus all empty. */
export const MISSING_FIELD_CASES: { name: string; info: CheckoutInfo; error: string }[] = [
  {
    name: 'first name missing',
    info: { ...VALID_INFO, firstName: '' },
    error: 'Error: First Name is required',
  },
  {
    name: 'last name missing',
    info: { ...VALID_INFO, lastName: '' },
    error: 'Error: Last Name is required',
  },
  {
    name: 'postal code missing',
    info: { ...VALID_INFO, postalCode: '' },
    error: 'Error: Postal Code is required',
  },
  {
    name: 'all fields missing (first error wins)',
    info: { firstName: '', lastName: '', postalCode: '' },
    error: 'Error: First Name is required',
  },
];

/** Edge cases: unusual but legitimate input that a real customer could type. */
export const EDGE_INPUT_CASES: { name: string; info: CheckoutInfo }[] = [
  { name: 'apostrophe and hyphen in name', info: { firstName: "Mary-Jane", lastName: "O'Brien", postalCode: '560001' } },
  { name: 'accented characters', info: { firstName: 'José', lastName: 'Müller', postalCode: '75008' } },
  { name: 'alphanumeric postal code with space', info: { firstName: 'Amy', lastName: 'Smith', postalCode: 'SW1A 1AA' } },
  { name: 'single character fields', info: { firstName: 'A', lastName: 'B', postalCode: '1' } },
  { name: 'very long values (100 chars)', info: { firstName: 'F'.repeat(100), lastName: 'L'.repeat(100), postalCode: '9'.repeat(100) } },
];

/** Carts used by the order-total tests. */
export const CART_SIZES = [1, 2, 6];
