import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";

async function clearBasket(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("wonderland_basket");
  });
}

async function createLoggedInUser(page, request) {
  const email = `checkout.user.${Date.now()}@wonderland.local`;

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "Checkout",
      lastName: "User",
      email,
      dateOfBirth: "1992-05-20",
      password: "Password123!",
    },
  });

  expect(registerResponse.ok()).toBeTruthy();

  const authResult = await registerResponse.json();

  await page.goto("/");
  await page.evaluate((token) => {
    localStorage.setItem("wonderland_token", token);
  }, authResult.token);

  return authResult.user;
}

test.describe("Wonderland checkout and booking confirmation", () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test("checkout requires authentication", async ({ page }) => {
    await page.goto("/rides/1");

    await page.getByTestId("ride-details-add-to-basket").click();
    await page.getByTestId("nav-basket").click();

    await expect(page.getByTestId("basket-checkout-link")).toBeVisible();

    await page.getByTestId("basket-checkout-link").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("logged-in user can checkout basket and see booking confirmation", async ({ page, request }) => {
    await createLoggedInUser(page, request);

    await page.goto("/rides/1");
    await page.getByTestId("ride-details-add-to-basket").click();

    await page.goto("/accommodations/1");
    await page.getByTestId("accommodation-details-add-to-basket").click();

    await expect(page.getByTestId("nav-basket-count")).toContainText("2");

    await page.getByTestId("nav-basket").click();

    await expect(page.getByTestId("basket-page")).toBeVisible();
    await expect(page.getByTestId("basket-summary-total")).toContainText("$525.00");

    await page.getByTestId("basket-checkout-link").click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByTestId("checkout-page")).toBeVisible();
    await expect(page.getByTestId("checkout-summary-total")).toContainText("$525.00");

    await page.getByTestId("checkout-visit-date").fill("2026-12-20");
    await page.getByTestId("checkout-notes").fill("Playwright checkout test booking");
    await page.getByTestId("checkout-submit-button").click();

    await expect(page).toHaveURL(/\/booking-confirmation\/WB-/);
    await expect(page.getByTestId("booking-confirmation-page")).toBeVisible();
    await expect(page.getByTestId("booking-reference")).toContainText("WB-");
    await expect(page.getByTestId("booking-status")).toContainText("Confirmed");
    await expect(page.getByTestId("booking-total")).toContainText("$525.00");
    await expect(page.getByTestId("booking-points")).toContainText("+120");
    await expect(page.getByTestId("booking-confirmation-items")).toContainText("Dragon Rush Coaster");
    await expect(page.getByTestId("booking-confirmation-items")).toContainText("Castle View Hotel");

    await page.getByTestId("nav-basket").click();

    await expect(page.getByTestId("basket-empty")).toBeVisible();
    await expect(page.getByTestId("nav-basket-count")).toHaveCount(0);
  });
});
