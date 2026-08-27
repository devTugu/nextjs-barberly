import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const slicePublicApi = ["index.ts", "index.tsx"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "app/*", mode: "folder" },
        { type: "app", pattern: "app" },
        { type: "processes", pattern: "src/processes/*", mode: "folder" },
        { type: "processes", pattern: "src/processes" },
        {
          type: "widgets",
          pattern: "src/widgets/*",
          mode: "folder",
          capture: ["slice"],
        },
        {
          type: "features",
          pattern: "src/features/*",
          mode: "folder",
          capture: ["slice"],
        },
        {
          type: "entities",
          pattern: "src/entities/*",
          mode: "folder",
          capture: ["slice"],
        },
        { type: "shared", pattern: "src/shared", mode: "folder" },
      ],
      "boundaries/ignore": [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "FSD: {{from.type}} cannot import {{to.type}}/{{to.captured.slice}} ({{to.internalPath}}). Use the slice index.ts public API.",
          rules: [
            {
              from: { type: "app" },
              allow: [
                { to: { type: "widgets", internalPath: slicePublicApi } },
                { to: { type: "features", internalPath: slicePublicApi } },
                { to: { type: "entities", internalPath: slicePublicApi } },
                { to: { type: "shared" } },
                { to: { type: "processes" } },
                { to: { type: "app" } },
              ],
            },
            {
              from: { type: "widgets" },
              allow: [
                { to: { type: "widgets", internalPath: slicePublicApi } },
                { to: { type: "features", internalPath: slicePublicApi } },
                { to: { type: "entities", internalPath: slicePublicApi } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "features" },
              allow: [
                { to: { type: "entities", internalPath: slicePublicApi } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "entities" },
              allow: [
                { to: { type: "entities", internalPath: slicePublicApi } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "shared" },
              allow: [{ to: { type: "shared" } }],
            },
            {
              from: { type: "processes" },
              allow: [
                { to: { type: "shared" } },
                { to: { type: "processes" } },
              ],
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "scripts/**",
    "e2e/**",
  ]),
]);

export default eslintConfig;
