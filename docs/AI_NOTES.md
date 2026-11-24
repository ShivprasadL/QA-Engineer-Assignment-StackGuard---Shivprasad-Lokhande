# AI Notes

## Tools used

- **Claude (Anthropic)**: 
## What I used it for

- Drafting the project skeleton: Playwright config with projects, the setup project for `storageState`, page objects and fixtures.
- Drafting the first version of the test plan, the test cases and the data tables (invalid logins, edge inputs, required fields).
- Drafting the API client and the API tests for Restful-Booker.
- Writing the README and the CI workflow.

## What I did myself

- Ran every test against the live sites, fixed what failed, and reproduced each bug by hand before reporting it.
- Reviewed every file so that I can explain it and change it.

## One time the AI was wrong

The AI wrote the expected login error message from memory as "...do not match any user in **our** service". The real site says "...in **this** service".

I noticed on the first full run: 9 login tests failed with the same diff, and Playwright's call log printed the actual text next to the expected text. I fixed the constant in `src/data/messages.ts`, and since every test reads it from that one place, one edit fixed all nine.

The same run exposed two more wrong assumptions from the AI:
- A button locator matched 3 elements (strict mode violation), because the product image and title links also have `role=button`. I added an `actionButton()` helper that targets the real `<button>`.
- The side menu has a 5th link, "Dynamic Catalog", that the AI did not know about. I changed the test to check that each expected link is present instead of matching the whole list.

Lesson: the AI wrote expected values and selectors without seeing the live site, so every one needed checking by running the tests.
