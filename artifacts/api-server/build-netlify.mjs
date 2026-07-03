import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm, mkdir } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "..", "..");
const outDir = path.resolve(repoRoot, "netlify", "functions");

async function buildNetlify() {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/api.ts")],
    platform: "node",
    target: "node20",
    bundle: true,
    format: "esm",
    outdir: outDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "pg-native",
      "oracledb",
      "mysql2",
      "nodemailer",
    ],
    sourcemap: false,
    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });

  console.log(`\n✓ Netlify function bundled → ${outDir}/netlify.mjs`);
}

buildNetlify().catch((err) => {
  console.error(err);
  process.exit(1);
});
