import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative, extname } from "node:path";
export function findForeignGlyphs(
  root: string,
  includeBuild = false,
): { file: string; line: number }[] {
  const failures: { file: string; line: number }[] = [];
  const skipped = new Set([
    "node_modules",
    ".git",
    "test-results",
    "data",
    ...(includeBuild ? [] : ["dist"]),
  ]);
  const extensions = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".mjs",
    ".cjs",
    ".json",
    ".css",
    ".html",
    ".svg",
    ".md",
    ".txt",
    ".xml",
    ".yml",
    ".yaml",
  ]);
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (skipped.has(entry.name)) continue;
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && extensions.has(extname(entry.name))) {
        readFileSync(path, "utf8")
          .split(/\r?\n/)
          .forEach((line, index) => {
            const decoded = line.replace(
              /(?<!\\)\\u([0-9a-f]{4})/gi,
              (_match, hex) => String.fromCharCode(parseInt(hex, 16)),
            );
            if (/\p{Script=Han}/u.test(decoded))
              failures.push({ file: relative(root, path), line: index + 1 });
          });
      }
    }
  };
  walk(root);
  return failures;
}
if (process.argv[1]?.endsWith("check-vietnamese.ts")) {
  const failures = findForeignGlyphs(
    process.cwd(),
    process.argv.includes("--build"),
  );
  if (failures.length) {
    for (const f of failures) console.error(`${f.file}:${f.line}`);
    process.exitCode = 1;
  } else
    console.log(
      "Vietnamese content check passed: no foreign ideographs in project text, SVGs or selected build files.",
    );
}
