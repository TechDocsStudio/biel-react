const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
};
run(["scripts/generate-proxies.cjs"]);
fs.rmSync("dist", { recursive: true, force: true });
const compiler = require.resolve("typescript/bin/tsc");
run([
  compiler,
  "-p",
  "tsconfig.json",
  "--outDir",
  "dist/esm",
  "--declarationDir",
  "dist/types",
]);
run([
  compiler,
  "-p",
  "tsconfig.json",
  "--module",
  "commonjs",
  "--outDir",
  "dist/cjs",
  "--declarationDir",
  "dist/types",
]);
fs.writeFileSync(
  "dist/esm/package.json",
  JSON.stringify({ type: "module" }) + "\n",
);
function rewrite(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) rewrite(file);
    else if (file.endsWith(".js")) {
      let source = fs.readFileSync(file, "utf8");
      source = source.replace(
        /(from\s+['"])(\.[^'"]+)(['"])/g,
        (_, prefix, specifier, suffix) => {
          const target = path.resolve(path.dirname(file), specifier);
          const resolved = fs.existsSync(target + ".js")
            ? specifier + ".js"
            : specifier + "/index.js";
          return prefix + resolved + suffix;
        },
      );
      source = source.replace(
        /(['"])biel-search\/loader\1/g,
        "'biel-search/loader/index.cjs.js'",
      );
      fs.writeFileSync(file, source);
    }
  }
}
rewrite("dist/esm");
function rewriteLoader(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) rewriteLoader(file);
    else if (file.endsWith(".js"))
      fs.writeFileSync(
        file,
        fs
          .readFileSync(file, "utf8")
          .replace(
            /(['"])biel-search\/loader\1/g,
            "'biel-search/loader/index.cjs.js'",
          ),
      );
  }
}
rewriteLoader("dist/cjs");
