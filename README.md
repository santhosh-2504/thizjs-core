# @thizjs/core

> The backbone of THIZ.js — file-based routing for Express that actually makes sense.

[![npm version](https://img.shields.io/npm/v/@thizjs/core.svg)](https://www.npmjs.com/package/@thizjs/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## What is this?

`@thizjs/core` is the routing engine that powers [THIZ.js](https://github.com/santhosh-2504/create-thiz-app). It brings **file-based routing** to Express.js — no more tedious `app.get()`, `app.post()` boilerplate. Just create files, export handlers, and you're done.

**Features:**
- 📁 **File-based routing** — structure matches your API endpoints
- 🎯 **Zero config** — works with any Express app
- 🔥 **Dynamic routes** — `[id]` folders → `:id` params
- 🚀 **Multiple route directories** — organize by feature, version, or prefix
- ⚡ **Drop-in compatible** — use in existing Express projects
- 🛡️ **Conflict detection** — warns about overlapping dynamic routes
- 📘 **Native TypeScript support** — write route files in `.ts` or `.js`

## Quick Start

### New Project

Start fresh with the full THIZ.js experience:
```bash
npx create-thiz-app my-app
cd my-app
npm run dev
```

👉 **Learn more:** [create-thiz-app](https://www.npmjs.com/package/create-thiz-app)

### Existing Project

Add file-based routing to your current Express app:
```bash
npm install @thizjs/core
```

### TypeScript Support

`@thizjs/core` includes full TypeScript definitions out of the box. Install type definitions for Express:
```bash
npm install @thizjs/core
npm install -D @types/express @types/node
```
### Native `.ts` Route Files

Write route handlers directly in TypeScript:
```bash
npm install -D tsx @types/express @types/node
```

**TypeScript route example:**
```typescript
// src/routes/product/[id]/GET.ts
import { Request, Response } from 'express';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default async (req: Request, res: Response) => {
  const { id } = req.params;
  const product: Product = await db.products.findById(id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
};
```

### Important Notes

- ⚠️ **Cannot mix extensions:** Choose either `.js` OR `.ts` for each route (not both)
- ✅ **TypeScript is optional:** JavaScript-only projects work without any extra dependencies
- ✅ **Graceful fallback:** Clear error messages if `.ts` files are used without `tsx` installed

**Using TypeScript in your App:**
```typescript
import express, { Request, Response } from 'express';
import { registerRoutes } from '@thizjs/core';

const app = express();

app.use(express.json());

// Full type safety and autocomplete
await registerRoutes(app, 'routes', { 
  prefix: '/api',
  strict: true 
});

app.listen(3000);
```

## Usage

### Basic Setup
```javascript
import express from 'express';
import { registerRoutes } from '@thizjs/core';

const app = express();

app.use(express.json());

// Register file-based routes
await registerRoutes(app, 'routes', { prefix: '' });

app.listen(3000);
```

### File Structure → API Routes

Create this folder structure in `src/`:
```
src/
├── routes/
│   ├── product/
│   │   ├── GET.js           → GET /product
│   │   ├── POST.js          → POST /product
│   │   └── [id]/
│   │       ├── GET.js       → GET /product/:id
│   │       ├── PATCH.js     → PATCH /product/:id
│   │       └── DELETE.js    → DELETE /product/:id
│   └── user/
│       ├── login/
│       │   └── POST.js      → POST /user/login
│       └── profile/
│           └── GET.js       → GET /user/profile
```

### Route Handlers

Each HTTP method file exports a standard Express handler:

**`src/routes/product/GET.js`**
```javascript
export default async (req, res) => {
  const products = await db.products.find();
  res.json(products);
};
```

**`src/routes/product/[id]/GET.js`**
```javascript
export default async (req, res) => {
  const { id } = req.params;
  const product = await db.products.findById(id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
};
```

**`src/routes/product/POST.js`**
```javascript
export default async (req, res) => {
  const product = await db.products.create(req.body);
  res.status(201).json(product);
};
```

## Advanced Usage

### Multiple Route Directories

Organize routes by feature, version, or domain:
```javascript
import express from 'express';
import { registerRoutes } from '@thizjs/core';

const app = express();

// Public API routes
await registerRoutes(app, 'routes', { prefix: '' });

// Admin routes with /api prefix
await registerRoutes(app, 'api', { prefix: '/api' });

// V2 API routes
await registerRoutes(app, 'v2', { prefix: '/v2' });

app.listen(3000);
```

**Folder structure:**
```
src/
├── routes/        → /product, /user
├── api/           → /api/admin, /api/settings
└── v2/            → /v2/product, /v2/user
```

### Drop Into Existing Express Apps

Keep your legacy routes and gradually migrate to file-based routing:
```javascript
import express from 'express';
import { registerRoutes } from '@thizjs/core';
import legacyRoutes from './legacy-routes.js';

const app = express();

// Your existing routes still work
app.use('/legacy', legacyRoutes);

// Add file-based routing in a new folder
await registerRoutes(app, 'new-routes', { prefix: '/v2' });

app.listen(3000);
```

### Nested Dynamic Routes

Handle complex URL patterns:
```
src/
└── routes/
    └── user/
        └── [userId]/
            └── post/
                └── [postId]/
                    ├── GET.js       → GET /user/:userId/post/:postId
                    └── DELETE.js    → DELETE /user/:userId/post/:postId
```

**`src/routes/user/[userId]/post/[postId]/GET.js`**
```javascript
export default async (req, res) => {
  const { userId, postId } = req.params;
  
  const post = await db.posts.findOne({
    userId,
    postId,
  });
  
  res.json(post);
};
```

### Strict Mode (Conflict Detection)

Enable strict mode to throw errors on dynamic route conflicts:
```javascript
await registerRoutes(app, 'routes', {
  prefix: '/api',
  strict: true, // Throws on conflicts
});
```

**Without strict mode (default):**
```javascript
await registerRoutes(app, 'routes', { strict: false });
// Logs warnings to console but continues
```

**Example conflict:**
```
routes/
└── product/
    ├── [id]/GET.js          → GET /product/:id
    └── [slug]/GET.js        → GET /product/:slug  
    
⚠️ Both resolve to GET /product/:param
```

**In strict mode:** Throws error and stops server startup  
**In normal mode:** Logs warning and uses first route found

## API Reference

### `registerRoutes(app, routesDir, options)`

Registers file-based routes to an Express app.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `app` | `Express` | *required* | Your Express application instance |
| `routesDir` | `string` | `"routes"` | Folder name inside `src/` containing route files |
| `options` | `object` | `{}` | Configuration options |
| `options.prefix` | `string` | `""` | URL prefix for all routes in this directory |
| `options.strict` | `boolean` | `false` | Throw errors on dynamic route conflicts instead of warnings |

**Returns:** `Promise<void>`

**Example:**
```javascript
await registerRoutes(app, 'routes', { prefix: '/api' });
// ✓ Scans src/routes/ and mounts routes at /api
```

**Path Resolution:**
Routes are loaded from `src/<routesDir>/` relative to your project root.
```javascript
await registerRoutes(app, 'api');     // → src/api/
await registerRoutes(app, 'v2');      // → src/v2/
```

### Supported HTTP Methods

- `GET.js` or `GET.ts`
- `POST.js` or `POST.ts`
- `PUT.js` or `PUT.ts`
- `PATCH.js` or `PATCH.ts`
- `DELETE.js` or `DELETE.ts`

Each file should export a default Express handler:

**Arrow function:**
```javascript
export default (req, res) => {
  res.json({ message: 'Hello' });
};
```

**Named function:**
```javascript
export default function handler(req, res) {
  res.json({ message: 'Hello' });
}
```

**Async handlers:**
```javascript
export default async (req, res) => {
  const data = await fetchData();
  res.json(data);
};
```

**All styles work — choose what you prefer.**`

## Error Handling

**Missing handler:**
If a method file doesn't export a handler, THIZ will throw an error:
```javascript
// ❌ This will throw
// routes/product/GET.js
const something = 'value';
// (no export default)

// ✅ This works
export default (req, res) => {
  res.json({ products: [] });
};
```

**Missing routes directory:**
If `src/<routesDir>/` doesn't exist:
```javascript
await registerRoutes(app, 'nonexistent');
// Error: Routes directory not found: /path/to/project/src/nonexistent
```
**TypeScript without tsx:**
If you try to use `.ts` files without installing `tsx`:
```javascript
// routes/product/GET.ts exists but tsx not installed
await registerRoutes(app, 'routes');
// Error: Cannot load TypeScript route file: src/routes/product/GET.ts
// 
// TypeScript support requires 'tsx' package.
// Install it with: npm install -D tsx
```
**File extension conflicts:**
If you have both `.js` and `.ts` for the same route:
```javascript
// routes/product/GET.js AND routes/product/GET.ts both exist
await registerRoutes(app, 'routes');
// Error: File extension conflict detected!
// 
// Files:
// → src/routes/product/GET.js
// → src/routes/product/GET.ts
// 
// Both resolve to: [GET] /product
// You cannot have both .js and .ts files for the same route.
```
**Handling errors in routes:**
Use standard Express error handling:
```javascript
export default async (req, res) => {
  try {
    const data = await riskyOperation();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Convention Rules

1. **Location:** Routes must be in `src/<routesDir>/` (e.g., `src/routes/`)
2. **Method files:** Named `GET.js`, `POST.js`, `PUT.js`, `PATCH.js`, or `DELETE.js` (case-insensitive)
3. **Dynamic segments:** Use `[param]` folders to create `:param` URL parameters
4. **Handler export:** Must use `export default` with a function
5. **File extensions:** Use `.js` or `.ts` files (requires `tsx` for TypeScript). Cannot have both `.js` and `.ts` for the same route.

## Examples

### RESTful CRUD API (JavaScript)
```
src/
└── routes/
    └── product/
        ├── GET.js              → List products
        ├── POST.js             → Create product
        └── [id]/
            ├── GET.js          → Get product by ID
            ├── PATCH.js        → Update product
            └── DELETE.js       → Delete product
```

### RESTful CRUD API (TypeScript)
```
src/
└── routes/
    └── product/
        ├── GET.ts              → List products
        ├── POST.ts             → Create product
        └── [id]/
            ├── GET.ts          → Get product by ID
            ├── PATCH.ts        → Update product
            └── DELETE.ts       → Delete product
```

### Authentication Routes
```
src/
└── routes/
    └── auth/
        ├── register/
        │   └── POST.js         → POST /auth/register
        ├── login/
        │   └── POST.js         → POST /auth/login
        └── logout/
            └── POST.js         → POST /auth/logout
```

### Versioned API
```javascript
// Different versions in separate folders
await registerRoutes(app, 'v1', { prefix: '/v1' });
await registerRoutes(app, 'v2', { prefix: '/v2' });
```
```
src/
├── v1/
│   └── product/
│       └── GET.js      → GET /v1/product
└── v2/
    └── product/
        └── GET.js      → GET /v2/product
```

## Why File-Based Routing?

**Traditional Express:**
```javascript
// routes/product.js
import express from 'express';
const router = express.Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;

// app.js
import productRoutes from './routes/product.js';
app.use('/product', productRoutes);
```

**With @thizjs/core:**
```
src/routes/product/
├── GET.js              ✓ Done
├── POST.js             ✓ Done
└── [id]/
    ├── GET.js          ✓ Done
    ├── PATCH.js        ✓ Done
    └── DELETE.js       ✓ Done
```

No more:
- ❌ Importing and mounting routers
- ❌ Manually defining route paths
- ❌ Keeping route files and registration in sync
- ❌ Boilerplate, boilerplate, boilerplate

## Pair With

- **[@thizjs/dev](https://www.npmjs.com/package/@thizjs/dev)** — Hot-reloading dev server
- **[create-thiz-app](https://www.npmjs.com/package/create-thiz-app)** — Full MEN stack generator

## Contributing

We welcome contributions! If you find a bug or want to add a feature:

1. Fork the repo: [https://github.com/santhosh-2504/thizjs-core](https://github.com/santhosh-2504/thizjs-core)
2. Create a branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push and open a PR

## Coming Soon

- 🔄 Middleware support (per-route and global)
- 🎣 Route hooks (beforeEach, afterEach)
- 🔌 Plugin system

Want these features? [Open an issue](https://github.com/santhosh-2504/thizjs-core/issues) or contribute!

## License

MIT © [Santhosh Kumar Anantha](https://github.com/santhosh-2504)

---

**Stop writing boilerplate. Start shipping features.**

Get started: `npx create-thiz-app my-app`