import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";

async function deleteUserByEmail(request, email) {
  await request.delete(`${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`);
}

async function registerGuest(page, email) {
  await page.goto("/register");

  await page.getByTestId("register-account-type-guest").check();
  await page.getByTestId("register-first-name-input").fill("Profile");
  await page.getByTestId("register-last-name-input").fill("Guest");
  await page.getByTestId("register-email-input").fill(email);
  await page.getByTestId("register-date-of-birth-input").fill("1994-06-15");
  await page.getByTestId("register-password-input").fill("Password123!");
  await page.getByTestId("register-submit-button").click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

async function registerEmployee(page, accountType, email, dob) {
  await page.goto("/register");

  await page.getByTestId(`register-account-type-${accountType.toLowerCase()}`).check();
  await page.getByTestId("register-first-name-input").fill("Profile");
  await page.getByTestId("register-last-name-input").fill(accountType);
  await page.getByTestId("register-email-input").fill(email);
  await page.getByTestId("register-date-of-birth-input").fill(dob);
  await page.getByTestId("register-password-input").fill("Password123!");
  await page.getByTestId("register-submit-button").click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("Wonderland profile page", () => {
  test("logged-out user is redirected from profile to login", async ({ page }) => {
    await page.goto("/profile");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("guest user can view profile and profile link disappears after logout", async ({ page }) => {
    const email = `profile.guest.${Date.now()}@wonderland.local`;

    await registerGuest(page, email);

    await expect(page.getByTestId("nav-profile")).toBeVisible();

    await page.getByTestId("nav-profile").click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByTestId("profile-page")).toBeVisible();
    await expect(page.getByTestId("profile-user-name")).toContainText("Profile Guest");
    await expect(page.getByTestId("profile-user-email")).toContainText(email);
    await expect(page.getByTestId("profile-user-role")).toContainText("User");
    await expect(page.getByTestId("profile-employee-linked")).toHaveCount(0);
    await expect(page.getByTestId("profile-employee-section")).toHaveCount(0);

    await page.getByTestId("nav-logout").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("nav-login")).toBeVisible();
    await expect(page.getByTestId("nav-profile")).toHaveCount(0);
  });

  test("admin user can view employee-linked profile details", async ({ page, request }) => {
    const email = "profile.admin@wonderland.local";

    await deleteUserByEmail(request, email);
    await registerEmployee(page, "Admin", email, "1987-07-07");

    await page.getByTestId("nav-profile").click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByTestId("profile-user-role")).toContainText("Admin");
    await expect(page.getByTestId("profile-employee-section")).toBeVisible();
    await expect(page.getByTestId("profile-employee-email")).toContainText(email);
    await expect(page.getByTestId("profile-employee-active")).toContainText("Active");
    await expect(page.getByTestId("profile-employee-registered")).toContainText("Yes");
    await expect(page.getByTestId("profile-employee-roles")).toContainText("Admin");
  });

  test("manager user can view employee-linked profile details", async ({ page, request }) => {
    const email = "profile.manager@wonderland.local";

    await deleteUserByEmail(request, email);
    await registerEmployee(page, "Manager", email, "1991-11-11");

    await page.getByTestId("nav-profile").click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByTestId("profile-user-role")).toContainText("Manager");
    await expect(page.getByTestId("profile-employee-section")).toBeVisible();
    await expect(page.getByTestId("profile-employee-email")).toContainText(email);
    await expect(page.getByTestId("profile-employee-active")).toContainText("Active");
    await expect(page.getByTestId("profile-employee-registered")).toContainText("Yes");
    await expect(page.getByTestId("profile-employee-roles")).toContainText("Manager");
  });
});

