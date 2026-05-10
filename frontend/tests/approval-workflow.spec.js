import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:5010/api';

async function deleteUserByEmail(request, email) {
  await request.delete(`${API_BASE_URL}/test-support/users/by-email?email=${encodeURIComponent(email)}`);
}

async function deleteContentByName(request, type, name) {
  await request.delete(`${API_BASE_URL}/test-support/content/by-name?type=${type}&name=${encodeURIComponent(name)}`);
}

async function registerEmployee(page, accountType, email, dob) {
  await page.goto('/register');

  await page.getByTestId(`register-account-type-${accountType.toLowerCase()}`).check();
  await page.getByTestId('register-first-name-input').fill('Workflow');
  await page.getByTestId('register-last-name-input').fill(accountType);
  await page.getByTestId('register-email-input').fill(email);
  await page.getByTestId('register-date-of-birth-input').fill(dob);
  await page.getByTestId('register-password-input').fill('Password123!');
  await page.getByTestId('register-submit-button').click();

  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe('Wonderland admin submission and manager approval workflow', () => {
  test.describe.configure({ mode: 'serial' });

  test('admin submits a ride and manager approves it for public visibility', async ({ page, request }) => {
    const uniqueId = Date.now();
    const rideName = `Approval Test Coaster ${uniqueId}`;

    const adminEmail = 'workflow.admin@wonderland.local';
    const managerEmail = 'workflow.manager@wonderland.local';

    await deleteUserByEmail(request, adminEmail);
    await deleteUserByEmail(request, managerEmail);
    await deleteContentByName(request, 'ride', rideName);

    await registerEmployee(page, 'Admin', adminEmail, '1986-03-03');

    await expect(page.getByTestId('nav-admin-content')).toBeVisible();
    await page.getByTestId('nav-admin-content').click();

    await expect(page).toHaveURL(/\/admin\/content$/);
    await expect(page.getByTestId('admin-content-page')).toBeVisible();

    await page.getByTestId('admin-ride-name').fill(rideName);
    await page.getByTestId('admin-ride-description').fill('A Playwright-created ride waiting for manager approval.');
    await page.getByTestId('admin-ride-category').fill('Automation Ride');
    await page.getByTestId('admin-ride-thrill').fill('Medium');
    await page.getByTestId('admin-ride-height').fill('110');
    await page.getByTestId('admin-ride-age').fill('7');
    await page.getByTestId('admin-ride-price').fill('19');
    await page.getByTestId('admin-ride-points').fill('45');
    await page.getByTestId('admin-ride-submit').click();

    await expect(page.getByTestId('admin-content-success')).toContainText('Ride submitted for manager approval');
    await expect(page.getByTestId('admin-submissions-list')).toContainText(rideName);
    await expect(page.getByTestId('admin-submissions-list')).toContainText('PendingApproval');

    await page.goto('/rides');
    await page.getByTestId('rides-search-input').fill(rideName);
    await expect(page.getByTestId('rides-empty-state')).toBeVisible();

    await page.getByTestId('nav-logout').click();
    await expect(page).toHaveURL(/\/login$/);

    await registerEmployee(page, 'Manager', managerEmail, '1989-08-08');

    await expect(page.getByTestId('nav-manager-approvals')).toBeVisible();
    await expect(page.getByTestId('nav-manager-pending-count')).toBeVisible();

    await page.getByTestId('nav-manager-approvals').click();

    await expect(page).toHaveURL(/\/manager\/approvals$/);
    await expect(page.getByTestId('manager-approvals-page')).toBeVisible();
    await expect(page.getByText(rideName)).toBeVisible();

    const approvalCard = page.locator('article').filter({ hasText: rideName });
    await approvalCard.getByRole('button', { name: 'Approve' }).click();

    await expect(page.getByTestId('manager-approval-message')).toContainText('approved successfully');
    await expect(page.getByTestId('manager-approval-history-list')).toContainText(rideName);
    await expect(page.getByTestId('manager-approval-history-list')).toContainText('Approved');

    await page.goto('/rides');
    await page.getByTestId('rides-search-input').fill(rideName);

    await expect(page.getByText(rideName)).toBeVisible();

    await deleteContentByName(request, 'ride', rideName);
  });

  test('normal user cannot access Admin or Manager workflow pages', async ({ page, request }) => {
    const email = `workflow.normal.${Date.now()}@wonderland.local`;

    const registerResponse = await request.post(`${API_BASE_URL}/auth/register`, {
      data: {
        accountType: 'Guest',
        firstName: 'Workflow',
        lastName: 'Normal',
        email,
        dateOfBirth: '1992-04-12',
        password: 'Password123!',
      },
    });

    const authResult = await registerResponse.json().catch(async () => ({
      rawBody: await registerResponse.text().catch(() => 'Unable to read response body'),
    }));

    expect(
      registerResponse.ok(),
      `Normal user registration failed with status ${registerResponse.status()}: ${JSON.stringify(authResult)}`,
    ).toBeTruthy();

    await page.addInitScript((token) => {
      window.localStorage.setItem('wonderland_token', token);
    }, authResult.token);

    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await expect(page.getByTestId('dashboard-user-role')).toContainText('User');

    await page.goto('/admin/content');
    await expect(page.getByTestId('access-denied-page')).toBeVisible();

    await page.goto('/manager/approvals');
    await expect(page.getByTestId('access-denied-page')).toBeVisible();
  });
});
