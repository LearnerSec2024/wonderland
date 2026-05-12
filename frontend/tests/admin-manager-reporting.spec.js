import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

const API_BASE_URL = 'http://localhost:5010/api';

async function clearBasket(page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('wonderland_basket');
    localStorage.removeItem('wonderland_token');
  });
}

async function setAuthToken(page, token) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.evaluate((userToken) => {
    window.localStorage.removeItem('wonderland_token');
    window.localStorage.setItem('wonderland_token', userToken);
  }, token);

  await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('dashboard-page')).toBeVisible({
    timeout: 10000,
  });
}

async function deleteUserByEmail(request, email) {
  await request.delete(`${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`);
}

function makeFutureVisitDate(offsetDays = 0) {
  const baseOffset = Math.abs(Date.now() % 3000);
  const date = new Date(Date.UTC(2034, 0, 1 + baseOffset + offsetDays));
  return date.toISOString().slice(0, 10);
}

async function createGuestBooking(page, request, options = {}) {
  const { shouldCancel = false, visitDate = makeFutureVisitDate() } = options;
  const email = `reporting.user.${Date.now()}.${Math.floor(Math.random() * 10000)}@wonderland.local`;

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType: 'Guest',
      firstName: 'Reporting',
      lastName: 'Customer',
      email,
      dateOfBirth: '1992-04-12',
      password: 'Password123!',
    },
  });

  const authResult = await registerResponse.json();

  expect(registerResponse.ok(), `Guest registration failed: ${JSON.stringify(authResult)}`).toBeTruthy();

  await setAuthToken(page, authResult.token);

  await page.goto('/rides/1');
  await page.getByTestId('ride-details-add-to-basket').click();
  await page.getByTestId('nav-basket').click();
  await page.getByTestId('basket-checkout-link').click();
  await page.getByTestId('checkout-visit-date').fill(visitDate);
  await page.getByTestId('checkout-notes').fill('Reporting dashboard Playwright test');
  await page.getByTestId('checkout-submit-button').click();

  await expect(page.getByTestId('booking-confirmation-page')).toBeVisible();

  const bookingReference = (await page.getByTestId('booking-reference').innerText()).trim();

  if (shouldCancel) {
    const cancelResponse = await request.post(`${API_BASE_URL}/bookings/${bookingReference}/cancel`, {
      headers: {
        Authorization: `Bearer ${authResult.token}`,
      },
      data: {
        cancellationReason: 'Reporting test cancellation',
      },
    });

    expect(cancelResponse.ok()).toBeTruthy();
  }

  await page.evaluate(() => {
    localStorage.removeItem('wonderland_token');
    localStorage.removeItem('wonderland_basket');
  });

  return {
    bookingReference,
    customerEmail: email,
    visitDate,
  };
}

async function registerRoleUser(page, request, accountType, email, dob) {
  await deleteUserByEmail(request, email);

  const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
    data: {
      accountType,
      firstName: 'Reporting',
      lastName: accountType,
      email,
      dateOfBirth: dob,
      password: 'Password123!',
    },
  });

  const authResult = await registerResponse.json();

  expect(
    registerResponse.ok(),
    `${accountType} registration failed for ${email}: ${JSON.stringify(authResult)}`,
  ).toBeTruthy();

  await setAuthToken(page, authResult.token);

  await page.goto('/dashboard');
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
  await expect(page.getByTestId('nav-user-greeting')).toContainText('Reporting');

  return authResult;
}

