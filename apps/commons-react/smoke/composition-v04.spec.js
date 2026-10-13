import { test, expect } from "@playwright/test";

test("Midnight Sierra v0.4 keeps a working 3D toggle, doors and painted fallback", async ({ page }, info) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("./");
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
  await page.getByRole("button", { name: /Explore Living City 3D/ }).click();

  const scene = page.locator(".scene-frame");
  const mode = await scene.getAttribute("data-renderer");
  if (mode === "webgl2") {
    // Screenshot is a review artifact, not proof that aesthetics are beautiful.
    await expect(scene.locator("canvas")).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(1100);
    await page.screenshot({ path: "test-results/midnight-sierra-v04.png", fullPage: true });
    await page.getByRole("button", { name: /Return to Painted View/ }).click();
    await expect(scene).toHaveAttribute("data-renderer", "painted");
  } else {
    info.annotations.push({ type: "gpu-fallback", description: "No WebGL2 context in CI; visually review on desktop hardware." });
    await expect(scene).toHaveAttribute("data-renderer", "painted");
  }
  await page.getByRole("button", { name: /Visit offline sample BBS Lounge/ }).click();
  await expect(page.getByRole("heading", { name: "The BBS Lounge" })).toBeVisible();
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: /example or locally selected PhiSpace/ }).click();
  await expect(page.getByRole("heading", { name: "The Lantern Room" })).toBeVisible();
  expect(errors).toEqual([]);
});
