# Gremlin Bank browser behavior plan

## Application Overview

Explore Gremlin Bank through the browser from a fresh authenticated state, covering sign-in, sign-out, dashboard data, and domestic transfer validation, fees, limits, review, and confirmation. The scenarios use the current GREMLIN_RELEASE selection and recheck release-specific expectations where applicable.

## Test Scenarios

### 1. gremlin-bank

**Seed:** `seed.spec.ts`

#### 1.1. Sign in with valid demo credentials [medium]

**File:** `tests/gremlin-bank.sign-in.spec.ts`

**Steps:**
  1. Start from a fresh browser context without a bank cookie and open the root URL.
    - expect: The page title or heading is "Sign in to Gremlin Bank" unless the app redirects automatically to the sign-in page.
    - expect: The username field, password field, and Sign in button are visible.
    - expect: The page shows the workshop-only credential warning.
  2. Read GREMLIN_USER and GREMLIN_PASSWORD from the environment and submit them.
    - expect: The app redirects to /dashboard.
    - expect: The header shows the signed-in username and a working Sign out button.
    - expect: The page heading is "Accounts".

#### 1.2. Sign in rejects unknown username [medium]

**File:** `tests/gremlin-bank.sign-in.spec.ts`

**Steps:**
  1. Start from a fresh state and submit an unknown username with GREMLIN_PASSWORD.
    - expect: The sign-in page remains visible.
    - expect: An authentication error is displayed.
    - expect: No dashboard session cookie or authenticated account data is created.

#### 1.3. Sign in rejects incorrect password [medium]

**File:** `tests/gremlin-bank.sign-in.spec.ts`

**Steps:**
  1. Start from a fresh state and submit GREMLIN_USER with an incorrect password.
    - expect: The sign-in page remains visible.
    - expect: An authentication error is displayed.
    - expect: A new browser context is not authenticated.

#### 1.4. Sign in requires both credentials [low]

**File:** `tests/gremlin-bank.sign-in.spec.ts`

**Steps:**
  1. Leave the username empty and submit the form, then repeat with a username and empty password.
    - expect: The relevant field-level validation is displayed.
    - expect: The form is not submitted.
    - expect: The user remains on the sign-in page.

#### 1.5. Sign out from dashboard [low]

**File:** `tests/gremlin-bank.sign-out.spec.ts`

**Steps:**
  1. Start from the authenticated dashboard created by the seed test.
    - expect: The header contains the signed-in username and a Sign out button.
  2. Click Sign out.
    - expect: The application ends the bank session.
    - expect: The browser is on /login or the authenticated dashboard is no longer accessible.
    - expect: The sign-in page shows the username, password, and Sign in controls.

#### 1.6. Dashboard displays account cards and balances [low]

**File:** `tests/gremlin-bank.dashboard.spec.ts`

**Steps:**
  1. Open the authenticated dashboard.
    - expect: The heading is "Accounts".
    - expect: The Everyday Account card is visible with its IBAN and balance of 1,250,000 HUF.
    - expect: The Savings Account card is visible with its IBAN and balance of 5,400,000 HUF.
    - expect: Each account card shows a balance formatted with commas and the HUF currency.
    - expect: The card list is independent of the displayed recent transactions.

#### 1.7. Dashboard displays recent transactions [low]

**File:** `tests/gremlin-bank.dashboard.spec.ts`

**Steps:**
  1. Open the authenticated dashboard.
    - expect: The table heading is "Recent transactions".
    - expect: The columns are Date, Description, and Amount.
    - expect: The first five rows contain 2026-09-30 Grocery store, Budapest -18,450 HUF; 2026-09-29 Salary, Gremlin Works Ltd. +685,000 HUF; 2026-09-27 Mobile phone bill -7,990 HUF; 2026-09-25 Card payment, bookshop -12,300 HUF; and 2026-09-24 Transfer from Savings Account +50,000 HUF.
    - expect: The amounts preserve their sign and HUF format.

#### 1.8. Dashboard shows chart data when requested [low]

**File:** `tests/gremlin-bank.dashboard.spec.ts`

