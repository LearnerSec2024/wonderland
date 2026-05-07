import { test, expect } from "@playwright/test";

async function clearBasket(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("wonderland_basket");
  });
}

test.describe("Wonderland booking basket", () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test("user can add a ride, update quantity and remove it from basket", async ({ page }) => {
    await page.goto("/rides/1");

    await expect(page.getByTestId("ride-details-page")).toBeVisible();
    await expect(page.getByTestId("ride-details-title")).toContainText("Dragon Rush Coaster");

    await page.getByTestId("ride-details-add-to-basket").click();

    await expect(page.getByTestId("ride-details-basket-message")).toContainText("Dragon Rush Coaster added to basket");
    await expect(page.getByTestId("nav-basket-count")).toContainText("1");

    await page.getByTestId("nav-basket").click();

    await expect(page).toHaveURL(/\/basket$/);
    await expect(page.getByTestId("basket-page")).toBeVisible();
    await expect(page.getByTestId("basket-item-ride-1")).toContainText("Dragon Rush Coaster");
    await expect(page.getByTestId("basket-ride-quantity-1")).toContainText("1");
    await expect(page.getByTestId("basket-summary-total")).toContainText("$45.00");

    await page.getByTestId("basket-ride-increase-1").click();

    await expect(page.getByTestId("basket-ride-quantity-1")).toContainText("2");
    await expect(page.getByTestId("basket-summary-count")).toContainText("2");
    await expect(page.getByTestId("basket-summary-total")).toContainText("$90.00");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Remove Dragon Rush Coaster");
      await dialog.accept();
    });

    await page.getByTestId("basket-remove-ride-1").click();

    await expect(page.getByTestId("basket-empty")).toBeVisible();
  });

  test("user can add accommodation and update guest count with guest-based pricing", async ({ page }) => {
    await page.goto("/accommodations/1");

    await expect(page.getByTestId("accommodation-details-page")).toBeVisible();
    await expect(page.getByTestId("accommodation-details-title")).toContainText("Castle View Hotel");

    await page.getByTestId("accommodation-details-add-to-basket").click();

    await expect(page.getByTestId("accommodation-details-basket-message")).toContainText("Castle View Hotel added to basket");
    await expect(page.getByTestId("nav-basket-count")).toContainText("1");

    await page.getByTestId("nav-basket").click();

    await expect(page.getByTestId("basket-page")).toBeVisible();
    await expect(page.getByTestId("basket-item-accommodation-1")).toContainText("Castle View Hotel");

    // Castle View Hotel base price is $320.
    // 1 guest = 320 + 50% surcharge = $480.
    await expect(page.getByTestId("basket-summary-total")).toContainText("$480.00");
    await expect(page.getByTestId("basket-subtotal-accommodation-1")).toContainText("$480.00");

    await page.getByTestId("basket-accommodation-guests-1").selectOption("3");

    // 3 guests = 320 + 50% + 25% + 25% = $640.
    await expect(page.getByTestId("basket-accommodation-guests-1")).toHaveValue("3");
    await expect(page.getByTestId("basket-subtotal-accommodation-1")).toContainText("$640.00");
    await expect(page.getByTestId("basket-summary-total")).toContainText("$640.00");

    await expect(page.getByTestId("basket-accommodation-pricing-note-1")).toContainText("Guest 1 adds 50%");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Remove Castle View Hotel");
      await dialog.accept();
    });

    await page.getByTestId("basket-remove-accommodation-1").click();

    await expect(page.getByTestId("basket-empty")).toBeVisible();
  });

  test("basket persists after page reload and can be cleared", async ({ page }) => {
    await page.goto("/rides/1");

    await page.getByTestId("ride-details-add-to-basket").click();
    await expect(page.getByTestId("nav-basket-count")).toContainText("1");

    await page.reload();

    await expect(page.getByTestId("nav-basket-count")).toContainText("1");

    await page.getByTestId("nav-basket").click();

    await expect(page.getByTestId("basket-item-ride-1")).toContainText("Dragon Rush Coaster");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("clear your entire Wonderland basket");
      await dialog.accept();
    });

    await page.getByTestId("basket-clear-button").click();

    await expect(page.getByTestId("basket-empty")).toBeVisible();
    await expect(page.getByTestId("nav-basket-count")).toHaveCount(0);
  });
});
