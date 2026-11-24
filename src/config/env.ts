/** Base URLs can be overridden from the shell, e.g. API_BASE_URL=http://localhost:3001 */
export const UI_BASE_URL = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';

/** Public demo credentials from the Restful-Booker API docs. */
export const API_ADMIN = { username: 'admin', password: 'password123' };
