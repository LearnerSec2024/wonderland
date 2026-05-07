import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";

async function clearBasket(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("wonderland_basket");
  });
}

async function createLoggedInUser(page, request) {
  const email = `history.user.${Date.now()}@wonderland.local`;

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "History",
      lastName: "User",
      email,
      dateOfBirth: "1991-07-15",
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

async function completeRideCheckout(page, request) {
  await createLoggedInUser(page, request);

  await page.goto("/rides/1");
  await page.getByTestId("ride-details-add-to-basket").click();

  await page.getByTestId("nav-basket").click();
  await page.getByTestId("basket-checkout-link").click();

  await expect(page.getByTestId("checkout-page")).toBeVisible();

  await page.getByTestId("checkout-visit-date").fill("2026-12-24");
  await page.getByTestId("checkout-notes").fill("Booking history Playwright test");
  await page.getByTestId("checkout-submit-button").click();

  await expect(page.getByTestId("booking-confirmation-page")).toBeVisible();

  return (await page.getByTestId("booking-reference").innerText()).trim();
}

test.describe("Wonderland booking history", () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test("booking appears on dashboard and booking history after checkout", async ({ page, request }) => {
    const bookingReference = await completeRideCheckout(page, request);

    await expect(bookingReference).toMatch(/^WB-/);

    await page.getByTestId("booking-confirmation-dashboard-link").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("dashboard-recent-bookings-list")).toContainText(bookingReference);
    await expect(page.getByTestId("dashboard-recent-bookings-list")).toContainText("$45.00");
    await expect(page.getByTestId("dashboard-recent-bookings-list")).toContainText("+120 pts");

    await page.getByTestId("dashboard-booking-history-link").click();

    await expect(page).toHaveURL(/\/bookings\/history$/);
    await expect(page.getByTestId("booking-history-page")).toBeVisible();
    await expect(page.getByTestId("booking-history-list")).toContainText(bookingReference);
    await expect(page.getByTestId("booking-history-total-count")).toContainText("1");
    await expect(page.getByTestId("booking-history-total-spend")).toContainText("$45.00");
    await expect(page.getByTestId("booking-history-total-points")).toContainText("+120");

    await page.getByTestId("booking-history-search-input").fill(bookingReference);

    await expect(page.getByTestId("booking-history-filter-count")).toContainText("Showing 1 of 1 bookings");
    await expect(page.getByTestId("booking-history-list")).toContainText(bookingReference);

    await page.getByTestId("booking-history-status-filter").selectOption("Confirmed");

    await expect(page.getByTestId("booking-history-filter-count")).toContainText("Showing 1 of 1 bookings");

    await page.getByTestId("booking-history-search-input").fill("NO-MATCHING-BOOKING");

    await expect(page.getByTestId("booking-history-no-results")).toBeVisible();

    await page.getByTestId("booking-history-clear-filters").click();

    await expect(page.getByTestId("booking-history-list")).toContainText(bookingReference);

    await page.getByTestId(`booking-history-view-${bookingReference}`).click();

    await expect(page).toHaveURL(new RegExp(`/booking-confirmation/${bookingReference}$`));
    await expect(page.getByTestId("booking-confirmation-page")).toBeVisible();
    await expect(page.getByTestId("booking-reference")).toContainText(bookingReference);
    await expect(page.getByTestId("booking-confirmation-items")).toContainText("Dragon Rush Coaster");
    await expect(page.getByTestId("booking-timeline")).toBeVisible();
    await expect(page.getByTestId("booking-timeline-confirmed")).toContainText("Confirmed");
    await expect(page.getByTestId("booking-cancellation-prep")).toContainText("Cancellation coming soon");

    await page.getByTestId("booking-detail-history-link").click();

    await expect(page).toHaveURL(/\/bookings\/history$/);
    await expect(page.getByTestId("booking-history-page")).toBeVisible();
  });

  test("profile page links to booking history", async ({ page, request }) => {
    await createLoggedInUser(page, request);

    await page.goto("/profile");

    await expect(page.getByTestId("profile-page")).toBeVisible();
    await expect(page.getByTestId("profile-booking-history-link")).toBeVisible();

    await page.getByTestId("profile-booking-history-link").click();

    await expect(page).toHaveURL(/\/bookings\/history$/);
    await expect(page.getByTestId("booking-history-page")).toBeVisible();
  });

  test("booking history shows empty state when user has no bookings", async ({ page, request }) => {
    await createLoggedInUser(page, request);

    await page.goto("/bookings/history");

    await expect(page.getByTestId("booking-history-page")).toBeVisible();
    await expect(page.getByTestId("booking-history-empty")).toBeVisible();
  });
});
