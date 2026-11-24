export const LOGIN_ERRORS = {
  mismatch: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  notLoggedIn: (path: string) =>
    `Epic sadface: You can only access '${path}' when you are logged in.`,
};

export const CHECKOUT_ERRORS = {
  firstName: 'Error: First Name is required',
  lastName: 'Error: Last Name is required',
  postalCode: 'Error: Postal Code is required',
};

/** Pages that must not be reachable without a session. */
export const PROTECTED_PATHS = [
  '/inventory.html',
  '/cart.html',
  '/checkout-step-one.html',
  '/checkout-step-two.html',
  '/checkout-complete.html',
];
