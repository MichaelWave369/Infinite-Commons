import { test, expect } from "@playwright/test";

test("More Bounce lazy club is opt-in and keeps canonical Commons sections", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#galactic-roundtable")).toBeVisible();
  await expect(page.locator("#more-bounce-entry")).toBeVisible();
  await expect(page.locator("#more-bounce-club")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /MORE BOUNCE/ })).toHaveAttribute("href", "#more-bounce-entry");
  await page.getByRole("button", { name: /Enter More Bounce/ }).click();
  const venue = page.locator("#more-bounce-club");
  await expect(venue.getByRole("heading", { name: /MORE BOUNCE/ })).toBeVisible();
  await expect(venue.getByRole("link", { name: /Open original Backspin/ })).toHaveAttribute(
    "href", "https://michaelwave369.github.io/MoreBounceLabs/backspin.html"
  );
  // Local preview host is NOT the approved production origin; no silent cross-origin iframe.
  await expect(venue.locator("iframe")).toHaveCount(0);
  await expect(venue.getByRole("link", { name: /Use the standalone DJ booth/ })).toBeVisible();
  await expect(venue.getByText(/No live avatars, guests, public audio broadcast/)).toBeVisible();
  await venue.getByRole("button", { name: "Leave the venue" }).click();
  await expect(venue.locator("canvas")).toHaveCount(0);
  await expect(page.locator("#galactic-roundtable")).toBeVisible();
});
