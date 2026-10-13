import { test, expect } from "@playwright/test";

test("architectural soul preserves painted fallback and moves radio toward its table", async ({ page }, info) => {
  test.setTimeout(75_000);
  const pageErrors = [];
  page.on("pageerror", err => pageErrors.push(err.message));
  await page.goto("./");
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
  await page.getByRole("button", { name: /Explore Living City 3D/ }).click();

  const scene = page.locator(".scene-frame");
  if (await scene.getAttribute("data-renderer") === "webgl2") {
    await expect(scene.locator("canvas")).toBeVisible({ timeout: 20_000 });
    const radio = page.getByRole("button", { name: /Tune the fictional Midnight Radio/ });
    const bbs = page.getByRole("button", { name: /Visit offline sample BBS Lounge/ });
    await expect(radio).toBeVisible();
    await expect(bbs).toBeVisible();
    const radioBox = await radio.boundingBox();
    const bbsBox = await bbs.boundingBox();
    expect(radioBox).not.toBeNull();
    expect(bbsBox).not.toBeNull();
    // The radio button should be left of the BBS plaque, near the table.
    expect(radioBox.x + radioBox.width + 6).toBeLessThan(bbsBox.x);

    await radio.click();
    await expect(page.getByRole("heading", { name: "The Midnight Frequency" })).toBeVisible();
    await page.getByRole("button", { name: "Close panel" }).click();

    await page.screenshot({
      path: "test-results/midnight-sierra-v06.png",
      fullPage: false,
      animations: "disabled",
      timeout: 15_000
    });
    await page.getByRole("button", { name: /Return to Painted View/ })
      .click({ force: true, timeout: 15_000 });
  } else {
    info.annotations.push({ type: "gpu-fallback",
      description: "CI WebGL2 context unavailable; inspect screenshot on a desktop." });
  }

  await expect(scene).toHaveAttribute("data-renderer", "painted");
  await page.getByRole("button", { name: /Visit offline sample BBS Lounge/ }).click();
  await expect(page.getByRole("heading", { name: "The BBS Lounge" })).toBeVisible();
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: /example or locally selected PhiSpace/ }).click();
  await expect(page.getByRole("heading", { name: "The Lantern Room" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("Cloudgarden stays painted and no extra shared world locations appear", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Switch to Cloudgarden/ }).click();
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
  await expect(page.getByRole("button", { name: /Explore Living City 3D/ })).toHaveCount(0);
  await expect(page.locator("#world-heading")).toHaveText("Cloudgarden");
  await expect(page.getByText("4 FIXED")).toBeVisible();
});
