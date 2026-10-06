# Gremlin Bank Observed UI Test Plan

## Application Overview

Fresh browser-based plan for Gremlin Bank Release 1, based on the seeded demo session and direct UI exploration. Covers authentication, dashboard account and transaction data, chart expansion, and domestic transfer validation through review and confirmation. Use only the workshop demo account; do not enter real data.

## Test Scenarios

### 1. gremlin-bank

**Seed:** `seed.spec.ts`

#### 1.1. Sign in with the workshop demo account

**File:** `tests/gremlin-bank-run2.auth.spec.ts`

**Steps:**
  1. Start from a fresh browser context at /login. Read GREMLIN_USER and GREMLIN_PASSWORD from the environment and submit them using the Username, Password, and Sign in controls.
    - expect: The app opens the authenticated Accounts dashboard at /dashboard.
    - expect: The header identifies the signed-in demo user and shows Sign out.

#### 1.2. Empty sign-in remains unauthenticated

**File:** `tests/gremlin-bank-run2.auth.spec.ts`

**Steps:**
  1. From /login, leave Username and Password empty and submit Sign in.
    - expect: The Username and Password fields remain visible and required.
    - expect: The login page remains open and displays “Wrong username or password.”
    - expect: No authenticated dashboard is shown.

#### 1.3. Sign out ends dashboard access

**File:** `tests/gremlin-bank-run2.auth.spec.ts`

**Steps:**
  1. Start from the seeded authenticated dashboard and select Sign out. Then open /dashboard directly.
    - expect: Sign out navigates to /login, where the username and password controls are visible.
    - expect: Opening /dashboard while signed out returns to /login.

#### 1.4. Dashboard shows account identifiers and balances

**File:** `tests/gremlin-bank-run2.dashboard.spec.ts`

**Steps:**
  1. Open the seeded authenticated dashboard and inspect both account regions.
    - expect: The page heading is “Accounts”.
    - expect: Everyday Account shows IBAN HU39 9992 0265 3141 5926 5358 9797 and balance 1,250,000 HUF.
    - expect: Savings Account shows IBAN HU03 9992 0265 2718 2818 2845 9043 and balance 5,400,000 HUF.

#### 1.5. Dashboard lists recent transactions

**File:** `tests/gremlin-bank-run2.dashboard.spec.ts`

**Steps:**
  1. Inspect the Recent transactions table on the dashboard.
    - expect: The table has Date, Description, and Amount columns and five rows.
    - expect: The rows show: 2026-09-30 Grocery store, Budapest -18,450 HUF; 2026-09-29 Salary, Gremlin Works Ltd. +685,000 HUF; 2026-09-27 Mobile phone bill -7,990 HUF; 2026-09-25 Card payment, bookshop -12,300 HUF; and 2026-09-24 Transfer from Savings Account +50,000 HUF.
    - expect: Income and outgoing amounts retain their displayed signs and HUF formatting.

#### 1.6. Dashboard chart data expands and collapses

**File:** `tests/gremlin-bank-run2.dashboard.spec.ts`

**Steps:**
  1. Select Show chart data in Spending in the last 30 days, inspect the resulting table, then select Hide chart data.
    - expect: Expansion displays a table titled “Spending in the last 30 days” with Date and Amount columns and 30 daily rows from 2026-09-07 through 2026-10-06.
    - expect: Zero values are shown for dates including 2026-09-08, 2026-09-12, 2026-09-17, and 2026-10-01; other rows show HUF amounts.
    - expect: Hide chart data collapses the table without changing the Recent transactions table.

#### 1.7. Transfer form shows sources, payees, and limits

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. Open New transfer from an authenticated seeded session and inspect the form.
    - expect: The page heading is “New transfer”; Everyday Account is selected with 1,250,000 HUF available and Savings Account is selectable.
    - expect: Beneficiary name, IBAN, Amount (HUF), Reference, Check IBAN, and Continue controls are available.
    - expect: Saved payees are Kiss Péter (HU72 9990 1017 1618 0339 8874 9892), Nagy Eszter (HU71 9990 2025 1414 2135 6237 3099), and Tóth Bence (HU03 9990 3033 1732 0508 0756 8879).
    - expect: The form states limits of up to 10,000,000 HUF per transfer and 2,000,000 HUF per day.

