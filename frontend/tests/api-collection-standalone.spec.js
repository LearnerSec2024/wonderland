import fs from "node:fs";
import path from "node:path";
import { test, expect, request as playwrightRequest } from "@playwright/test";

const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:5010";
const repoRoot = path.resolve(process.cwd(), "..");
const collectionPath = path.join(repoRoot, "postman", "wonderland-api.postman_collection.json");

const testUserEmail = `api.collection.${Date.now()}@example.com`;
const testUserPassword = "Password123!";
let userToken;

function flattenItems(items, output = []) {
  for (const item of items || []) {
    if (item.request) {
      output.push(item);
    }

    if (item.item) {
      flattenItems(item.item, output);
    }
  }

  return output;
}

function collectionRouteKeys() {
  const raw = fs.readFileSync(collectionPath, "utf8");
  const collection = JSON.parse(raw);
  const requests = flattenItems(collection.item);

  return requests.map((item) => {
    const method = item.request.method;
    const routePath = item.request.url.raw.replace("{{baseUrl}}", "");
    return `${method} ${routePath}`;
  });
}

async function cleanupTestUser() {
  const context = await playwrightRequest.newContext({ baseURL: apiBaseUrl });

  try {
    await context.delete(
      `/api/test-support/users/by-email?email=${encodeURIComponent(testUserEmail)}`
    );
  } catch {
    // Test-support routes may be disabled outside local/CI test mode.
  } finally {
    await context.dispose();
  }
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await cleanupTestUser();

  const context = await playwrightRequest.newContext({ baseURL: apiBaseUrl });

  const registerResponse = await context.post("/api/auth/register", {
    data: {
      accountType: "Guest",
      firstName: "Api",
      lastName: "Collection",
      email: testUserEmail,
      dateOfBirth: "1990-01-01",
      password: testUserPassword,
    },
  });

  expect(registerResponse.status()).toBe(201);

  const registerBody = await registerResponse.json();
  expect(registerBody.token).toBeTruthy();

  userToken = registerBody.token;

  await context.dispose();
});

test.afterAll(async () => {
  await cleanupTestUser();
});

test("generated Postman collection contains end-of-Iteration-16 API routes", async () => {
  expect(fs.existsSync(collectionPath)).toBeTruthy();

  const routes = collectionRouteKeys();

  expect(routes).not.toContain("GET /path");
  expect(routes).not.toContain("POST /path");

  const expectedRoutes = [
    "GET /api/health",
    "GET /api/test-db",
    "GET /api/rides",
    "GET /api/rides/{{rideId}}",
    "GET /api/accommodations",
    "GET /api/accommodations/{{accommodationId}}",

    "POST /api/auth/register",
    "POST /api/auth/login",
    "GET /api/auth/me",
    "GET /api/profile/me",

    "POST /api/bookings/checkout",
    "GET /api/bookings/my",
    "GET /api/bookings/{{bookingReference}}",
    "POST /api/bookings/{{bookingReference}}/cancel",

    "GET /api/admin/submissions",
    "POST /api/admin/rides",
    "POST /api/admin/accommodations",
    "GET /api/admin/bookings",
    "GET /api/admin/bookings/summary",
    "GET /api/admin/bookings/{{bookingReference}}",
    "GET /api/admin/reports/bookings",
    "GET /api/admin/reports/bookings/export.csv",
    "GET /api/admin/audit-events",
    "GET /api/admin/security-events",

    "GET /api/manager/approvals",
    "GET /api/manager/approvals/count",
    "GET /api/manager/approvals/history",
    "POST /api/manager/approvals/{{type}}/{{id}}/approve",
    "POST /api/manager/approvals/{{type}}/{{id}}/reject",
    "GET /api/manager/bookings/activity",
    "GET /api/manager/bookings/{{bookingReference}}",
    "GET /api/manager/reports/bookings",

    "POST /api/security-events/access-denied",

    "DELETE /api/test-support/users/by-email",
    "DELETE /api/test-support/content/by-name",
  ];

  for (const expectedRoute of expectedRoutes) {
    expect(routes, `Missing route in generated collection: ${expectedRoute}`).toContain(expectedRoute);
  }
});

