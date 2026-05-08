import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:5010/api';

async function clearBasket(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('wonderland_basket');
  });
}

async function deleteUserByEmail(request, email) {
  await request.delete(`${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`);
}

async function createGuestBooking(page, request) {
  const email = `visibility.user.${Date.now()}@wonderland.local`;

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: 'Guest',
      firstName: 'Visibility',
      lastName: 'Customer',
      email,
      dateOfBirth: '1992-04-12',
      password: 'Password123!',
    },
  });

  expect(registerResponse.ok()).toBeTruthy();

  const authResult = await registerResponse.json();

  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('wonderland_token', token);
  }, authResult.token);

  await page.goto('/rides/1');
  await page.getByTestId('ride-details-add-to-basket').click();

  await page.getByTestId('nav-basket').click();
  await page.getByTestId('basket-checkout-link').click();

  await page.getByTestId('checkout-visit-date').fill('2026-12-28');
  await page.getByTestId('checkout-notes').fill('Admin and manager visibility test');
  await page.getByTestId('checkout-submit-button').click();

  await expect(page.getByTestId('booking-confirmation-page')).toBeVisible();

  const bookingReference = (await page.getByTestId('booking-reference').innerText()).trim();

  await page.evaluate(() => {
    localStorage.removeItem('wonderland_token');
    localStorage.removeItem('wonderland_basket');
  });

  return {
    bookingReference,
    customerEmail: email,
  };
}

async function registerEmployeeThroughUi(page, request, accountType, email, dob) {
  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType,
      firstName: 'Visibility',
      lastName: accountType,
      email,
      dateOfBirth: dob,
      password: 'Password123!',
    },
  });

  const authResult = await registerResponse.json().catch(() => ({}));

  expect(
    registerResponse.ok(),
    `Employee registration failed for ${email}: ${JSON.stringify(authResult)}`,
  ).toBeTruthy();

  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('wonderland_token', token);
  }, authResult.token);

  await page.goto('/dashboard');

  await expect(page.getByTestId('dashboard-page')).toBeVisible();
  await expect(page.getByTestId('nav-user-greeting')).toContainText('Visibility');
}
test.describe('Wonderland Admin and Manager booking visibility', () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test('Admin can view all bookings, search by customer email and open booking details', async ({ page, request }) => {
    const { bookingReference, customerEmail } = await createGuestBooking(page, request);

    const adminEmail = 'visibility.admin@wonderland.local';
    await registerEmployeeThroughUi(page, request, 'Admin', adminEmail, '1986-03-03');

    await expect(page.getByTestId('nav-admin-bookings')).toBeVisible();
    await page.getByTestId('nav-admin-bookings').click();

    await expect(page).toHaveURL(/\/admin\/bookings$/);
    await expect(page.getByTestId('admin-bookings-page')).toBeVisible();
    await expect(page.getByTestId('admin-bookings-summary')).toBeVisible();
    await expect(page.getByTestId('admin-bookings-list')).toContainText(bookingReference);

    await page.getByTestId('admin-bookings-search-input').fill(customerEmail);

    await expect(page.getByTestId('admin-bookings-filter-count')).toContainText(/Showing \d+ of \d+ bookings/);
    await expect(page.getByTestId('admin-bookings-list')).toContainText(bookingReference);
    await expect(page.getByTestId('admin-bookings-list')).toContainText(customerEmail);

    await page.getByTestId('admin-bookings-status-filter').selectOption('Confirmed');

    await expect(page.getByTestId('admin-bookings-list')).toContainText(bookingReference);

    await page.getByTestId(`admin-booking-view-${bookingReference}`).click();

    await expect(page).toHaveURL(new RegExp(`/booking-confirmation/${bookingReference}$`));
    await expect(page.getByTestId('booking-confirmation-page')).toBeVisible();
    await expect(page.getByTestId('booking-reference')).toContainText(bookingReference);
    await expect(page.getByTestId('booking-customer-details')).toContainText(customerEmail);
    await expect(page.getByTestId('booking-confirmation-items')).toContainText('Dragon Rush Coaster');
  });

  test('Manager can view booking activity summary and open booking details', async ({ page, request }) => {
    const { bookingReference, customerEmail } = await createGuestBooking(page, request);

    const managerEmail = 'visibility.manager@wonderland.local';
    await registerEmployeeThroughUi(page, request, 'Manager', managerEmail, '1989-08-08');

    await expect(page.getByTestId('nav-manager-bookings')).toBeVisible();
    await page.getByTestId('nav-manager-bookings').click();

    await expect(page).toHaveURL(/\/manager\/bookings$/);
    await expect(page.getByTestId('manager-booking-activity-page')).toBeVisible();
    await expect(page.getByTestId('manager-booking-summary')).toBeVisible();
    await expect(page.getByTestId('manager-booking-activity-list')).toContainText(bookingReference);
    await expect(page.getByTestId('manager-booking-activity-list')).toContainText(customerEmail);

    await page.getByTestId(`manager-booking-view-${bookingReference}`).click();

    await expect(page).toHaveURL(new RegExp(`/booking-confirmation/${bookingReference}$`));
    await expect(page.getByTestId('booking-confirmation-page')).toBeVisible();
    await expect(page.getByTestId('booking-reference')).toContainText(bookingReference);
    await expect(page.getByTestId('booking-customer-details')).toContainText(customerEmail);
    await expect(page.getByTestId('booking-confirmation-items')).toContainText('Dragon Rush Coaster');
  });

  test('normal User cannot access Admin or Manager booking visibility pages', async ({ page, request }) => {
    const email = `visibility.normal.${Date.now()}@wonderland.local`;

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        accountType: 'Guest',
        firstName: 'Normal',
        lastName: 'User',
        email,
        dateOfBirth: '1993-09-10',
        password: 'Password123!',
      },
    });

    const authResult = await registerResponse.json();

    expect(registerResponse.ok(), `Guest registration failed: ${JSON.stringify(authResult)}`).toBeTruthy();

    await page.addInitScript((token) => {
      localStorage.setItem('wonderland_token', token);
    }, authResult.token);

    await page.goto('/dashboard');

    // Prove the test precondition first: this is definitely a logged-in normal User.
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('dashboard-user-role')).toContainText('User');
    await expect(page.getByTestId('nav-user-greeting')).toContainText('Normal');

    await page.goto('/admin/bookings');

    await expect(page).toHaveURL(/\/admin\/bookings$/);
    await expect(page.getByTestId('access-denied-page')).toBeVisible({ timeout: 10000 });

    await page.goto('/manager/bookings');

    await expect(page).toHaveURL(/\/manager\/bookings$/);
    await expect(page.getByTestId('access-denied-page')).toBeVisible({ timeout: 10000 });
  });
});
