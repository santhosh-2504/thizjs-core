import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Register file-based routes using folder-based method mapping.
 *
 * Example:
 *   routes/product/add-product/POST.js → POST /product/add-product
 *   routes/product/get/[id]/GET.js     → GET /product/get/:id
 */
export async function registerRoutes(app, routesDir = "routes", options = {}) {
  const { prefix = "", strict = false } = options;

  const normalizedPrefix = prefix.replace(/\/+$/, "");
  const projectRoot = process.cwd();
  const baseDir = path.resolve(projectRoot, "src", routesDir);

  if (!fs.existsSync(baseDir)) {
    throw new Error(`Routes directory not found: ${baseDir}`);
  }

  const routeRegistry = new Map();

  function normalizeDynamic(p) {
    return p.replace(/:\w+/g, ":param");
  }

  async function walk(currentDir, prefixPath = "") {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);

      if (item.isDirectory()) {
        await walk(fullPath, `${prefixPath}/${item.name}`);
        continue;
      }

      // Method files: GET.js, POST.js, DELETE.js, PATCH.js, PUT.js
      const methodMatch = item.name.match(/^(GET|POST|PUT|PATCH|DELETE)\.js$/i);
      if (!methodMatch) continue;

      const method = methodMatch[1].toLowerCase();

      // Convert folders like [id] → :id
      const processedPath = prefixPath.replace(/\[(.+?)\]/g, ":$1");

      // Build final route
      const routePath = `${normalizedPrefix}${processedPath}`
        .replace(/\\/g, "/")
        .replace(/\/+/g, "/");

      // Detect dynamic route conflicts
      const fingerprint = `${method}:${normalizeDynamic(routePath)}`;

      if (routeRegistry.has(fingerprint)) {
        const prev = routeRegistry.get(fingerprint);

        const msg = `
Dynamic route conflict detected!

Files:
→ ${prev}
→ ${fullPath}

Both resolve to: [${method.toUpperCase()}] ${routePath}
        `.trim();

        if (strict) throw new Error(msg);
        else console.warn("\n" + msg + "\n");
      } else {
        routeRegistry.set(fingerprint, fullPath);
      }

      // Import handler
      const fileUrl = pathToFileURL(fullPath).href;
      const handlerModule = await import(fileUrl);

      const handler =
        handlerModule.default ||
        handlerModule.handler ||
        (() => {
          throw new Error(`No handler exported in ${fullPath}`);
        });

      app[method](routePath, handler);

      console.log(`Loaded route: [${method.toUpperCase()}] ${routePath}`);
    }
  }

  await walk(baseDir);
}
