const fs = require("fs");
const path = require("path");

const PROJECT_NAME = "Wonderland API";
const BACKEND_ROOT = path.resolve(__dirname, "..");
const SERVER_FILE = path.join(BACKEND_ROOT, "server.js");
const ROUTES_DIR = path.join(BACKEND_ROOT, "routes");
const OUTPUT_DIR = path.join(BACKEND_ROOT, "..", "postman");
const DEFAULT_BASE_URL =
  process.env.POSTMAN_BASE_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:5010";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function cleanPath(value) {
  if (!value) return "";
  return value.replace(/[`'"]/g, "").replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function joinPaths(base, child) {
  const left = cleanPath(base);
  const right = cleanPath(child);

  if (left === "/" && right === "/") return "/";
  if (left === "/") return right;
  if (right === "/") return left;

  return cleanPath(`${left}/${right}`);
}

function toPostmanPath(expressPath) {
  return expressPath.replace(/:([A-Za-z0-9_]+)/g, "{{$1}}");
}

function getRouteFiles() {
  const files = [SERVER_FILE];

  if (fs.existsSync(ROUTES_DIR)) {
    for (const entry of fs.readdirSync(ROUTES_DIR)) {
      if (entry.endsWith(".js") || entry.endsWith(".mjs") || entry.endsWith(".cjs")) {
        files.push(path.join(ROUTES_DIR, entry));
      }
    }
  }

  return files;
}

function extractImports(content, filePath) {
  const imports = {};
  const requireRegex =
    /(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*require\(["'](.+?)["']\)/g;

  let match;

  while ((match = requireRegex.exec(content)) !== null) {
    const variableName = match[1];
    const importPath = match[2];

    if (!importPath.startsWith(".")) continue;

    const resolved = path.resolve(path.dirname(filePath), importPath);
    const candidates = [
      resolved,
      `${resolved}.js`,
      `${resolved}.mjs`,
      `${resolved}.cjs`,
      path.join(resolved, "index.js"),
    ];

    const found = candidates.find((candidate) => fs.existsSync(candidate));

    if (found) {
      imports[variableName] = found;
    }
  }

  return imports;
}

function findRouteMounts(serverContent) {
  const mounts = new Map();
  const imports = extractImports(serverContent, SERVER_FILE);
  const appUseRegex = /app\.use\(\s*["'`]([^"'`]+)["'`]\s*,\s*([A-Za-z0-9_]+)/g;

  let match;

  while ((match = appUseRegex.exec(serverContent)) !== null) {
    const basePath = cleanPath(match[1]);
    const routeVariable = match[2];
    const routeFile = imports[routeVariable];

    if (routeFile) {
      mounts.set(routeFile, basePath);
    }
  }

  return mounts;
}

function detectAuthHint(routeLine, fileContent) {
  const combined = `${routeLine || ""}\n${fileContent || ""}`.toLowerCase();

  return (
    combined.includes("requireauth") ||
    combined.includes("requireauth") ||
    combined.includes("requirerole") ||
    combined.includes("protect") ||
    combined.includes("verifytoken") ||
    combined.includes("authmiddleware")
  );
}

function extractDirectRoutes(content, basePath, sourceFile) {
  const routes = [];

  for (const method of HTTP_METHODS) {
    const routerRegex = new RegExp(
      `router\\.${method}\\(\\s*["'\`]([^"'\`]+)["'\`]([\\s\\S]*?)\\);?`,
      "g"
    );

    const appRegex = new RegExp(
      `app\\.${method}\\(\\s*["'\`]([^"'\`]+)["'\`]([\\s\\S]*?)\\);?`,
      "g"
    );

    for (const regex of [routerRegex, appRegex]) {
      let match;

      while ((match = regex.exec(content)) !== null) {
        const routePath = cleanPath(match[1]);
        const restOfLine = match[2] || "";
        const isAppRoute = regex === appRegex;
        const fullPath = isAppRoute ? routePath : joinPaths(basePath, routePath);

        routes.push({
          method: method.toUpperCase(),
          path: fullPath,
          authRequired: detectAuthHint(restOfLine, isAppRoute ? "" : content),
          sourceFile,
        });
      }
    }
  }

  return routes;
}

function extractChainedRoutes(content, basePath, sourceFile) {
  const routes = [];
  const chainedRegex =
    /router\.route\(\s*["'`]([^"'`]+)["'`]\s*\)((?:\s*\.\s*(get|post|put|patch|delete)\([\s\S]*?\))+)/g;

  let match;

  while ((match = chainedRegex.exec(content)) !== null) {
    const routePath = cleanPath(match[1]);
    const chain = match[2];
    const fullPath = joinPaths(basePath, routePath);
    const methodRegex = /\.(get|post|put|patch|delete)\(/g;

    let methodMatch;

    while ((methodMatch = methodRegex.exec(chain)) !== null) {
      routes.push({
        method: methodMatch[1].toUpperCase(),
        path: fullPath,
        authRequired: detectAuthHint(chain, content),
        sourceFile,
      });
    }
  }

  return routes;
}

function dedupeRoutes(routes) {
  const seen = new Set();

  return routes.filter((route) => {
    const key = `${route.method} ${route.path}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getGroupName(route) {
  const parts = route.path.split("/").filter(Boolean);

  if (parts[0] === "api" && parts[1]) {
    return parts[1];
  }

  if (parts[0]) {
    return parts[0];
  }

  return "general";
}

function createRequestName(route) {
  const clean = route.path
    .replace(/^\/api\//, "")
    .replace(/^\//, "")
    .replace(/\{\{(.+?)\}\}/g, ":$1");

  return `${route.method} /${clean}`;
}

function createExampleBody(route) {
  if (!["POST", "PUT", "PATCH"].includes(route.method)) {
    return undefined;
  }

  const lowerPath = route.path.toLowerCase();

  if (lowerPath.includes("/auth/login")) {
    return {
      email: "user@example.com",
      password: "Password123!",
    };
  }

  if (lowerPath.includes("/auth/register")) {
    return {
      accountType: "Guest",
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      dateOfBirth: "1990-01-01",
      password: "Password123!",
    };
  }

  if (lowerPath.includes("/bookings/checkout")) {
    return {
      visitDate: "2026-08-01",
      customerNotes: "Generated Postman example",
      items: [
        {
          itemType: "ride",
          itemId: 1,
          quantity: 1,
        },
      ],
    };
  }

  if (lowerPath.includes("/cancel")) {
    return {
      cancellationReason: "Cancelled from Postman test",
    };
  }

  if (lowerPath.includes("/admin/rides")) {
    return {
      name: "Postman Test Ride",
      description: "Generated sample ride request body",
      category: "Family",
      thrillLevel: "Medium",
      minimumHeightCm: 100,
      minimumAgeYears: 8,
      requiresAdultSupervision: false,
      price: 25,
      pointsEarned: 10,
      imageUrl: "",
    };
  }

  if (lowerPath.includes("/admin/accommodations")) {
    return {
      name: "Postman Test Lodge",
      description: "Generated sample accommodation request body",
      type: "Lodge",
      pricePerNight: 150,
      maxGuests: 4,
      minimumLeadGuestAgeYears: 18,
      isFamilyFriendly: true,
      imageUrl: "",
    };
  }

  if (lowerPath.includes("/reject")) {
    return {
      rejectionReason: "Rejected from Postman test",
    };
  }

  if (lowerPath.includes("/security-events/access-denied")) {
    return {
      path: "/admin/security-events",
      allowedRoles: ["Admin"],
    };
  }

  return {
    example: "Update this body for your endpoint",
  };
}

function createPostmanItem(route) {
  const postmanPath = toPostmanPath(route.path);
  const url = `{{baseUrl}}${postmanPath}`;
  const body = createExampleBody(route);

  const headers = [
    {
      key: "Content-Type",
      value: "application/json",
    },
  ];

  const request = {
    method: route.method,
    header: headers,
    url: {
      raw: url,
      host: ["{{baseUrl}}"],
      path: postmanPath.split("/").filter(Boolean),
    },
    description: [
      `Generated from: ${path.relative(BACKEND_ROOT, route.sourceFile)}`,
      route.authRequired ? "Auth: Bearer token required" : "Auth: Public or route-level validation",
    ].join("\n"),
  };

  if (route.authRequired) {
    request.auth = {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{token}}",
          type: "string",
        },
      ],
    };
  }

  if (body) {
    request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: "json",
        },
      },
    };
  }

  return {
    name: createRequestName(route),
    request,
    response: [],
  };
}

function buildCollection(routes) {
  const groups = {};

  for (const route of routes) {
    const groupName = getGroupName(route);

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(createPostmanItem(route));
  }

  const items = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, groupItems]) => ({
      name: groupName.charAt(0).toUpperCase() + groupName.slice(1),
      item: groupItems.sort((a, b) => a.name.localeCompare(b.name)),
    }));

  return {
    info: {
      name: PROJECT_NAME,
      description:
        "Auto-generated Postman collection from mounted Express routes. Regenerate after adding or changing backend routes.",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: items,
    variable: [
      {
        key: "baseUrl",
        value: DEFAULT_BASE_URL,
      },
      {
        key: "token",
        value: "",
      },
      {
        key: "rideId",
        value: "1",
      },
      {
        key: "accommodationId",
        value: "1",
      },
      {
        key: "bookingReference",
        value: "WB-CHANGE-ME",
      },
      {
        key: "type",
        value: "ride",
      },
      {
        key: "id",
        value: "1",
      },
    ],
  };
}

