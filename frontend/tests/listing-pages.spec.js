import { test, expect } from "@playwright/test";

test.describe("Wonderland rides and accommodation listing pages", () => {
  test("rides page loads live ride cards and supports search", async ({ page }) => {
    await page.goto("/rides");

    await expect(page.getByTestId("rides-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rides" })).toBeVisible();

    await expect(page.getByTestId("ride-card-1")).toContainText("Dragon Rush Coaster");
    await expect(page.getByTestId("ride-card-2")).toContainText("Pirate Splash Falls");
    await expect(page.getByTestId("rides-result-count")).toContainText(/Showing \d+ of \d+ rides/);

    await page.getByTestId("rides-search-input").fill("Dragon");

    await expect(page.getByTestId("ride-card-1")).toBeVisible();
    await expect(page.getByText("Pirate Splash Falls")).not.toBeVisible();
    await expect(page.getByTestId("rides-result-count")).toContainText(/Showing 1 of \d+ rides/);

    await page.getByTestId("rides-search-input").fill("No ride should match this");

    await expect(page.getByTestId("rides-empty-state")).toBeVisible();

    await page.getByTestId("rides-clear-filters").click();

    await expect(page.getByTestId("rides-result-count")).toContainText(/Showing \d+ of \d+ rides/);
  });

  test("rides page supports category, thrill and sort filters", async ({ page }) => {
    await page.goto("/rides");

    await page.getByTestId("rides-thrill-filter").selectOption("Extreme");

    await expect(page.getByTestId("ride-card-1")).toContainText("Dragon Rush Coaster");
    await expect(page.getByText("Pirate Splash Falls")).not.toBeVisible();

    await page.getByTestId("rides-clear-filters").click();

    await page.getByTestId("rides-category-filter").selectOption("Water Ride");

    await expect(page.getByTestId("ride-card-2")).toContainText("Pirate Splash Falls");
    await expect(page.getByText("Dragon Rush Coaster")).not.toBeVisible();

    await page.getByTestId("rides-clear-filters").click();

    await page.getByTestId("rides-sort-select").selectOption("points-desc");

    const firstCard = page.getByTestId("rides-results-grid").locator("article").first();
    await expect(firstCard).toContainText("Dragon Rush Coaster");
  });

  test("accommodation page loads live stay cards and supports search", async ({ page }) => {
    await page.goto("/accommodations");

    await expect(page.getByTestId("accommodations-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Accommodation" })).toBeVisible();

    await expect(page.getByTestId("accommodation-card-1")).toContainText("Castle View Hotel");
    await expect(page.getByTestId("accommodation-card-2")).toContainText("Jungle Lodge");
    await expect(page.getByTestId("accommodations-result-count")).toContainText(/Showing \d+ of \d+ stays/);

    await page.getByTestId("accommodations-search-input").fill("Jungle");

    await expect(page.getByTestId("accommodation-card-2")).toBeVisible();
    await expect(page.getByText("Castle View Hotel")).not.toBeVisible();
    await expect(page.getByTestId("accommodations-result-count")).toContainText(/Showing 1 of \d+ stays/);

    await page.getByTestId("accommodations-search-input").fill("No stay should match this");

    await expect(page.getByTestId("accommodations-empty-state")).toBeVisible();

    await page.getByTestId("accommodations-clear-filters").click();

    await expect(page.getByTestId("accommodations-result-count")).toContainText(/Showing \d+ of \d+ stays/);
  });

  test("accommodation page supports type, guest and sort filters", async ({ page }) => {
    await page.goto("/accommodations");

    await page.getByTestId("accommodations-type-filter").selectOption("Cabin");

    await expect(page.getByTestId("accommodation-card-3")).toContainText("Pirate Cove Cabins");
    await expect(page.getByText("Castle View Hotel")).not.toBeVisible();

    await page.getByTestId("accommodations-clear-filters").click();

    await page.getByTestId("accommodations-guests-filter").selectOption("6");

    await expect(page.getByTestId("accommodation-card-3")).toContainText("Pirate Cove Cabins");
    await expect(page.getByText("Jungle Lodge")).not.toBeVisible();

    await page.getByTestId("accommodations-clear-filters").click();

    await page.getByTestId("accommodations-sort-select").selectOption("price-desc");

    const firstCard = page.getByTestId("accommodations-results-grid").locator("article").first();
    await expect(firstCard).toContainText("Galaxy Resort Suites");
  });
});


