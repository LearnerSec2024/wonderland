import { test, expect } from "@playwright/test";

test.describe("Wonderland app shell smoke tests", () => {
  test("homepage loads and shows live Wonderland data", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("home-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /welcome to wonderland/i })
    ).toBeVisible();

    await expect(page.getByText("Dragon Rush Coaster")).toBeVisible();
    await expect(page.getByText("Castle View Hotel")).toBeVisible();
  });

  test("navbar links navigate to the main pages", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("nav-rides").click();
    await expect(page).toHaveURL(/\/rides$/);
    await expect(page.getByTestId("rides-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rides" })).toBeVisible();

    await page.getByTestId("nav-accommodations").click();
    await expect(page).toHaveURL(/\/accommodations$/);
    await expect(page.getByTestId("accommodations-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Accommodation" })).toBeVisible();

    await page.getByTestId("nav-dashboard").click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByTestId("nav-login").click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    await page.getByTestId("nav-register").click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByTestId("register-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create account" })).toBeVisible();

    await page.getByTestId("brand-link").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("home-page")).toBeVisible();
  });

  test("unknown routes show the custom not found page", async ({ page }) => {
    await page.goto("/does-not-exist");

    await expect(page.getByTestId("not-found-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();

    await page.getByTestId("not-found-home-link").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("home-page")).toBeVisible();
  });

  test("login and register forms are visible with expected fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("login-email-input")).toBeVisible();
    await expect(page.getByTestId("login-password-input")).toBeVisible();
    await expect(page.getByTestId("login-submit-button")).toBeVisible();

    await page.goto("/register");

    await expect(page.getByTestId("register-form")).toBeVisible();
    await expect(page.getByTestId("register-first-name-input")).toBeVisible();
    await expect(page.getByTestId("register-last-name-input")).toBeVisible();
    await expect(page.getByTestId("register-email-input")).toBeVisible();
    await expect(page.getByTestId("register-password-input")).toBeVisible();
    await expect(page.getByTestId("register-submit-button")).toBeVisible();
  });
});

