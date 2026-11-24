# Test Plan: Sauce Demo checkout flow

**Scope:** the path from a filled cart to a completed order: cart, checkout step one (your information), step two (overview), and complete. Login and logout are covered as preconditions.
**Environment:** https://www.saucedemo.com, Chromium, accounts `standard_user` (main) and `problem_user` (defect hunting).

## Main risks

| # | Risk | Why it matters |
|---|---|---|
| R1 | Wrong money: item total, 8% tax or total is miscalculated | Customers are charged incorrectly; highest business impact |
| R2 | Order cannot be completed (broken form, buttons, navigation) | Lost revenue |
| R3 | Validation gaps: required fields not enforced, or valid input rejected | Bad orders, or good customers turned away |
| R4 | Cart and order content mismatch (wrong item, quantity or price carried over) | Customer receives or pays for the wrong thing |
| R5 | Invalid orders allowed (empty cart) | Meaningless or fraudulent orders |
| R6 | Access control: checkout pages open without a session | Security / data exposure |
| R7 | State leaks: cart not cleared after purchase, or lost on reload | Duplicate orders / lost carts |
| R8 | User-specific defects (`problem_user`, `error_user`) | Accounts behave differently; hard to spot manually |

## Top 10 test cases (priority order)

| P | Test case | Risk | Automate? | Why | Spec |
|---|---|---|---|---|---|
| 1 | Complete purchase end to end: add items, fill details, finish, see "Thank you for your order!" | R2 | **Yes** | Revenue-critical smoke test, stable, runs on every PR | checkout.spec: full purchase |
| 2 | Order totals: item total + 8% tax = total for 1, 2 and 6 items | R1 | **Yes** | Money must be exact; data-driven and cheap to run repeatedly | checkout.spec: totals |
| 3 | Each required field (first name, last name, postal code) left empty shows the right error and blocks progress | R3 | **Yes** | Deterministic rules, easy to table-drive | checkout.spec: blocks progress |
| 4 | Overview shows exactly the items from the cart; an item removed from the cart does not appear | R4 | **Yes** | Catches state-carry-over regressions | checkout.spec: removed item |
| 5 | Empty cart cannot proceed to checkout | R5 | **Yes** | Business rule; currently fails, see BUG-001 | cart.spec: BUG-001 |
| 6 | Checkout URLs are not reachable without logging in | R6 | **Yes** | Security regression guard; fast, one check per URL | login.spec: protected paths |
| 7 | Cart is empty after a successful order and the badge disappears | R7 | **Yes** | Prevents duplicate orders; same flow as #1, so cheap to add | checkout.spec: full purchase |
| 8 | Cancel on step one returns to the cart (items kept); cancel on overview returns to the products page | R2, R7 | **Yes** | Navigation paths users take often | checkout.spec: Cancel |
| 9 | Legitimate edge input (apostrophe, accents, alphanumeric postal code, 1-char and 100-char values) is accepted | R3 | **Yes** | Cheap data-driven check against over-strict validation | checkout.spec: edge input |
| 10 | `problem_user` can fill the form and the data stays as typed | R8 | **Yes** (as `test.fail`) | Reproducible defect, see BUG-003 | known-bugs.spec |

## Not automated (manual or exploratory)

- `performance_glitch_user` timing: covered only as "can still log in"; real performance testing needs different tooling.

## Entry and exit criteria

- **Entry:** site reachable, test accounts available.
- **Exit:** all P1 to P6 cases pass (or fail only as documented bugs); every failure is either fixed or filed in `BUG_REPORTS.md`.
