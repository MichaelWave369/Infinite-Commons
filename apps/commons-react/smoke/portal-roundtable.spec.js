import { test, expect } from "@playwright/test";

test("Portal Plaza is accessible, previews all four worlds, and never leaves Commons", async ({ page }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { name: /A thousand worlds/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /WORLD PORTALS/ })).toBeVisible();

  for (const [name, heading] of [
    ["ΞΦWorld", "You glimpse ΞΦWorld"],
    ["Nevora", "You glimpse Nevora"],
    ["BLACKOUT", "You glimpse BLACKOUT"],
    ["Mikey & Ori", "You glimpse Mikey & Ori"]
  ]) {
    await page.getByRole("button", { name: "Preview " + name + " original world" }).click();
    const preview = page.getByRole("region", { name: name + " story preview" });
    await expect(preview.getByRole("heading", { name: heading })).toBeVisible();
    await expect(preview.getByText("This is an original in-page vignette.", { exact: false })).toBeVisible();
    await preview.getByRole("button", { name: /Return to Portal Plaza/ }).click();
    await expect(preview).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  expect(new URL(page.url()).pathname).toMatch(/\/$/);
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
});

test("Roundtable convenes five offline seats, then STATION seals only a local ceremony", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: /GRAND ROUNDTABLE/ }).click();
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
  await page.getByRole("textbox", { name: "The question before the table" }).fill("Is everybody independently governed?");
  await page.getByRole("button", { name: "Convene five seats" }).click();
  await expect(page.getByRole("button", { name: /STATION and close/ })).toBeDisabled();

  for (let i = 0; i < 5; i += 1) {
    await page.getByRole("button", { name: "Hear next council seat →" }).click();
  }
  await expect(page.getByText("5 / 5 FIXTURE TURNS")).toBeVisible();
  await expect(page.getByRole("button", { name: /STATION and close/ })).toBeEnabled();
  await page.getByRole("button", { name: /STATION and close/ }).click();
  await expect(page.getByText("STATIONNNNN!!!")).toBeVisible();
  await expect(page.getByText("LOCAL CEREMONY ONLY · NO NETWORK · NO AUTHORIZATION")).toBeVisible();
  await expect(page.getByText("commons.station.local-ceremony.v0.1")).toBeVisible();
  await page.reload();
  await expect(page.getByText("STATIONNNNN!!!")).toHaveCount(0);
});

test("Portal Plaza and Roundtable remain accessible on narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: "Preview Nevora original world" }).click();
  await expect(page.getByRole("heading", { name: "You glimpse Nevora" })).toBeVisible();
  await page.getByRole("button", { name: /Return to Portal Plaza/ }).click();
  await page.getByRole("button", { name: "Convene five seats" }).click();
  await expect(page.getByRole("button", { name: /STATION and close/ })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
});
