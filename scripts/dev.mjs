import { spawn } from "child_process";

const apiPort = process.env.API_PORT || "3001";
const vitePort = process.env.PORT || "3000";

console.log(`[Dev] Starting API Server on port ${apiPort}...`);
const apiServer = spawn(
  "npx",
  ["tsx", "artifacts/api-server/src/index.ts"],
  {
    env: { ...process.env, PORT: apiPort },
    stdio: "inherit",
    shell: true,
  },
);

console.log(`[Dev] Starting Vite frontend on port ${vitePort}...`);
const vite = spawn(
  "npx",
  [
    "vite",
    "--config",
    "artifacts/lead-catcher/vite.config.ts",
    "--host",
    "0.0.0.0",
    "--port",
    vitePort,
  ],
  {
    env: { ...process.env, PORT: vitePort, API_PORT: apiPort },
    stdio: "inherit",
    shell: true,
  },
);

const cleanup = () => {
  apiServer.kill();
  vite.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