**Steps:**
  1. Open the authenticated dashboard and locate the Spending in the last 30 days section.
    - expect: The section contains a chart-data control.
    - expect: Clicking the control reveals the chart data for the last 30 days.
    - expect: The title remains "Spending in the last 30 days" and the chart identifier or accessible label is present if exposed.
    - expect: The table has 30 date rows from 2026-09-07 through 2026-10-06, including zero values such as 2026-09-08, 2026-09-12, 2026-09-17, and 2026-10-01.
    - expect: The control supports switching back to its collapsed state without leaving the page.
  2. Collapse the chart data.
    - expect: The section returns to its compact state.
    - expect: No duplicate chart data rows are present.
    - expect: The recent transactions section remains visible and unchanged.

#### 1.9. Dashboard exchange rate is indicative and reload-sensitive [low]

**File:** `tests/gremlin-bank.dashboard.spec.ts`

**Steps:**
  1. Open the authenticated dashboard and read the displayed EUR/HUF rate.
    - expect: The label is "EUR/HUF" and the text is an indicative rate.
    - expect: The text states that the rate is updated on every page load.
    - expect: The value is a numeric decimal rate with no hidden currency conversion guarantee.
  2. Reload the dashboard.
    - expect: The displayed rate changes or remains valid as a new page-load value.
    - expect: The explanatory text remains present.
    - expect: The account and transaction content remains unchanged apart from release-specific data refresh.

#### 1.10. Dashboard tip is informational [low]

**File:** `tests/gremlin-bank.dashboard.spec.ts`

**Steps:**
  1. Open the authenticated dashboard.
    - expect: The Tip of the day section is visible.
    - expect: Its text is informational and not a required action.
    - expect: The tip does not modify the account, transaction data, or session state.

#### 1.11. Domestic transfer form initializes from the authenticated state [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Open /transfer from a fresh authenticated session.
    - expect: The page title and heading are "New transfer".
    - expect: The from-account selector defaults to Everyday Account.
    - expect: The available balance is 1,250,000 HUF for Everyday Account.
    - expect: The Savings Account option is available as an alternate source.
    - expect: The beneficiary, IBAN, amount, reference, and Continue controls are visible.
    - expect: The saved payees panel lists Kiss PĂ©ter, Nagy Eszter, and TĂłth Bence with valid Hungarian IBANs.
    - expect: The visible limit text is "up to 10,000,000 HUF per transfer and 2,000,000 HUF per day."

#### 1.12. Transfer validates required fields [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Leave all fields empty and click Continue.
    - expect: The beneficiary name error is "Enter a beneficiary name." The amount error is "Enter an amount greater than 0." The IBAN is not accepted until checked.
    - expect: The user remains on the form, and no review screen is reached.
  2. Repeat with a beneficiary name only, then a valid beneficiary name with an invalid IBAN format.
    - expect: The page displays the appropriate beneficiary or IBAN validation messages.
    - expect: The amount and reference are not silently changed.
    - expect: The form remains editable.

#### 1.13. Transfer rejects invalid or incomplete IBANs [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Enter a beneficiary name and invalid Hungarian IBAN HU12 9999 9999 9999 9999 9999 9999, then click Check IBAN.
    - expect: The page shows "Check the IBAN first." or the equivalent invalid-IBAN validation message.
    - expect: The IBAN is not marked as valid.
    - expect: The user cannot continue to review until the IBAN is corrected or validated.
  2. Enter a valid IBAN format that does not pass the app's own validation, then click Check IBAN.
    - expect: The specific validation message is shown and remains associated with the IBAN field.
    - expect: The review screen is not reached.
    - expect: The user can correct the IBAN without refreshing the page.

#### 1.14. Transfer accepts a valid saved payee and reaches review [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Use the saved payee Kiss PĂ©ter, fill the required fields, and click Check IBAN.
    - expect: The beneficiary name and IBAN values are populated from the saved payee.
    - expect: The IBAN check succeeds without an error message.
    - expect: The amount is accepted when it is greater than 0 and no other validation fails.
  2. Enter 250,000 HUF and reference "Practice transfer", then click Continue.
    - expect: The review page displays From Everyday Account, To Kiss PĂ©ter, the selected IBAN, amount 250,000 HUF, fee 750 HUF, and total 250,750 HUF.
    - expect: The page presents Confirm transfer and Change details.
    - expect: No confirmation is performed before the user confirms.

