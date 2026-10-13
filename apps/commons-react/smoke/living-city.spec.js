import { test, expect } from "@playwright/test";

test("3D is opt-in and classic view remains the default", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("./");
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
  await expect(page.getByRole("button", { name: /Explore Living City 3D/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Visit offline sample BBS Lounge/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("opt-in 3D remains reversible and cannot break semantic doorways", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Explore Living City 3D/ }).click();
  // Some CI headless GPUs do not support a WebGL2 context. Both outcomes
  // must be graceful. In a GPU-enabled browser, a 3D canvas is displayed.
  const current = page.locator(".scene-frame");
  await expect.poll(async () => {
    const mode = await current.getAttribute("data-renderer");
    if (mode === "webgl2") {
      const canvas = page.locator(".scene-frame canvas");
      return (await canvas.count()) ? "ready" : "pending";
    }
    return "fallback";
  }, { timeout: 20000 }).toMatch(/ready|fallback/);
  if (await current.getAttribute("data-renderer") === "webgl2") {
    await expect(page.getByRole("button", { name: /Return to Painted View/ })).toBeVisible();
    await page.getByRole("button", { name: /Return to Painted View/ }).click();
  }
  await expect(current).toHaveAttribute("data-renderer", "painted");
  await page.getByRole("button", { name: /Visit offline sample BBS Lounge/ }).click();
  await expect(page.getByRole("heading", { name: "The BBS Lounge" })).toBeVisible();
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: /example or locally selected PhiSpace/ }).click();
  await expect(page.getByRole("heading", { name: "The Lantern Room" })).toBeVisible();
});

test("3D control is only offered in Midnight Sierra for this milestone", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Switch to Cloudgarden/ }).click();
  await expect(page.getByRole("heading", { name: "Cloudgarden" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Explore Living City 3D/ })).toHaveCount(0);
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
});
