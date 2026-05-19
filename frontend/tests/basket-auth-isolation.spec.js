import { test, expect } from "@playwright/test";

const API_BASE_URL = "http://localhost:5010/api";
const STORAGE_SETUP_URL = "/src/main.jsx";

async function deleteUserByEmail(request, email) {
  await request.delete(
    `${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`
  );
}

async function registerGuestUser(request, email, dob) {
  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: "Guest",
      firstName: "Basket",
      lastName: "Guest",
      email,
      dateOfBirth: dob,
      password: "Password123!",
    },
  });

  const authResult = await registerResponse.json();

  expect(
    registerResponse.ok(),
    `Guest registration failed for ${email}: ${JSON.stringify(authResult)}`
  ).toBeTruthy();

  return authResult;
}

async function clearBrowserSession(page) {
  await page.goto(STORAGE_SETUP_URL, { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    window.localStorage.removeItem("wonderland_token");
    window.localStorage.removeItem("wonderland_basket");
  });
}

async function setAuthTokenWithoutClearingBasket(page, token) {
  await page.goto(STORAGE_SETUP_URL, { waitUntil: "domcontentloaded" });

  await page.evaluate((userToken) => {
    window.localStorage.removeItem("wonderland_token");
    window.localStorage.setItem("wonderland_token", userToken);
  }, token);

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("dashboard-page")).toBeVisible({
    timeout: 10000,
  });
}

test.describe("Basket auth isolation", () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserSession(page);
  });

  test("basket is cleared when switching from one user to another user", async ({
    page,
    request,
  }) => {
    const unique = `${Date.now()}.${Math.floor(Math.random() * 10000)}`;
    const firstUserEmail = `basket.first.${unique}@wonderland.local`;
    const secondUserEmail = `basket.second.${unique}@wonderland.local`;

    const firstUserAuth = await registerGuestUser(
      request,
      firstUserEmail,
      "1990-05-05"
    );

    await setAuthTokenWithoutClearingBasket(page, firstUserAuth.token);

    await page.goto("/rides/1", { waitUntil: "domcontentloaded" });
    await page.getByTestId("ride-details-add-to-basket").click();

    await page.getByTestId("nav-basket").click();
    await expect(page.getByText("Your Wonderland basket")).toBeVisible();
    await expect(page.getByTestId("basket-checkout-link")).toBeVisible();

    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);

    const secondUserAuth = await registerGuestUser(
      request,
      secondUserEmail,
      "1992-04-12"
    );

    await setAuthTokenWithoutClearingBasket(page, secondUserAuth.token);

    await page.goto("/basket", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Your basket is empty")).toBeVisible();
    await expect(page.getByTestId("basket-checkout-link")).not.toBeVisible();
  });
});