import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";

async function deleteUserByEmail(request, email) {
  await request.delete(`${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`);
}

test.describe("Wonderland role-based registration", () => {
  test("admin can register only with pre-approved employee email and matching DOB", async ({ page, request }) => {
    const email = "ava.admin@wonderland.local";
    const password = "Password123!";

    await deleteUserByEmail(request, email);

    await page.goto("/register");

    await page.getByTestId("register-account-type-admin").check();
    await expect(page.getByTestId("register-account-type-help")).toContainText("pre-approved active employee email");

    await page.getByTestId("register-first-name-input").fill("Ava");
    await page.getByTestId("register-last-name-input").fill("Admin");
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-date-of-birth-input").fill("1988-04-12");
    await page.getByTestId("register-password-input").fill(password);
    await page.getByTestId("register-submit-button").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-user-email")).toContainText(email);
    await expect(page.getByTestId("dashboard-user-role")).toContainText("Admin");
  });

  test("manager can register only with pre-approved employee email and matching DOB", async ({ page, request }) => {
    const email = "mila.manager@wonderland.local";
    const password = "Password123!";

    await deleteUserByEmail(request, email);

    await page.goto("/register");

    await page.getByTestId("register-account-type-manager").check();
    await expect(page.getByTestId("register-account-type-help")).toContainText("pre-approved active employee email");

    await page.getByTestId("register-first-name-input").fill("Mila");
    await page.getByTestId("register-last-name-input").fill("Manager");
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-date-of-birth-input").fill("1990-09-20");
    await page.getByTestId("register-password-input").fill(password);
    await page.getByTestId("register-submit-button").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByTestId("dashboard-user-email")).toContainText(email);
    await expect(page.getByTestId("dashboard-user-role")).toContainText("Manager");
  });

  test("admin registration fails for random non-employee email", async ({ page }) => {
    await page.goto("/register");

    await page.getByTestId("register-account-type-admin").check();
    await page.getByTestId("register-first-name-input").fill("Random");
    await page.getByTestId("register-last-name-input").fill("Admin");
    await page.getByTestId("register-email-input").fill(`random.admin.${Date.now()}@wonderland.local`);
    await page.getByTestId("register-date-of-birth-input").fill("1988-04-12");
    await page.getByTestId("register-password-input").fill("Password123!");
    await page.getByTestId("register-submit-button").click();

    await expect(page.getByTestId("register-error")).toBeVisible();
    await expect(page.getByTestId("register-error")).toContainText("Admin registration requires");
  });

  test("admin registration fails when DOB does not match employee record", async ({ page, request }) => {
    const email = "ava.admin@wonderland.local";

    await deleteUserByEmail(request, email);

    await page.goto("/register");

    await page.getByTestId("register-account-type-admin").check();
    await page.getByTestId("register-first-name-input").fill("Ava");
    await page.getByTestId("register-last-name-input").fill("Admin");
    await page.getByTestId("register-email-input").fill(email);
    await page.getByTestId("register-date-of-birth-input").fill("1999-01-01");
    await page.getByTestId("register-password-input").fill("Password123!");
    await page.getByTestId("register-submit-button").click();

    await expect(page.getByTestId("register-error")).toBeVisible();
    await expect(page.getByTestId("register-error")).toContainText("Date of birth does not match employee records");
  });
});
