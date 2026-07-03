/**
 * Netlify Function entry point.
 * Wraps the Express app with serverless-http so it can run as a
 * Netlify serverless function while the frontend is hosted on Netlify CDN.
 *
 * Build: `pnpm --filter @workspace/api-server run build:netlify`
 * Output: netlify/functions/api.mjs (bundled, referenced by netlify.toml)
 */
import { createRequire } from "module";
import app from "./app.js";

const require = createRequire(import.meta.url);
// serverless-http is CJS; esbuild handles the interop at bundle time
const serverless = require("serverless-http");

export const handler = serverless(app);