function buildEnvironment() {
  return {
    name: "Wonderland Local",
    values: [
      {
        key: "baseUrl",
        value: DEFAULT_BASE_URL,
        type: "default",
        enabled: true,
      },
      {
        key: "token",
        value: "",
        type: "secret",
        enabled: true,
      },
      {
        key: "rideId",
        value: "1",
        type: "default",
        enabled: true,
      },
      {
        key: "accommodationId",
        value: "1",
        type: "default",
        enabled: true,
      },
      {
        key: "bookingReference",
        value: "WB-CHANGE-ME",
        type: "default",
        enabled: true,
      },
      {
        key: "type",
        value: "ride",
        type: "default",
        enabled: true,
      },
      {
        key: "id",
        value: "1",
        type: "default",
        enabled: true,
      },
    ],
    _postman_variable_scope: "environment",
    _postman_exported_using: "Wonderland local generator",
  };
}

function main() {
  const files = getRouteFiles();
  const serverContent = read(SERVER_FILE);
  const mounts = findRouteMounts(serverContent);

  let routes = [];

  for (const file of files) {
    const content = read(file);
    const mountedBasePath = mounts.get(file) || "";

    routes.push(...extractDirectRoutes(content, mountedBasePath, file));
    routes.push(...extractChainedRoutes(content, mountedBasePath, file));
  }

  routes = dedupeRoutes(routes).sort((a, b) => {
    const pathCompare = a.path.localeCompare(b.path);
    if (pathCompare !== 0) return pathCompare;
    return a.method.localeCompare(b.method);
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const collection = buildCollection(routes);
  const environment = buildEnvironment();

  const collectionPath = path.join(OUTPUT_DIR, "wonderland-api.postman_collection.json");
  const environmentPath = path.join(OUTPUT_DIR, "wonderland-local.postman_environment.json");

  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2));

  console.log("");
  console.log("Postman collection generated successfully.");
  console.log(`Routes found: ${routes.length}`);
  console.log(`Collection: ${collectionPath}`);
  console.log(`Environment: ${environmentPath}`);
  console.log("");

  for (const route of routes) {
    console.log(`${route.method.padEnd(6)} ${route.path}`);
  }

  console.log("");

  if (routes.length === 0) {
    process.exitCode = 1;
  }
}

main();