test.describe('Wonderland Admin and Manager reporting', () => {
  test.beforeEach(async ({ page }) => {
    await clearBasket(page);
  });

  test('Admin can view booking reporting dashboard, apply filters and export CSV', async ({ page, request }) => {
    const visitDate = makeFutureVisitDate(0);
    const { bookingReference } = await createGuestBooking(page, request, {
      shouldCancel: true,
      visitDate,
    });

    await registerRoleUser(page, request, 'Admin', 'reporting.admin@wonderland.local', '1985-05-05');

    await expect(page.getByTestId('nav-admin-reports')).toBeVisible();
    await page.getByTestId('nav-admin-reports').click();

    await expect(page).toHaveURL(/\/admin\/reports$/);
    await expect(page.getByTestId('admin-reports-page')).toBeVisible();
    await expect(page.getByTestId('admin-report-summary')).toBeVisible();
    await expect(page.getByTestId('admin-report-total-bookings')).toHaveText(/^[1-9]\d*$/);
    await expect(page.getByTestId('admin-report-status-breakdown')).toContainText('Cancelled');
    await expect(page.getByTestId('admin-report-item-type-breakdown')).toContainText('ride');
    await expect(page.getByTestId('admin-report-cdc-status')).toContainText('Bookings table CDC enabled');
    await expect(page.getByTestId('admin-report-booking-cdc-events')).toBeVisible();

    await page.getByTestId('admin-report-start-date').fill(visitDate);
    await page.getByTestId('admin-report-end-date').fill(visitDate);
    await page.getByTestId('admin-report-status-filter').selectOption('Cancelled');
    await page.getByTestId('admin-report-apply-filters').click();

    await expect(page.getByTestId('admin-report-active-filters')).toContainText(visitDate);
    await expect(page.getByTestId('admin-report-active-filters')).toContainText('Cancelled');
    await expect(page.getByTestId('admin-report-status-breakdown')).toContainText('Cancelled');
    await expect(page.getByTestId('admin-report-total-bookings')).toHaveText(/^[1-9]\d*$/);

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('admin-report-download-csv').click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^wonderland-booking-report-\d{4}-\d{2}-\d{2}\.csv$/);

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    const csvContent = await fs.readFile(downloadPath, 'utf8');

    expect(csvContent).toContain('BookingReference');
    expect(csvContent).toContain('Status');
    expect(csvContent).toContain(bookingReference);
    expect(csvContent).toContain('Cancelled');
  });

  test('Manager can view operational booking report and apply filters', async ({ page, request }) => {
    const visitDate = makeFutureVisitDate(50);

    await createGuestBooking(page, request, {
      shouldCancel: false,
      visitDate,
    });

    await registerRoleUser(page, request, 'Manager', 'reporting.manager@wonderland.local', '1988-08-08');

    await expect(page.getByTestId('nav-manager-reports')).toBeVisible();
    await page.getByTestId('nav-manager-reports').click();

    await expect(page).toHaveURL(/\/manager\/reports$/);
    await expect(page.getByTestId('manager-reports-page')).toBeVisible();
    await expect(page.getByTestId('manager-report-summary')).toBeVisible();
    await expect(page.getByTestId('manager-report-total-bookings')).toHaveText(/^[1-9]\d*$/);
    await expect(page.getByTestId('manager-report-status-breakdown')).toContainText('Confirmed');
    await expect(page.getByTestId('manager-report-cdc-status')).toContainText('Bookings table CDC enabled');
    await expect(page.getByTestId('manager-report-booking-cdc-events')).toBeVisible();

    await page.getByTestId('manager-report-start-date').fill(visitDate);
    await page.getByTestId('manager-report-end-date').fill(visitDate);
    await page.getByTestId('manager-report-status-filter').selectOption('Confirmed');
    await page.getByTestId('manager-report-apply-filters').click();

    await expect(page.getByTestId('manager-report-active-filters')).toContainText(visitDate);
    await expect(page.getByTestId('manager-report-active-filters')).toContainText('Confirmed');
    await expect(page.getByTestId('manager-report-status-breakdown')).toContainText('Confirmed');
    await expect(page.getByTestId('manager-report-total-bookings')).toHaveText(/^[1-9]\d*$/);
  });

  test('normal User cannot access Admin or Manager reporting pages', async ({ page, request }) => {
    const email = `reporting.normal.${Date.now()}@wonderland.local`;

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        accountType: 'Guest',
        firstName: 'Reporting',
        lastName: 'Normal',
        email,
        dateOfBirth: '1993-09-10',
        password: 'Password123!',
      },
    });

    const authResult = await registerResponse.json();

    expect(registerResponse.ok(), `Guest registration failed: ${JSON.stringify(authResult)}`).toBeTruthy();

    await setAuthToken(page, authResult.token);

    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('dashboard-user-role')).toContainText('User');

    await page.goto('/admin/reports');
    await expect(page).toHaveURL(/\/admin\/reports$/);
    await expect(page.getByTestId('access-denied-page')).toBeVisible();

    await page.goto('/manager/reports');
    await expect(page).toHaveURL(/\/manager\/reports$/);
    await expect(page.getByTestId('access-denied-page')).toBeVisible();
  });
});