#### 1.8. Transfer form validates required fields

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. On a fresh transfer form, leave every field empty and select Continue.
    - expect: The page stays on the form and shows “Enter a beneficiary name.”, “Check the IBAN first.”, and “Enter an amount greater than 0.”
    - expect: The user is not taken to Review transfer.

#### 1.9. Transfer requires a verified IBAN

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. Enter a beneficiary name and an incomplete IBAN such as HU12 9999. Select Check IBAN, then Continue.
    - expect: The incomplete IBAN is not accepted as verified.
    - expect: The form remains open and displays “Check the IBAN first.”
    - expect: The user cannot proceed to Review transfer until the IBAN is valid and checked.

#### 1.10. Saved payee reaches transfer review

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. Select Use Kiss Péter, verify the populated beneficiary and IBAN with Check IBAN, enter amount 1 HUF, and select Continue.
    - expect: The beneficiary and IBAN fields contain Kiss Péter and HU72 9990 1017 1618 0339 8874 9892; the IBAN is shown as verified.
    - expect: Review transfer shows Everyday Account as From, Kiss Péter as To, amount 1 HUF, fee 200 HUF, and total 201 HUF.
    - expect: Review offers Confirm transfer and Change details; no transfer is submitted merely by reaching review.

#### 1.11. Transfer fees and totals match amount examples

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. Using a verified saved payee, review transfers for 1 HUF and 250,000 HUF from Everyday Account, then 2,000,000 HUF from Savings Account. Do not confirm them.
    - expect: 1 HUF displays a 200 HUF fee and 201 HUF total.
    - expect: 250,000 HUF displays a 750 HUF fee and 250,750 HUF total.
    - expect: 2,000,000 HUF displays a 6,000 HUF fee and 2,006,000 HUF total.
    - expect: Each review displays the selected source account, payee, IBAN, amount, fee, and total.

#### 1.12. Transfer enforces daily and per-transfer limits

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. With a verified payee and Savings Account selected, submit 2,000,000 HUF, then 2,000,001 HUF. Also submit 10,000,000 HUF and 10,000,001 HUF in fresh transfer attempts.
    - expect: 2,000,000 HUF reaches Review transfer when the daily limit is unused.
    - expect: 2,000,001 HUF is rejected on the form with “Daily limit of 2,000,000 HUF exceeded.”
    - expect: 10,000,000 HUF exceeds the advertised daily limit and is rejected for the daily limit.
    - expect: 10,000,001 HUF is rejected with “The maximum single transfer is 10,000,000 HUF.”
    - expect: Rejected amounts do not reach review or get confirmed.

#### 1.13. Transfer checks the selected account balance

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. Use a verified payee and submit 1,250,001 HUF from Everyday Account, then change the source to Savings Account and inspect the available balance.
    - expect: Everyday Account submission is rejected with “Insufficient funds.” and stays on the form.
    - expect: Changing to Savings Account updates the displayed available balance to 5,400,000 HUF.
    - expect: No rejected amount is transferred.

#### 1.14. Review details can be changed before confirmation

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. Reach Review transfer for a valid amount and payee, then select Change details and revise the amount before continuing again.
    - expect: Review shows the selected source, payee, IBAN, amount, fee, and total.
    - expect: Change details returns to the editable form with the payee and IBAN retained.
    - expect: The revised amount is reflected in the next review; no transfer is submitted by changing details.

#### 1.15. Confirmation rejects an invalid PIN

**File:** `tests/gremlin-bank-run2.transfer.spec.ts`

**Steps:**
  1. In an isolated fresh browser context, prepare a valid 1 HUF transfer to Kiss Péter, verify the review values, and select Confirm transfer without a valid PIN; no PIN entry control is present on Review transfer.
    - expect: The app stays on Review transfer and displays the alert “Wrong PIN.”
    - expect: The reviewed source, payee, IBAN, amount, fee, and total remain visible and unchanged.
    - expect: The transfer is not confirmed and no success state is shown.
