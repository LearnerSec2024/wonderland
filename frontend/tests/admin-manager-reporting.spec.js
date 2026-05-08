import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";

async function clearBasket(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("wonderland_basket");
  });
}

async function deleteUserByEmail(request, email) {
  await request.delete(`${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`);
}

async function createGuestBooking(page, request, shouldCancel = false) {
  const email = `reporting.user.${Date.now()}@wonderland.local`;

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "Reporting",
      lastName: "Customer",
      email,
      dateOfBirth: "1992-04-12",
      password: "Password123!",
    },
  });

  const authResult = await registerResponse.json();

  expect(
    registerResponse.ok(),
    `Guest registration failed: ${JSON.stringify(authResult)}`
  ).toBeTruthy();

  await page.addInitScript((token) => {
    localStorage.setItem("wonderland_token", token);
  }, authResult.token);

  await page.goto("/rides/1");
  await page.getByTestId("ride-details-add-to-basket").click();

  await page.getByTestId("nav-basket").click();
  await page.getByTestId("basket-checkout-link").click();

  await page.getByTestId("checkout-visit-date").fill("2026-12-30");
  await page.getByTestId("checkout-notes").fill("Reporting dashboard Playwright test");
  await page.getByTestId("checkout-submit-button").click();

  await expect(page.getByTestId("booking-confirmation-page")).toBeVisible();

  const bookingReference = (await page.getByTestId("booking-reference").innerText()).trim();

  if (shouldCancel) {
    const cancelResponse = await request.post(
      `${API_BASE_URL}/bookings/${bookingReference}/cancel`,
      {
        headers: {
          Authorization: `Bearer ${authResult.token}`,
        },
        data: {
          cancellationReason: "Reporting test cancellation",
        },
      }
    );

    expect(cancelResponse.ok()).toBeTruthy();
  }

  await page.evaluate(() => {
    localStorage.removeItem("wonderland_token");
    localStorage.removeItem("wonderland_basket");
  });

  return {
    bookingReference,
    customerEmail: email,
  };
}

async function registerRoleUser(page, request, accountType, email, dob) {
  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType,
      firstName: "Reporting",
      lastName: accountType,
      email,
      dateOfBirth: dob,
      password: "Password123!",
    },
  });

  const authResult = await registerResponse.json();

  expect(
    registerResponse.ok(),
    `${accountType} registration failed for ${email}: ${JSON.stringify(authResult)}`
  ).toBeTruthy();

  await page.addInitScript((token) => {
    localStorage.setItem("wonderland_token", token);
  }, authResult.token);

  await page.goto("/dashboard");

  await expect(page.getByTestId("dashboard-page")).toBeVisible();
  await expect(page.getByTestId("nav-user-greeting")).toContainText("Reporting");
}

test.describe("Wonderland Admin and Manager reporting", () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test("Admin can view booking reporting dashboard and audit events", async ({ page, request }) => {
    const { bookingReference, customerEmail } = await createGuestBooking(page, request, true);

    await registerRoleUser(
      page,
      request,
      "Admin",
      "reporting.admin@wonderland.local",
      "1985-05-05"
    );

    await expect(page.getByTestId("nav-admin-reports")).toBeVisible();
    await page.getByTestId("nav-admin-reports").click();

    await expect(page).toHaveURL(/\/admin\/reports$/);
    await expect(page.getByTestId("admin-reports-page")).toBeVisible();
    await expect(page.getByTestId("admin-report-summary")).toBeVisible();
    await expect(page.getByTestId("admin-report-total-bookings")).toHaveText(/^[1-9]\d*$/);
    await expect(page.getByTestId("admin-report-status-breakdown")).toContainText("Cancelled");
    await expect(page.getByTestId("admin-report-item-type-breakdown")).toContainText("ride");
    await expect(page.getByTestId("admin-report-cdc-status")).toContainText("Bookings table CDC enabled: Yes");
    await expect(page.getByTestId("admin-report-booking-cdc-events")).toBeVisible();
    await expect(page.getByTestId("admin-report-export-prep")).toContainText("Export report coming soon");
  });

  test("Manager can view operational booking report and recent audit events", async ({ page, request }) => {
    const { bookingReference, customerEmail } = await createGuestBooking(page, request, false);

    await registerRoleUser(
      page,
      request,
      "Manager",
      "reporting.manager@wonderland.local",
      "1988-08-08"
    );

    await expect(page.getByTestId("nav-manager-reports")).toBeVisible();
    await page.getByTestId("nav-manager-reports").click();

    await expect(page).toHaveURL(/\/manager\/reports$/);
    await expect(page.getByTestId("manager-reports-page")).toBeVisible();
    await expect(page.getByTestId("manager-report-summary")).toBeVisible();
    await expect(page.getByTestId("manager-report-total-bookings")).toHaveText(/^[1-9]\d*$/);
    await expect(page.getByTestId("manager-report-status-breakdown")).toContainText("Confirmed");
    await expect(page.getByTestId("manager-report-cdc-status")).toContainText("Bookings table CDC enabled: Yes");
    await expect(page.getByTestId("manager-report-booking-cdc-events")).toBeVisible();
  });

  test("normal User cannot access Admin or Manager reporting pages", async ({ page, request }) => {
    const email = `reporting.normal.${Date.now()}@wonderland.local`;

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        accountType: "Guest",
        firstName: "Reporting",
        lastName: "Normal",
        email,
        dateOfBirth: "1993-09-10",
        password: "Password123!",
      },
    });

    const authResult = await registerResponse.json();

    expect(
      registerResponse.ok(),
      `Guest registration failed: ${JSON.stringify(authResult)}`
    ).toBeTruthy();

    await page.addInitScript((token) => {
      localStorage.setItem("wonderland_token", token);
    }, authResult.token);

    await page.goto("/dashboard");

    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("dashboard-user-role")).toContainText("User");

    await page.goto("/admin/reports");
    await expect(page).toHaveURL(/\/admin\/reports$/);
    await expect(page.getByTestId("access-denied-page")).toBeVisible();

    await page.goto("/manager/reports");
    await expect(page).toHaveURL(/\/manager\/reports$/);
    await expect(page.getByTestId("access-denied-page")).toBeVisible();
  });
});


