/**
 * Netlify Function entry point — file named "api" so esbuild outputs api.mjs,
 * which Netlify exposes as /.netlify/functions/api
 *
 * All /api/* requests are redirected here by netlify.toml.
 * serverless-http wraps the Express app for the AWS Lambda / Netlify event format.
 */
// Static import so esbuild bundles serverless-http inline (not left as external require)
// @ts-ignore — serverless-http types are loose; the runtime API is correct
import serverlessHttp from "serverless-http";
import app from "./app.js";

export const handler = serverlessHttp(app, {
  binary: ["image/*", "application/octet-stream", "text/csv"],
});
