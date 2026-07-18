#!/usr/bin/env node
import { spawn } from "node:child_process";
import { join } from "node:path";

const cli = join(process.cwd(), "node_modules", "astro", "bin", "astro.mjs");
const child = spawn(process.execPath, [cli, "check"], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code ?? 1));
