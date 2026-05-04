const fs = require('fs');
const path = require('path');

const PROJECT_NAME = 'Wonderland API';
const BACKEND_ROOT = process.cwd();
const OUTPUT_DIR = path.join(BACKEND_ROOT, '..', 'postman');

const DEFAULT_BASE_URL = process.env.POSTMAN_BASE_URL || process.env.BACKEND_URL || 'http://localhost:5010';

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function walkFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry === 'build' || entry === 'coverage') {
      continue;
    }

    if (stat.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.endsWith('.js') || entry.endsWith('.mjs') || entry.endsWith('.cjs')) {
      files.push(fullPath);
    }
  }

  return files;
}

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function cleanPath(value) {
  if (!value) return '';

  return value.replace(/[`'"]/g, '').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
}

function joinPaths(base, child) {
  const left = cleanPath(base);
  const right = cleanPath(child);

  if (left === '/' && right === '/') return '/';
  if (left === '/') return right;
  if (right === '/') return left;

  return cleanPath(`${left}/${right}`);
}

function toPostmanPath(expressPath) {
  return expressPath.replace(/:([A-Za-z0-9_]+)/g, '{{$1}}');
}

function extractImports(content, filePath) {
  const imports = {};

  const requireRegex = /(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*require\(["'](.+?)["']\)/g;

  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+["'](.+?)["']/g;

  for (const regex of [requireRegex, importRegex]) {
    let match;

    while ((match = regex.exec(content)) !== null) {
      const variableName = match[1];
      const importPath = match[2];

      if (!importPath.startsWith('.')) continue;

      let resolved = path.resolve(path.dirname(filePath), importPath);

      const candidates = [
        resolved,
        `${resolved}.js`,
        `${resolved}.mjs`,
        `${resolved}.cjs`,
        path.join(resolved, 'index.js'),
      ];

      const found = candidates.find((candidate) => fs.existsSync(candidate));

      if (found) {
        imports[variableName] = found;
      }
    }
  }

  return imports;
}

function findRouteMounts(files) {
  const mounts = new Map();

  for (const file of files) {
    const content = read(file);
    const imports = extractImports(content, file);

    const appUseRegex = /app\.use\(\s*["'`]([^"'`]+)["'`]\s*,\s*([A-Za-z0-9_]+)/g;

    let match;

    while ((match = appUseRegex.exec(content)) !== null) {
      const basePath = cleanPath(match[1]);
      const routeVariable = match[2];
      const routeFile = imports[routeVariable];

      if (routeFile) {
        mounts.set(routeFile, basePath);
      }
    }
  }

  return mounts;
}

function detectAuthHint(routeLine) {
  const lower = routeLine.toLowerCase();

  return (
    lower.includes('protect') ||
    lower.includes('auth') ||
    lower.includes('verifytoken') ||
    lower.includes('requireauth') ||
    lower.includes('isadmin') ||
    lower.includes('admin')
  );
}

function extractDirectRoutes(content, basePath, sourceFile) {
  const routes = [];

  for (const method of HTTP_METHODS) {
    const routerRegex = new RegExp(`router\\.${method}\\(\\s*["'\`]([^"'\`]+)["'\`]([\\s\\S]*?)\\)`, 'g');

    const appRegex = new RegExp(`app\\.${method}\\(\\s*["'\`]([^"'\`]+)["'\`]([\\s\\S]*?)\\)`, 'g');

    for (const regex of [routerRegex, appRegex]) {
      let match;

      while ((match = regex.exec(content)) !== null) {
        const routePath = cleanPath(match[1]);
        const restOfLine = match[2] || '';
        const fullPath = regex === appRegex ? routePath : joinPaths(basePath, routePath);

        routes.push({
          method: method.toUpperCase(),
          path: fullPath,
          authRequired: detectAuthHint(restOfLine),
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
        authRequired: detectAuthHint(chain),
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
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getGroupName(route) {
  const parts = route.path.split('/').filter(Boolean);

  if (parts[0] === 'api' && parts[1]) {
    return parts[1];
  }

  if (parts[0]) {
    return parts[0];
  }

  return 'general';
}

function createRequestName(route) {
  const clean = route.path
    .replace(/^\/api\//, '')
    .replace(/^\//, '')
    .replace(/\{\{(.+?)\}\}/g, ':$1');

  return `${route.method} /${clean}`;
}

function createExampleBody(route) {
  if (!['POST', 'PUT', 'PATCH'].includes(route.method)) {
    return undefined;
  }

  const lowerPath = route.path.toLowerCase();

  if (lowerPath.includes('login')) {
    return {
      email: 'user@example.com',
      password: 'Password123!',
    };
  }

  if (lowerPath.includes('register')) {
    return {
      firstName: 'Test',
      lastName: 'User',
      email: 'user@example.com',
      password: 'Password123!',
    };
  }

  if (lowerPath.includes('product')) {
    return {
      name: 'Sample Product',
      description: 'Generated sample request body',
      price: 99.99,
      category: 'General',
      stock: 10,
    };
  }

  if (lowerPath.includes('booking')) {
    return {
      attractionId: '{{attractionId}}',
      date: '2026-06-01',
      guests: 2,
    };
  }

  if (lowerPath.includes('order')) {
    return {
      items: [],
      total: 0,
    };
  }

  return {
    example: 'Update this body for your endpoint',
  };
}

function createPostmanItem(route) {
  const url = `{{baseUrl}}${toPostmanPath(route.path)}`;
  const body = createExampleBody(route);

  const headers = [
    {
      key: 'Content-Type',
      value: 'application/json',
    },
  ];

  const request = {
    method: route.method,
    header: headers,
    url: {
      raw: url,
      host: ['{{baseUrl}}'],
      path: toPostmanPath(route.path).split('/').filter(Boolean),
    },
    description: `Generated from: ${path.relative(BACKEND_ROOT, route.sourceFile)}`,
  };

  if (route.authRequired) {
    request.auth = {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: '{{token}}',
          type: 'string',
        },
      ],
    };
  }

  if (body) {
    request.body = {
      mode: 'raw',
      raw: JSON.stringify(body, null, 2),
      options: {
        raw: {
          language: 'json',
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
        'Auto-generated Postman collection from Express routes. Regenerate after adding or changing backend routes.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: items,
    variable: [
      {
        key: 'baseUrl',
        value: DEFAULT_BASE_URL,
      },
      {
        key: 'token',
        value: '',
      },
    ],
  };
}

function buildEnvironment() {
  return {
    name: 'Wonderland Local',
    values: [
      {
        key: 'baseUrl',
        value: DEFAULT_BASE_URL,
        type: 'default',
        enabled: true,
      },
      {
        key: 'token',
        value: '',
        type: 'secret',
        enabled: true,
      },
      {
        key: 'id',
        value: '1',
        type: 'default',
        enabled: true,
      },
      {
        key: 'userId',
        value: '1',
        type: 'default',
        enabled: true,
      },
      {
        key: 'productId',
        value: '1',
        type: 'default',
        enabled: true,
      },
      {
        key: 'bookingId',
        value: '1',
        type: 'default',
        enabled: true,
      },
      {
        key: 'orderId',
        value: '1',
        type: 'default',
        enabled: true,
      },
      {
        key: 'attractionId',
        value: '1',
        type: 'default',
        enabled: true,
      },
    ],
    _postman_variable_scope: 'environment',
    _postman_exported_using: 'Wonderland local generator',
  };
}

function main() {
  const files = walkFiles(BACKEND_ROOT);
  const mounts = findRouteMounts(files);

  let routes = [];

  for (const file of files) {
    const content = read(file);
    const mountedBasePath = mounts.get(file) || '';

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

  const collectionPath = path.join(OUTPUT_DIR, 'wonderland-api.postman_collection.json');

  const environmentPath = path.join(OUTPUT_DIR, 'wonderland-local.postman_environment.json');

  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
  fs.writeFileSync(environmentPath, JSON.stringify(environment, null, 2));

  console.log('');
  console.log('Postman collection generated successfully.');
  console.log(`Routes found: ${routes.length}`);
  console.log(`Collection: ${collectionPath}`);
  console.log(`Environment: ${environmentPath}`);
  console.log('');

  if (routes.length === 0) {
    console.log('No routes found.');
    console.log('Check that your backend uses Express patterns like:');
    console.log("router.get('/path', handler)");
    console.log("router.post('/path', handler)");
    console.log("app.use('/api/example', exampleRoutes)");
  }
}

main();
