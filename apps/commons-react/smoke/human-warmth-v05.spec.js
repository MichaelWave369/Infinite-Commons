import { test, expect } from "@playwright/test";

test("painted view still loads, 3D story interaction is optional, and original doors work", async ({ page }, info) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("./");
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
  await expect(page.getByRole("button", { name: /Tune the fictional Midnight Radio/ })).toHaveCount(0);

  await page.getByRole("button", { name: /Explore Living City 3D/ }).click();
  const scene = page.locator(".scene-frame");
  if (await scene.getAttribute("data-renderer") === "webgl2") {
    await expect(scene.locator("canvas")).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole("button", { name: /Tune the fictional Midnight Radio/ })).toBeVisible();
    await page.getByRole("button", { name: /Tune the fictional Midnight Radio/ }).click();
    await expect(page.getByRole("heading", { name: "The Midnight Frequency" })).toBeVisible();
    await expect(page.getByText(/not an actual radio stream/i)).toBeVisible();
    await page.getByRole("button", { name: "Close panel" }).click();

    await page.screenshot({ path: "test-results/midnight-sierra-v05.png", fullPage: true });
    await page.getByRole("button", { name: /Return to Painted View/ }).click();
  } else {
    info.annotations.push({ type: "gpu-fallback", description: "WebGL2 unavailable in this CI environment; use desktop visual review." });
  }
  await expect(scene).toHaveAttribute("data-renderer", "painted");
  await expect(page.getByRole("button", { name: /Tune the fictional Midnight Radio/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Visit offline sample BBS Lounge/ }).click();
  await expect(page.getByRole("heading", { name: "The BBS Lounge" })).toBeVisible();
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: /example or locally selected PhiSpace/ }).click();
  await expect(page.getByRole("heading", { name: "The Lantern Room" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced motion keeps all interactions while leaving the scene optional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
  await page.getByRole("button", { name: /Switch to Cloudgarden/ }).click();
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-scene", "floating");
  await expect(page.getByRole("button", { name: /Tune the fictional Midnight Radio/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Switch to Midnight Sierra/ }).click();
  await expect(page.getByRole("button", { name: /Explore Living City 3D/ })).toBeVisible();
});
