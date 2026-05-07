import { test, expect } from '@playwright/test';

async function clearBasket(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('wonderland_basket');
  });
}

test.describe('Wonderland listing card basket actions', () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test('user can add a ride to basket directly from the rides listing', async ({ page }) => {
    await page.goto('/rides');

    await expect(page.getByTestId('rides-page')).toBeVisible();
    await expect(page.getByTestId('ride-card-1')).toContainText('Dragon Rush Coaster');

    await page.getByTestId('ride-card-add-to-basket-1').click();

    await expect(page.getByTestId('ride-card-basket-message-1')).toContainText('Dragon Rush Coaster added to basket');
    await expect(page.getByTestId('nav-basket-count')).toContainText('1');

    await page.getByTestId('nav-basket').click();

    await expect(page).toHaveURL(/\/basket$/);
    await expect(page.getByTestId('basket-item-ride-1')).toContainText('Dragon Rush Coaster');
    await expect(page.getByTestId('basket-summary-total')).toContainText('$45.00');
  });

  test('user can add accommodation to basket directly from the stays listing', async ({ page }) => {
    await page.goto('/accommodations');

    await expect(page.getByTestId('accommodations-page')).toBeVisible();
    await expect(page.getByTestId('accommodation-card-1')).toContainText('Castle View Hotel');

    await page.getByTestId('accommodation-card-add-to-basket-1').click();

    await expect(page.getByTestId('accommodation-card-basket-message-1')).toContainText(
      'Castle View Hotel added to basket',
    );
    await expect(page.getByTestId('nav-basket-count')).toContainText('1');

    await page.getByTestId('nav-basket').click();

    await expect(page).toHaveURL(/\/basket$/);
    await expect(page.getByTestId('basket-item-accommodation-1')).toContainText('Castle View Hotel');

    // Castle View Hotel base price is $320.
    // 1 guest = 320 + 50% surcharge = $480.
    await expect(page.getByTestId('basket-summary-total')).toContainText('$480.00');
  });

  test('ride listing card still supports view details after add-to-basket button was added', async ({ page }) => {
    await page.goto('/rides');

    await expect(page.getByTestId('rides-page')).toBeVisible();
    await expect(page.getByTestId('ride-card-1')).toContainText('Dragon Rush Coaster');

    await page.getByTestId('ride-details-link-1').click();

    await expect(page).toHaveURL(/\/rides\/1$/);
    await expect(page.getByTestId('ride-details-page')).toBeVisible();
    await expect(page.getByTestId('ride-details-title')).toContainText('Dragon Rush Coaster');
  });

  test('accommodation listing card still supports view details after add-to-basket button was added', async ({
    page,
  }) => {
    await page.goto('/accommodations');

    await expect(page.getByTestId('accommodations-page')).toBeVisible();
    await expect(page.getByTestId('accommodation-card-1')).toContainText('Castle View Hotel');

    await page.getByTestId('accommodation-details-link-1').click();

    await expect(page).toHaveURL(/\/accommodations\/1$/);
    await expect(page.getByTestId('accommodation-details-page')).toBeVisible();
    await expect(page.getByTestId('accommodation-details-title')).toContainText('Castle View Hotel');
  });
});
