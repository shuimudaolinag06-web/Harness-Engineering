#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const starterRoot = path.join(pluginRoot, 'assets', 'starter');
const targetRoot = path.resolve(process.argv[2] ?? process.cwd());

if (!existsSync(starterRoot)) {
  console.error(`Starter assets not found: ${starterRoot}`);
  process.exit(1);
}

await copyIfPresent('.harness');
await copyIfPresent('scripts');
await copyIfPresent('harness.cmd');
await copyIfPresent('harness.ps1');
await copyIfPresent('harness');
await mkdir(path.join(targetRoot, '.harness', 'changes'), { recursive: true });
await mergePackageScripts();

console.log(`Harness Engineering starter installed into ${targetRoot}`);
console.log('Next steps:');
console.log('  .\\harness.cmd 列出阶段');
console.log('  npm.cmd run validate');

async function copyIfPresent(relativePath) {
  const source = path.join(starterRoot, relativePath);
  const target = path.join(targetRoot, relativePath);
  if (!existsSync(source)) {
    return;
  }

  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { recursive: true, force: true });
}

async function mergePackageScripts() {
  const packagePath = path.join(targetRoot, 'package.json');
  const starterPackagePath = path.join(starterRoot, 'package.harness-scripts.json');
  if (!existsSync(starterPackagePath)) {
    return;
  }

  const starterPackage = JSON.parse(await readFile(starterPackagePath, 'utf8'));
  const targetPackage = existsSync(packagePath)
    ? JSON.parse(await readFile(packagePath, 'utf8'))
    : {
        name: path.basename(targetRoot).toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        private: true,
        type: 'module',
        scripts: {}
      };

  targetPackage.type ??= starterPackage.type;
  targetPackage.scripts ??= {};
  targetPackage.bin ??= {};
  targetPackage.engines ??= {};

  const scriptsToAdd = {
    harness: starterPackage.scripts.harness,
    validate: starterPackage.scripts.validate,
    'verify:harness': starterPackage.scripts['verify:harness']
  };

  for (const [name, command] of Object.entries(scriptsToAdd)) {
    if (!targetPackage.scripts[name]) {
      targetPackage.scripts[name] = command;
    }
  }

  if (!targetPackage.scripts.verify) {
    targetPackage.scripts.verify = starterPackage.scripts.verify;
  }

  targetPackage.bin.harness ??= starterPackage.bin.harness;
  targetPackage.engines.node ??= starterPackage.engines.node;

  await writeFile(packagePath, `${JSON.stringify(targetPackage, null, 2)}\n`, 'utf8');
}
