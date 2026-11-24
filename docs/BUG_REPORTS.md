# Bug Reports (Sauce Demo)

Each bug has an automated test marked `test.fail()` so it stays documented and turns red once fixed.

---

## BUG-001: Checkout can be started with an empty cart

| | |
|---|---|
| **Account** | standard_user |
| **Severity** | Medium. A zero-value order can be completed, which pollutes order data, though no money is lost. |
| **Test** | `tests/ui/authenticated/cart.spec.ts` ("an empty cart cannot proceed to checkout [BUG-001]") |

**Steps**
1. Log in as `standard_user` / `secret_sauce` with an empty cart.
2. Click the cart icon.
3. Click **Checkout**.

**Expected:** Checkout is blocked or disabled, or an error says the cart is empty.
**Actual:** The "Checkout: Your Information" page opens, and the user can continue to the overview and finish an order with no items.

![alt text](image.png)

---

## BUG-002: All product images are identical

| | |
|---|---|
| **Account** | problem_user |
| **Severity** | Medium. Shoppers cannot tell products apart visually, which hurts conversion; purchase still works. |
| **Test** | `known-bugs.spec.ts` ("BUG-002: every product shows its own image") |

**Steps**
1. Log in as `problem_user` / `secret_sauce`.
2. Look at the product list.

**Expected:** Each of the 6 products shows its own product image.
**Actual:** All products show the same image (the dog photo), so there is only 1 unique image source on the page.

![alt text](image.png)

---

## BUG-003: Checkout form does not keep what the user types

| | |
|---|---|
| **Account** | problem_user |
| **Severity** | High. A required form cannot be filled in correctly, so the user cannot complete a purchase. |
| **Test** | `known-bugs.spec.ts` ("BUG-003: checkout form keeps what the user typed") |

**Steps**
1. Log in as `problem_user` / `secret_sauce`, add any product to the cart, click the cart icon, then **Checkout**.
2. Type a first name, then a last name, then a postal code.
3. Observe the three fields, then click **Continue**.

**Expected:** Each field keeps the value typed into it; Continue opens the overview.
**Actual:** Typing in the last-name field changes the first-name field instead, and the last name stays empty. Continue shows "Error: Last Name is required".

![alt text](image.png)

---

## BUG-004: Sort dropdown does not sort

| | |
|---|---|
| **Account** | problem_user |
| **Severity** | Low. Users can still browse and buy; sorting is a convenience feature. |
| **Test** | `known-bugs.spec.ts` ("BUG-004: sorting Z to A reverses the list") |

**Steps**
1. Log in as `problem_user` / `secret_sauce`.
2. Choose **Name (Z to A)** in the sort dropdown.

**Expected:** Products are listed Z to A.
**Actual:** The list order does not change to Z to A.

![alt text](image.png)
