import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173/Infinite-Commons/";
export default defineConfig({
  testDir: "./smoke",
  timeout: 30_000,
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure"
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000
  }
});
