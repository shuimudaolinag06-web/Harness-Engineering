#!/usr/bin/env node
import { validateHarness } from './lib/harnessValidator.mjs';

const result = await validateHarness(process.cwd());

for (const warning of result.warnings) {
  console.warn(`WARN ${warning}`);
}

if (!result.ok) {
  console.error('Harness validation failed:');
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Harness validation passed.');
}
