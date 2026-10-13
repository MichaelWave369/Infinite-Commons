import { test, expect } from "@playwright/test";

test("production React Pages entry actually renders instead of a blue blank screen", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto("./", { waitUntil: "networkidle" });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Change the world/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "↔ Switch to Cloudgarden" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Preview a local PhiSpace JSON/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test("theme switch and Commons/BBS/PhiSpace interactions survive the built JS", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("button", { name: "↔ Switch to Cloudgarden" }).click();
  await expect(page.getByRole("heading", { name: "Cloudgarden" })).toBeVisible();
  await expect(page.locator(".scene-frame")).toHaveAttribute("data-scene", "floating");

  await page.getByRole("button", { name: /Visit offline sample BBS Lounge/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "The BBS Lounge" })).toBeVisible();
  await page.getByRole("button", { name: "Close panel" }).click();

  await page.getByRole("button", { name: /example or locally selected PhiSpace/ }).click();
  await expect(page.getByRole("heading", { name: "The Lantern Room" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("React app works on a narrow/mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to Cloudgarden/ })).toBeVisible();
  await page.getByRole("button", { name: /Switch to Cloudgarden/ }).click();
  await expect(page.getByRole("heading", { name: "Cloudgarden" })).toBeVisible();
});
