import { test, expect } from "@playwright/test";

test("3D portal courtyard is opt-in; all HTML story gateways remain available in painted mode", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer", "painted");
  await expect(page.getByRole("button", { name: /Explore Portal Courtyard 3D/ })).toBeVisible();
  await page.getByRole("button", { name: "Preview ΞΦWorld original world" }).click();
  await expect(page.getByRole("region", { name: "ΞΦWorld story preview" })).toBeVisible();
  await expect(page.locator("#portal-story-window")).toBeFocused();
  await page.getByRole("button", { name: /Return to Portal Plaza/ }).click();
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
});

test("four accessible 3D gateway controls route to the same canonical story panels without navigating", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: /Explore Portal Courtyard 3D/ }).click();
  const current = page.locator(".scene-frame");
  await expect.poll(async () => {
    const mode = await current.getAttribute("data-renderer");
    if (mode !== "webgl2") return "fallback";
    const canvas = page.locator(".scene-frame canvas");
    return await canvas.count() ? "ready" : "pending";
  }, { timeout: 20000 }).toMatch(/ready|fallback/);

  if (await current.getAttribute("data-renderer") === "webgl2") {
    await expect(page.getByRole("button", { name: /Portal Courtyard/ })).toHaveAttribute("aria-pressed", "true");
    const controls = page.getByRole("group", { name: "Explore the four original story gateways" });
    await expect(controls.getByRole("button")).toHaveCount(4);
    for (const name of ["ΞΦWorld", "Nevora", "BLACKOUT", "Mikey & Ori"]) {
      await controls.getByRole("button", { name: "Open " + name + " story preview from 3D courtyard" }).click();
      const preview = page.getByRole("region", { name: name + " story preview" });
      await expect(preview).toBeVisible();
      await expect(preview).toBeFocused();
      await preview.getByRole("button", { name: /Return to Portal Plaza/ }).click();
      await expect(preview).toHaveCount(0);
    }
    await controls.getByRole("link", { name: /Visit the Grand Roundtable/ }).click();
    await expect(page).toHaveURL(/#roundtable-hall/);
    await page.getByRole("button", { name: /Legacy Living City/ }).click();
    // Switching the heavy canvas can lose WebGL on headless CI GPUs.
    // The safe painted fallback is an intentional supported outcome.
    if (await current.getAttribute("data-renderer") === "webgl2") {
      await expect(page.getByRole("button", { name: /Legacy Living City/ })).toHaveAttribute("aria-pressed", "true");
      await page.getByRole("button", { name: /Sisters of Shasta/ }).click();
      if (await current.getAttribute("data-renderer") === "webgl2") {
        await expect(page.getByRole("button", { name: /Sisters of Shasta/ })).toHaveAttribute("aria-pressed", "true");
        await page.getByRole("button", { name: /Return to Painted View/ }).click();
      }
    }
    await expect(current).toHaveAttribute("data-renderer", "painted");
  } else {
    await expect(page.getByText(/WebGL 2 unavailable/)).toBeVisible();
    await page.getByRole("button", { name: "Preview Nevora original world" }).click();
    await expect(page.getByRole("region", { name: "Nevora story preview" })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("Portal Courtyard keeps the same controls accessible on mobile and disappears in other visual packs", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("button", { name: /Explore Portal Courtyard 3D/ })).toBeVisible();
  await page.getByRole("button", { name: /Switch to Cloudgarden/ }).click();
  await expect(page.getByRole("button", { name: /Explore Portal Courtyard 3D/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Preview BLACKOUT original world" }).click();
  await expect(page.getByRole("region", { name: "BLACKOUT story preview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cloudgarden" })).toBeVisible();
});
