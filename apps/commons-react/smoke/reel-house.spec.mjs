import { test, expect } from "@playwright/test";

test("REEL House is an opt-in independent venue with honest playback boundaries", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#galactic-roundtable")).toBeVisible();
  await expect(page.locator("#more-bounce-entry")).toBeVisible();
  await expect(page.locator("#reel-house")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /REEL HOUSE/ })).toHaveAttribute("href", "#reel-house-entry");
  await page.getByRole("button", { name: /Enter REEL House/ }).click();
  const venue = page.locator("#reel-house");
  await expect(venue.getByRole("heading", { name: /REEL HOUSE/ })).toBeVisible();
  await expect(venue.getByRole("link", { name: /Open REEL Network/ })).toHaveAttribute(
    "href", "https://michaelwave369.github.io/ReelCommons/"
  );
  await expect(venue.locator("video")).toHaveCount(1);
  await expect(venue.locator("video")).not.toHaveAttribute("src", /\S/);
  await expect(venue.getByText(/not a live multi-visitor screening/)).toBeVisible();
  await venue.getByRole("button", { name: /Row 2, seat 3/ }).click();
  await expect(venue.getByText(/Selected: Row 2, seat 3/)).toBeVisible();
  await venue.getByRole("button", { name: /Leave REEL House/ }).click();
  await expect(page.locator("#reel-house")).toHaveCount(0);
  await expect(page.locator("#galactic-roundtable")).toBeVisible();
  await expect(page.locator("#more-bounce-entry")).toBeVisible();
});
