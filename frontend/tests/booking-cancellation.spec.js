import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";

async function clearBasket(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("wonderland_basket");
  });
}

async function createLoggedInUser(page, request) {
  const email = `cancel.user.${Date.now()}@wonderland.local`;

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "Cancel",
      lastName: "User",
      email,
      dateOfBirth: "1990-06-10",
      password: "Password123!",
    },
  });

  expect(registerResponse.ok()).toBeTruthy();

  const authResult = await registerResponse.json();

  await page.goto("/");
  await page.evaluate((token) => {
    localStorage.setItem("wonderland_token", token);
  }, authResult.token);

  return authResult;
}

async function checkoutRide(page) {
  await page.goto("/rides/1");
  await page.getByTestId("ride-details-add-to-basket").click();

  await page.getByTestId("nav-basket").click();
  await page.getByTestId("basket-checkout-link").click();

  await expect(page.getByTestId("checkout-page")).toBeVisible();

  await page.getByTestId("checkout-visit-date").fill("2026-12-26");
  await page.getByTestId("checkout-notes").fill("Cancellation Playwright test");
  await page.getByTestId("checkout-submit-button").click();

  await expect(page.getByTestId("booking-confirmation-page")).toBeVisible();

  return (await page.getByTestId("booking-reference").innerText()).trim();
}

test.describe("Wonderland booking cancellation", () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test("user can cancel a confirmed booking and see Cancelled status in history", async ({ page, request }) => {
    await createLoggedInUser(page, request);

    const bookingReference = await checkoutRide(page);

    await expect(page.getByTestId("booking-status")).toContainText("Confirmed");
    await expect(page.getByTestId("booking-cancel-button")).toBeVisible();

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain(`Cancel booking ${bookingReference}`);
      await dialog.accept();
    });

    await page.getByTestId("booking-cancel-button").click();

    await expect(page.getByTestId("booking-cancel-message")).toContainText("Booking cancelled successfully");
    await expect(page.getByTestId("booking-status")).toContainText("Cancelled");
    await expect(page.getByTestId("booking-timeline-cancelled")).toBeVisible();
    await expect(page.getByTestId("booking-cancellation-reason")).toContainText("Cancelled by customer");
    await expect(page.getByTestId("booking-cancel-disabled")).toBeVisible();

    await page.getByTestId("booking-detail-history-link").click();

    await expect(page).toHaveURL(/\/bookings\/history$/);
    await expect(page.getByTestId("booking-history-page")).toBeVisible();
    await expect(page.getByTestId("booking-history-list")).toContainText(bookingReference);
    await expect(page.getByTestId("booking-history-list")).toContainText("Cancelled");

    await page.getByTestId("booking-history-status-filter").selectOption("Cancelled");

    await expect(page.getByTestId("booking-history-filter-count")).toContainText("Showing 1 of 1 bookings");
    await expect(page.getByTestId("booking-history-list")).toContainText(bookingReference);
    await expect(page.getByTestId("booking-history-list")).toContainText("Cancelled");

    await page.getByTestId(`booking-history-view-${bookingReference}`).click();

    await expect(page.getByTestId("booking-confirmation-page")).toBeVisible();
    await expect(page.getByTestId("booking-status")).toContainText("Cancelled");
    await expect(page.getByTestId("booking-cancel-disabled")).toBeVisible();
  });

  test("backend prevents cancelling the same booking twice", async ({ page, request }) => {
    const authResult = await createLoggedInUser(page, request);
    const bookingReference = await checkoutRide(page);

    const firstCancelResponse = await request.post(
      `${API_BASE_URL}/bookings/${bookingReference}/cancel`,
      {
        headers: {
          Authorization: `Bearer ${authResult.token}`,
        },
        data: {
          cancellationReason: "Cancelled once by API test",
        },
      }
    );

    expect(firstCancelResponse.ok()).toBeTruthy();

    const secondCancelResponse = await request.post(
      `${API_BASE_URL}/bookings/${bookingReference}/cancel`,
      {
        headers: {
          Authorization: `Bearer ${authResult.token}`,
        },
        data: {
          cancellationReason: "Second cancellation attempt",
        },
      }
    );

    expect(secondCancelResponse.status()).toBe(400);

    const secondCancelBody = await secondCancelResponse.json();
    expect(secondCancelBody.message).toContain("already cancelled");
  });
});
