const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" },
  });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
    );
  return result.stdout;
}
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), "biel-react-contract-"),
);
const repository = path.resolve(__dirname, "..");
try {
  const packed = JSON.parse(
    run(
      "npm",
      ["pack", "--ignore-scripts", "--json", "--pack-destination", temporary],
      repository,
    ),
  )[0];
  const tarball = path.join(temporary, packed.filename);
  assert(packed.files.some((file) => file.path === "dist/cjs/index.js"));
  assert(packed.files.some((file) => file.path === "dist/esm/index.js"));
  for (const [version, types] of [
    ["18.3.1", "18"],
    ["19.3.0", "19"],
  ]) {
    const consumer = path.join(temporary, version);
    fs.mkdirSync(consumer);
    fs.writeFileSync(
      path.join(consumer, "package.json"),
      JSON.stringify({
        name: "artifact-consumer",
        version: "1.0.0",
        private: true,
      }),
    );
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        tarball,
        `react@${version}`,
        `react-dom@${version}`,
        `@types/react@${types}`,
        "typescript@5.5.4",
        "jsdom@26.1.0",
      ],
      consumer,
    );
    fs.copyFileSync(
      path.join(__dirname, "packed-consumer.cjs"),
      path.join(consumer, "consumer.cjs"),
    );
    process.stdout.write(run(process.execPath, ["consumer.cjs"], consumer));
    fs.writeFileSync(
      path.join(consumer, "contract.tsx"),
      `import * as React from 'react';\nimport { BielBot, BielSearch, BielButton, BielSearchButton, defineCustomElements } from 'biel-react';\nconst ref=React.createRef<HTMLBielBotElement>();\nconst bot=<BielBot ref={ref} project={'quote" 日本語 </script>'} keepConversation={true} renderMath={false} initialMessages={[{text:'你好',sender:'ai',isPartial:false}]} onCloseBot={()=>{}} />;\nconst search=<BielSearch project='p' onMessageSent={event=>console.log(event.detail.message)} />;\nconst button=<BielButton project='p' />;\nconst searchButton=<BielSearchButton project='p' />;\n// @ts-expect-error unknown props must remain invalid\nconst invalid=<BielBot nonexistentAuditProp={true} />;\nvoid [bot,search,button,searchButton,invalid,defineCustomElements];\n`,
    );
    run(
      process.execPath,
      [
        "node_modules/typescript/bin/tsc",
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--jsx",
        "react",
        "--moduleResolution",
        "node",
        "--esModuleInterop",
        "--lib",
        "dom,es2020",
        "contract.tsx",
      ],
      consumer,
    );
    console.log(
      `PASS packed React ${version}: CJS/ESM, actual widget mount, props/events/ref/SSR and canonical TypeScript contracts`,
    );
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
