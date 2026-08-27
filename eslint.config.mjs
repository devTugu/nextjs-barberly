import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const slicedLayers = ["widgets", "features", "entities"];

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
            "FSD layer violation: ${file.type} cannot import from ${dependency.type}",
          rules: [
            {
              from: { type: "app" },
              allow: [
                { to: { type: "widgets" } },
                { to: { type: "features" } },
                { to: { type: "entities" } },
                { to: { type: "shared" } },
                { to: { type: "processes" } },
                { to: { type: "app" } },
              ],
            },
            {
              from: { type: "widgets" },
              allow: [
                { to: { type: "widgets" } },
                { to: { type: "features" } },
                { to: { type: "entities" } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "features" },
              allow: [
                { to: { type: "entities" } },
                { to: { type: "shared" } },
              ],
            },
            {
              from: { type: "entities" },
              allow: [
                { to: { type: "entities" } },
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
            {
              from: {
                type: ["app", "widgets", "features", "entities", "processes"],
              },
              disallow: [
                {
                  to: {
                    type: slicedLayers,
                    internalPath: "!(index.ts|index.tsx)",
                  },
                },
              ],
              message:
                "FSD public API: import ${dependency.type}/${to.captured.slice} through index.ts, not ${to.internalPath}",
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
    "next-env.d.ts",
    "scripts/**",
    "e2e/**",
  ]),
]);

export default eslintConfig;
