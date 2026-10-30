import { test, expect } from "@playwright/test";

test("living council seat dials, modes, focus and rings keep proper authority boundaries", async ({ page }) => {
  await page.goto("./");
  const hall = page.locator("#galactic-roundtable");
  await expect(hall).toBeVisible();
  const seats = hall.locator(".galactic-seat");
  await expect(seats).toHaveCount(12);

  await seats.first().click();
  const dial = hall.locator("#galactic-seat-dial");
  await expect(dial).toBeVisible();
  await expect(dial.getByText("The Dreamer")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close seat controls" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dial).toHaveCount(0);
  await expect(seats.first()).toBeFocused();

  await hall.getByRole("button", { name: "Xi Table" }).click();
  await expect(hall.getByText(/DISCONNECTED PREVIEW/)).toBeVisible();
  await seats.first().click();
  await expect(dial.getByText(/No authenticated Xi participant/)).toBeVisible();
  await expect(dial.getByText("The Dreamer")).toHaveCount(0);
  await hall.getByRole("button", { name: "Close seat controls" }).click();

  await hall.getByRole("button", { name: "Next twelve-seat ring" }).click();
  await expect(seats).toHaveCount(12);
  await expect(hall.getByText("RING 02 / 08")).toBeVisible();
  await expect(seats.first()).toHaveAttribute("aria-label", /Seat 13: Unassigned seat/);
  await hall.getByRole("button", { name: "Commons Council" }).click();
  await expect(hall.getByText("RING 01 / 08")).toBeVisible();
  await expect(seats.first()).toHaveAttribute("aria-label", /The Dreamer/);
});

test("narrow viewport preserves calibrated art-to-seat geometry and docked dial", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("./");
  const hall = page.locator("#galactic-roundtable");
  const stage = hall.locator(".galactic-stage");
  const scroller = hall.locator(".galactic-stage-wrap");
  await expect(hall.locator(".galactic-seat")).toHaveCount(12);
  const dimensions = await stage.evaluate(el => ({ width: el.clientWidth, height: el.clientHeight }));
  expect(dimensions.width).toBeGreaterThanOrEqual(760);
  expect(Math.abs(dimensions.width / dimensions.height - 1672 / 941)).toBeLessThan(.03);
  expect(await scroller.evaluate(el => el.scrollWidth > el.clientWidth)).toBeTruthy();
  await hall.locator(".galactic-seat").first().click();
  await expect(hall.locator("#galactic-seat-dial")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  const animated = await hall.locator(".galactic-heart").evaluate(el => getComputedStyle(el).animationName);
  expect(animated).toBe("none");
});