test("public APIs work directly without browser UI", async ({ request }) => {
  const healthResponse = await request.get(`${apiBaseUrl}/api/health`);
  expect(healthResponse.ok()).toBeTruthy();

  const dbResponse = await request.get(`${apiBaseUrl}/api/test-db`);
  expect(dbResponse.ok()).toBeTruthy();

  const ridesResponse = await request.get(`${apiBaseUrl}/api/rides`);
  expect(ridesResponse.ok()).toBeTruthy();

  const rides = await ridesResponse.json();
  expect(Array.isArray(rides)).toBeTruthy();

  if (rides.length > 0) {
    const rideDetailResponse = await request.get(
      `${apiBaseUrl}/api/rides/${rides[0].RideId}`
    );
    expect(rideDetailResponse.ok()).toBeTruthy();
  }

  const accommodationsResponse = await request.get(`${apiBaseUrl}/api/accommodations`);
  expect(accommodationsResponse.ok()).toBeTruthy();

  const accommodations = await accommodationsResponse.json();
  expect(Array.isArray(accommodations)).toBeTruthy();

  if (accommodations.length > 0) {
    const accommodationDetailResponse = await request.get(
      `${apiBaseUrl}/api/accommodations/${accommodations[0].AccommodationId}`
    );
    expect(accommodationDetailResponse.ok()).toBeTruthy();
  }
});

test("auth APIs work directly and return a usable bearer token", async ({ request }) => {
  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: {
      email: testUserEmail,
      password: testUserPassword,
    },
  });

  expect(loginResponse.ok()).toBeTruthy();

  const loginBody = await loginResponse.json();
  expect(loginBody.token).toBeTruthy();

  const authHeaders = {
    Authorization: `Bearer ${loginBody.token}`,
  };

  const meResponse = await request.get(`${apiBaseUrl}/api/auth/me`, {
    headers: authHeaders,
  });
  expect(meResponse.ok()).toBeTruthy();

  const profileResponse = await request.get(`${apiBaseUrl}/api/profile/me`, {
    headers: authHeaders,
  });
  expect(profileResponse.ok()).toBeTruthy();
});

test("protected APIs reject unauthenticated standalone calls", async ({ request }) => {
  const protectedChecks = [
    ["GET", "/api/bookings/my"],
    ["POST", "/api/bookings/checkout"],
    ["GET", "/api/admin/bookings"],
    ["GET", "/api/admin/reports/bookings"],
    ["GET", "/api/admin/audit-events"],
    ["GET", "/api/admin/security-events"],
    ["GET", "/api/manager/approvals"],
    ["GET", "/api/manager/bookings/activity"],
    ["GET", "/api/manager/reports/bookings"],
    ["POST", "/api/security-events/access-denied"],
  ];

  for (const [method, route] of protectedChecks) {
    const response = await request.fetch(`${apiBaseUrl}${route}`, {
      method,
      data: method === "POST" ? {} : undefined,
    });

    expect(
      [401, 403].includes(response.status()),
      `${method} ${route} should reject unauthenticated access`
    ).toBeTruthy();
  }
});

test("normal User token cannot access Admin or Manager standalone APIs", async ({ request }) => {
  const userHeaders = {
    Authorization: `Bearer ${userToken}`,
  };

  const restrictedChecks = [
    ["GET", "/api/admin/bookings"],
    ["GET", "/api/admin/reports/bookings"],
    ["GET", "/api/admin/audit-events"],
    ["GET", "/api/admin/security-events"],
    ["GET", "/api/manager/approvals"],
    ["GET", "/api/manager/bookings/activity"],
    ["GET", "/api/manager/reports/bookings"],
  ];

  for (const [method, route] of restrictedChecks) {
    const response = await request.fetch(`${apiBaseUrl}${route}`, {
      method,
      headers: userHeaders,
    });

    expect(response.status(), `${method} ${route} should return 403 for normal User`).toBe(403);
  }
});