#### 1.15. Transfer fee and maximum limit are calculated correctly [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Use amounts that exercise the fee rule boundaries: 10,000 HUF, 100,000 HUF, 2,000,000 HUF, and 250,000 HUF.
    - expect: 10,000 HUF has a 200 HUF fee; 100,000 HUF has a 300 HUF fee; 2,000,000 HUF has a 6,000 HUF fee; and 250,000 HUF has a 750 HUF fee.
    - expect: The fee is 0.3% of the amount, rounded to the nearest HUF, with a minimum of 200 HUF and a maximum of 6,000 HUF.
    - expect: The displayed totals are 10,200 HUF, 100,300 HUF, 2,006,000 HUF, and 250,750 HUF.
  2. Use 10,000,000 HUF and then 10,000,001 HUF.
    - expect: 10,000,000 HUF is accepted by the business rules and is not rejected as over-limit.
    - expect: 10,000,001 HUF is rejected with "The maximum single transfer is 10,000,000 HUF."
    - expect: The maximum-transfer validation is shown before review, and the user can adjust the amount.

#### 1.16. Transfer daily limit is enforced independently [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Use a valid beneficiary and IBAN and attempt 2,000,000 HUF when the current daily total has already reached that limit.
    - expect: The transfer is rejected with "Daily limit of 2,000,000 HUF exceeded."
    - expect: The message is tied to the amount field and the review screen is not reached.
    - expect: The form remains usable for correcting the amount or selecting a different source account.
  2. Attempt 1,999,999 HUF after the same daily limit is reached.
    - expect: The amount is rejected by the same daily-limit rule, or the exact app-specific boundary message is shown.
    - expect: The transfer is not confirmed.

#### 1.17. Transfer checks available funds and source account [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Select Everyday Account and enter 1,250,001 HUF with a valid beneficiary and IBAN.
    - expect: The app shows "Insufficient funds." or equivalent available-funds validation.
    - expect: The review screen is not reached.
    - expect: The user can change the source account or amount.
  2. Select Savings Account and enter 1,250,001 HUF, then repeat with 5,400,000 HUF.
    - expect: The Savings Account accepts an amount within its balance.
    - expect: 5,400,000 HUF is the maximum visible balance for the demo account and is validated against the source-account balance.
    - expect: The source-account selection changes the available limit and fee calculation.

#### 1.18. Transfer review supports change and cancellation [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Complete a valid transfer to review and click Change details.
    - expect: The user returns to the form with the entered values still present.
    - expect: The review-specific confirmation controls are removed or hidden.
    - expect: The user can update the beneficiary, IBAN, amount, or reference.
  2. Return to the review screen and use the browser back button or application navigation.
    - expect: The review data remains consistent with the current form values.
    - expect: The user is not accidentally confirmed or submitted.
    - expect: The destination remains in the expected transfer flow.

#### 1.19. Transfer confirmation requires a valid PIN [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Complete a valid transfer to review and click Confirm transfer.
    - expect: The app requests a transaction PIN or equivalent confirmation step.
    - expect: The amount, fee, and total remain visible for confirmation.
  2. Submit an incorrect PIN such as 0000 or another known wrong test PIN.
    - expect: The page shows "Wrong PIN." and keeps the user on the review step.
    - expect: The transfer is not executed or recorded as a new transaction.
    - expect: A second attempt can be made without re-entering everything if the app preserves state.
  3. Submit the known valid PIN for the selected release, if one is supplied by the environment or fixtures.
    - expect: The transfer is confirmed and the application shows the success or confirmation state.
    - expect: The dashboard reflects the reduced source-account balance and new transaction if the release updates state after confirmation.
    - expect: The success path is tested in an isolated fresh state.

#### 1.20. Transfer state is isolated between browser contexts [high]

**File:** `tests/gremlin-bank.transfer.spec.ts`

**Steps:**
  1. Perform a valid transfer in one browser context and inspect a fresh, separate context.
    - expect: The new context starts with a fresh bank state because each browser context has its own cookie-backed state.
    - expect: A transfer in one context does not change the balance or daily total in another context.
    - expect: The test can run independently in any order.

