import { test, expect } from "@playwright/test";

test.describe("Wonderland frontend authentication flow", () => {
  test("guest user can register, logout, login, and view dashboard", async ({ page }) => {
    const uniqueId = Date.now();
    const firstName = "Playwright";
    const lastName = "Tester";
    const email = `playwright.${uniqueId}@wonderland.local`;
    const password = "Password123!";

    await page.goto("/register");

    await page.getByTestId("register-account-type-guest").check();
    await page.getByTestId("register-first-name-input").fill(firstName);
    await page.getByTestId("register-last-name-input").fill(lastName);
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-date-of-birth-input").fill("1995-05-15");
    await page.getByTestId("register-password-input").fill(password);
    await page.getByTestId("register-submit-button").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("dashboard-user-email")).toContainText(email);
    await expect(page.getByTestId("dashboard-user-name")).toContainText(firstName);
    await expect(page.getByTestId("dashboard-user-role")).toContainText("User");
    await expect(page.getByTestId("nav-user-greeting")).toContainText(firstName);

    await page.getByTestId("nav-logout").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();

    await page.getByTestId("login-email-input").fill(email);
    await page.getByTestId("login-password-input").fill(password);
    await page.getByTestId("login-submit-button").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByTestId("dashboard-user-email")).toContainText(email);
    await expect(page.getByTestId("dashboard-total-points")).toContainText("0");
    await expect(page.getByTestId("dashboard-user-role")).toContainText("User");
  });

  test("invalid login shows a helpful error", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-email-input").fill("missing.user@wonderland.local");
    await page.getByTestId("login-password-input").fill("WrongPassword123!");
    await page.getByTestId("login-submit-button").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page.getByTestId("login-error")).toContainText("Invalid email or password");
  });
});
