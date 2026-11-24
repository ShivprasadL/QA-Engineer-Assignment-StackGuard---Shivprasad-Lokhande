# QA Engineer Assignment: Playwright + TypeScript

Automated tests for two public practice sites:

| Target | What | Tests |
|---|---|---|
| [Sauce Demo](https://www.saucedemo.com) | Web shop: login, inventory, cart, checkout, logout | 81 UI tests |
| [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html) | Booking REST API: auth, create, read, update, delete | 26 API tests |

Written deliverables are in [`docs/`](docs):

| Task | File |
|---|---|
| 1. Test plan (risks + top 10 test cases) | [docs/TEST_PLAN.md](docs/TEST_PLAN.md) |
| 4. Bug reports | [docs/BUG_REPORTS.md](docs/BUG_REPORTS.md) |
| 5. AI notes | [docs/AI_NOTES.md](docs/AI_NOTES.md) |

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npx playwright install chromium     # one-time browser download

npm test                # everything (UI + API)
npm run test:ui         # Sauce Demo only
npm run test:api        # Restful-Booker only
npm run test:headed     # watch the browser
npm run report          # open the HTML report of the last run
npm run typecheck       # TypeScript check
```

Run a single file or test: `npx playwright test tests/ui/anonymous/login.spec.ts -g "locked-out"`.

Optional environment overrides: `UI_BASE_URL`, `API_BASE_URL`.

## Project layout

```
src/
  config/      base URLs, storageState file paths
  data/        all test data: users, products, messages, checkout inputs, booking factory
  pages/       Page Objects (BasePage, Login, Inventory, ProductDetail, Cart, Checkout)
  api/         BookingClient: one method per endpoint
  fixtures/    ui.ts (page objects as fixtures), api.ts (client, token, self-cleaning booking)
tests/
  setup/       auth.setup.ts: logs in once and saves storageState
  ui/anonymous/       login + route protection (start logged out)
  ui/authenticated/   inventory, cart, checkout, logout, known-bugs (start logged in)
  api/                booking.spec.ts
.github/workflows/playwright.yml   runs everything on every pull request
```

## How it is built

- **Fixtures:** page objects and the API client are injected through `test.extend`. The booking fixture creates a booking for the test and deletes it afterwards.
- **Page Object Model:** locators and actions live in `src/pages`; specs only contain intent and assertions.
- **storageState:** a `setup` project logs in once as `standard_user` and `problem_user` and saves the session. Authenticated specs start already logged in, so login is only exercised by the login tests. The Playwright projects are `setup`, `ui-anonymous`, `ui-authenticated` and `api`.
- **Data-driven:** users, invalid logins, required-field cases, edge inputs, sort options, cart sizes and API payloads are tables in `src/data`, and each row becomes its own named test.
- **Stable by design:** locators use `getByTestId` (mapped to Sauce Demo's `data-test`) and `getByRole`; there are no fixed waits, only Playwright's auto-waiting and web-first assertions. Every test sets up its own state and does not depend on another test.
- **Expected values come from test data, not from the page.** For example, order totals are calculated in `calcTotals()` and compared with what the shop shows.
- **Shared public sites:** API tests create uniquely named bookings, clean up after themselves, and CI uses 2 workers.

## Coverage

| Module | Positive | Negative | Edge |
|---|---|---|---|
| Login | every allowed user logs in, Enter key | wrong password, unknown user, empty fields, locked-out user, case, spaces, SQL-style input | 300-char username, masked password, dismiss error, recover after failure, 5 protected URLs |
| Inventory | 6 products, prices, 4 sort orders, add/remove | | badge count, reload persistence, reset app state, product detail |
| Cart | items, prices, quantity, remove, continue shopping | | empty cart, reload persistence |
| Checkout | valid details, totals for 1/2/6 items, full purchase | each required field missing | unicode, apostrophes, alphanumeric postal code, 100-char values, cancel paths |
| Logout | returns to login | | session really ended, another user can log in |
| API | create, read, list/filter, PUT, PATCH, DELETE, Basic auth | missing token, invalid token, missing required field, unknown id, bad credentials | persistence after update/delete |

## Known-bug tests

Bugs are documented in [docs/BUG_REPORTS.md](docs/BUG_REPORTS.md). Their tests assert the **correct** behaviour and are marked `test.fail()`. The suite stays green while the bug exists and the test turns red as soon as it is fixed, which is the signal to remove the marker. They are tagged `BUG-00x` in the test title.

## Not done / limitations

- Only Chromium is configured. Adding Firefox or WebKit is one extra entry in `projects`.
- No visual-regression tests for `visual_user`; layout checks are better done manually or with screenshot baselines.
- `performance_glitch_user` is only covered by the login test (it is slow by design).
- Restful-Booker returns 405 (not 404) for update/delete of an unknown id, so those tests accept either.

## CI

`.github/workflows/playwright.yml` installs dependencies and Chromium, runs the full suite on every pull request (and on pushes to `main`), and uploads the HTML report as an artifact.
