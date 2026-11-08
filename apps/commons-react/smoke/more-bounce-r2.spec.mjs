import { test, expect } from "@playwright/test";

test("Rung 2 arcade and OverStrings opt-in work without Backspin audio or XR", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Enter More Bounce/ }).click();
  const venue = page.locator("#more-bounce-club");
  await expect(venue.getByRole("heading", { name: "Breakbeat Reaction Cabinet" })).toBeVisible();
  const hand = venue.getByRole("checkbox", { name: /Enable experimental OverStrings/ });
  await expect(hand).not.toBeChecked();
  await hand.check();
  await expect(hand).toBeChecked();
  await hand.uncheck();
  await expect(hand).not.toBeChecked();
  const challenge = venue.getByRole("button", { name: "Start challenge" });
  await challenge.click();
  await expect(venue.getByRole("button", { name: "TAP / CUT" })).toBeEnabled();
  await expect(venue.getByText(/crate roulette/i)).toBeVisible();
  await venue.getByRole("button", { name: "TAP / CUT" }).click();
  await expect(venue.getByText(/Too early|Good|Perfect|Missed beat/)).toBeVisible();
  await venue.getByRole("button", { name: "Leave the venue" }).click();
  await expect(venue.getByRole("button", { name: "TAP / CUT" })).toHaveCount(0);
  await expect(page.locator("#galactic-roundtable")).toBeVisible();
});
