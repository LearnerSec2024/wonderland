import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";
const STORAGE_SETUP_URL = "/src/main.jsx";

async function deleteUserByEmail(request, email) {
  await request.delete(
    `${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`
  );
}

async function setAuthToken(page, token) {
  await page.goto(STORAGE_SETUP_URL, { waitUntil: "domcontentloaded" });

  await page.evaluate((userToken) => {
    window.localStorage.removeItem("wonderland_token");
    window.localStorage.removeItem("wonderland_basket");
    window.localStorage.setItem("wonderland_token", userToken);
  }, token);

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("dashboard-page")).toBeVisible({
    timeout: 10000,
  });
}

async function registerRoleUser(request, accountType, email, dob) {
  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType,
      firstName: "Audit",
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

  return authResult;
}

async function registerGuestUser(request) {
  const email = `audit.normal.${Date.now()}.${Math.floor(
    Math.random() * 10000
  )}@wonderland.local`;

  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "Audit",
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

  return authResult;
}

test.describe("Wonderland Admin audit logs", () => {
  test("Admin can view audit events and apply filters", async ({
    page,
    request,
  }) => {
    const adminAuth = await registerRoleUser(
      request,
      "Admin",
      "reporting.admin@wonderland.local",
      "1985-05-05"
    );

    const exportResponse = await request.get(
      `${API_BASE_URL}/admin/reports/bookings/export.csv`,
      {
        headers: {
          Authorization: `Bearer ${adminAuth.token}`,
        },
      }
    );

    expect(exportResponse.ok()).toBeTruthy();

    await setAuthToken(page, adminAuth.token);

    await expect(page.getByTestId("nav-admin-audit-logs")).toBeVisible();
    await page.getByTestId("nav-admin-audit-logs").click();

    await expect(page).toHaveURL(/\/admin\/audit-logs$/);
    await expect(page.getByTestId("admin-audit-logs-page")).toBeVisible();
    await expect(page.getByTestId("admin-audit-summary")).toBeVisible();

    await expect(page.getByTestId("admin-audit-events")).toContainText(
      "AdminDownloadedBookingCsvReport",
      { timeout: 10000 }
    );

    await page.getByTestId("admin-audit-event-category").selectOption("Report");
    await page.getByTestId("admin-audit-action-status").selectOption("Succeeded");
    await page.getByTestId("admin-audit-search").fill("CSV");
    await page.getByTestId("admin-audit-apply-filters").click();

    await expect(page.getByTestId("admin-audit-active-filters")).toContainText(
      "Category Report"
    );
    await expect(page.getByTestId("admin-audit-active-filters")).toContainText(
      "Status Succeeded"
    );
    await expect(page.getByTestId("admin-audit-active-filters")).toContainText(
      'Search "CSV"'
    );

    await expect(page.getByTestId("admin-audit-events")).toContainText(
      "AdminDownloadedBookingCsvReport"
    );
  });

  test("normal User cannot access Admin audit logs page", async ({
    page,
    request,
  }) => {
    const userAuth = await registerGuestUser(request);

    await setAuthToken(page, userAuth.token);

    await page.goto("/admin/audit-logs", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/admin\/audit-logs$/);
    await expect(page.getByTestId("access-denied-page")).toBeVisible();
  });
});