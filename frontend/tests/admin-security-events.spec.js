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
      firstName: "Security",
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
  const email = `security.normal.${Date.now()}.${Math.floor(
    Math.random() * 10000
  )}@wonderland.local`;

  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "Security",
      lastName: "Normal",
      email,
      dateOfBirth: "1994-03-15",
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

async function createFailedLoginEvent(request) {
  const email = `security.failed.${Date.now()}.${Math.floor(
    Math.random() * 10000
  )}@wonderland.local`;

  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email,
      password: "WrongPassword123!",
    },
  });

  expect(response.status()).toBeGreaterThanOrEqual(400);

  return email;
}

test.describe("Wonderland Admin security events", () => {
  test("Admin can view security events and apply filters", async ({
    page,
    request,
  }) => {
    await createFailedLoginEvent(request);

    const adminAuth = await registerRoleUser(
      request,
      "Admin",
      "reporting.admin@wonderland.local",
      "1985-05-05"
    );

    await setAuthToken(page, adminAuth.token);

    await expect(page.getByTestId("nav-admin-security-events")).toBeVisible();
    await page.getByTestId("nav-admin-security-events").click();

    await expect(page).toHaveURL(/\/admin\/security-events$/);
    await expect(page.getByTestId("admin-security-events-page")).toBeVisible();

    await expect(page.getByTestId("security-summary-total")).toBeVisible();
    await expect(page.getByTestId("security-summary-high-risk")).toBeVisible();
    await expect(page.getByTestId("security-summary-denied")).toBeVisible();
    await expect(page.getByTestId("security-summary-failed")).toBeVisible();

    await expect(page.getByTestId("security-events-list")).toContainText(
      "FailedLogin",
      { timeout: 10000 }
    );

    await page.getByTestId("security-severity-filter").selectOption("Medium");
    await page.getByTestId("security-category-filter").selectOption("Authentication");
    await page.getByTestId("security-action-status-filter").selectOption("Failed");
    await page.getByTestId("security-search-filter").fill("FailedLogin");
    await page.getByTestId("apply-security-filters").click();

    await expect(page.getByTestId("security-events-filters")).toContainText(
      "Severity Medium"
    );
    await expect(page.getByTestId("security-events-filters")).toContainText(
      "Category Authentication"
    );
    await expect(page.getByTestId("security-events-filters")).toContainText(
      "Status Failed"
    );
    await expect(page.getByTestId("security-events-filters")).toContainText(
      'Search "FailedLogin"'
    );

    await expect(page.getByTestId("security-events-list")).toContainText(
      "FailedLogin"
    );
    await expect(page.getByTestId("security-events-list")).toContainText(
      "Authentication"
    );
    await expect(page.getByTestId("security-events-list")).toContainText(
      "Medium"
    );
  });

  test("normal User cannot access Admin security events page", async ({
    page,
    request,
  }) => {
    const userAuth = await registerGuestUser(request);

    await setAuthToken(page, userAuth.token);

    await page.goto("/admin/security-events", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/admin\/security-events$/);
    await expect(page.getByTestId("access-denied-page")).toBeVisible();
  });
});
