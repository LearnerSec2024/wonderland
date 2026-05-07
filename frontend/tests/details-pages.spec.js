import { test, expect } from "@playwright/test";

test.describe("Wonderland ride and accommodation detail pages", () => {
  test("user can open a ride details page from the rides listing", async ({ page }) => {
    await page.goto("/rides");

    await expect(page.getByTestId("rides-page")).toBeVisible();
    await expect(page.getByTestId("ride-card-1")).toContainText("Dragon Rush Coaster");

    await page.getByTestId("ride-details-link-1").click();

    await expect(page).toHaveURL(/\/rides\/1$/);
    await expect(page.getByTestId("ride-details-page")).toBeVisible();
    await expect(page.getByTestId("ride-details-title")).toContainText("Dragon Rush Coaster");
    await expect(page.getByTestId("ride-details-thrill")).toContainText("Extreme");
    await expect(page.getByTestId("ride-details-age")).toContainText("13+ years");
    await expect(page.getByTestId("ride-details-height")).toContainText("140 cm");
    await expect(page.getByTestId("ride-details-price")).toContainText("$45.00");
    await expect(page.getByTestId("ride-details-points")).toContainText("+120 points");

    await page.getByTestId("ride-details-back-link").click();
    await expect(page).toHaveURL(/\/rides$/);
  });

  test("invalid ride id shows a clean not-found state", async ({ page }) => {
    await page.goto("/rides/999999");

    await expect(page.getByTestId("ride-details-error")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ride not found" })).toBeVisible();

    await page.getByTestId("ride-details-back-link").click();
    await expect(page).toHaveURL(/\/rides$/);
  });

  test("user can open an accommodation details page from the stays listing", async ({ page }) => {
    await page.goto("/accommodations");

    await expect(page.getByTestId("accommodations-page")).toBeVisible();
    await expect(page.getByTestId("accommodation-card-1")).toContainText("Castle View Hotel");

    await page.getByTestId("accommodation-details-link-1").click();

    await expect(page).toHaveURL(/\/accommodations\/1$/);
    await expect(page.getByTestId("accommodation-details-page")).toBeVisible();
    await expect(page.getByTestId("accommodation-details-title")).toContainText("Castle View Hotel");
    await expect(page.getByTestId("accommodation-details-type")).toContainText("Hotel");
    await expect(page.getByTestId("accommodation-details-guests")).toContainText("4 guests");
    await expect(page.getByTestId("accommodation-details-age")).toContainText("18+ years");
    await expect(page.getByTestId("accommodation-details-price")).toContainText("$320.00");

    await page.getByTestId("accommodation-details-back-link").click();
    await expect(page).toHaveURL(/\/accommodations$/);
  });

  test("invalid accommodation id shows a clean not-found state", async ({ page }) => {
    await page.goto("/accommodations/999999");

    await expect(page.getByTestId("accommodation-details-error")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Accommodation not found" })).toBeVisible();

    await page.getByTestId("accommodation-details-back-link").click();
    await expect(page).toHaveURL(/\/accommodations$/);
  });
});
