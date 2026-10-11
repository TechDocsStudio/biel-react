const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const widgetRoot = path.dirname(require.resolve("biel-search/package.json"));
const manifest = JSON.parse(
  fs.readFileSync(
    path.join(widgetRoot, "dist/collection/collection-manifest.json"),
    "utf8",
  ),
);
const publicTags = [
  "biel-button",
  "biel-bot",
  "biel-search-button",
  "biel-search",
];
const components = new Map();
for (const entry of manifest.entries) {
  const source = ts.createSourceFile(
    entry,
    fs.readFileSync(path.join(widgetRoot, "dist/collection", entry), "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement)) continue;
    const getter = statement.members.find(
      (member) =>
        ts.isGetAccessorDeclaration(member) &&
        member.name.getText(source) === "is",
    );
    const returned = getter?.body.statements.find(
      ts.isReturnStatement,
    )?.expression;
    if (returned && ts.isStringLiteral(returned))
      components.set(returned.text, statement.name.text);
  }
}
const lines = [
  "/* Auto-generated from the installed widget collection; run npm run build. */",
  "import { createReactComponent } from './react-component-lib';",
  "import type { JSX } from 'biel-search';",
  "",
];
for (const tag of publicTags) {
  const component = components.get(tag);
  if (!component) throw new Error(`Published widget does not declare ${tag}`);
  lines.push(
    `export const ${component} = createReactComponent<JSX.${component}, HTML${component}Element>('${tag}');`,
  );
}
fs.writeFileSync(
  "lib/components/stencil-generated/index.ts",
  lines.join("\n") + "\n",
);
