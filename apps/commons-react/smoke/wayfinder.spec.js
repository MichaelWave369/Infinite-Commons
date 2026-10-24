import { test, expect } from "@playwright/test";

test("Wayfinder inspects three documented public doors without automatic navigation or credential sharing", async ({ page }) => {
  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  await page.goto("./");
  await expect(page.getByRole("heading", { name: /From stories to places you can visit/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /WAYFINDER/ })).toBeVisible();
  await expect(page.getByText("LOCAL PASSPORT · 0 SAVED DOORS")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("commons.wayfinder.bookmarks.v0.2"))).toBeNull();

  for (const [name, expected] of [
    ["The Field Atlas", "https://michaelwave369.github.io/FieldAtlas/"],
    ["Field Constellation", "https://michaelwave369.github.io/FieldConstellation/"],
    ["The Nevora Codex", "https://michaelwave369.github.io/nevora-codex/"]
  ]) {
    await page.getByRole("button", { name: "Inspect " + name + " public doorway" }).click();
    const panel = page.getByRole("region", { name: name + " doorway handoff" });
    await expect(panel).toBeVisible();
    await expect(panel.getByText("OWNER-DOCUMENTED · UPTIME NOT CHECKED", { exact: false })).toBeVisible();
    const outgoing = panel.getByRole("link", { name: "Open " + name + " external website in a new tab" });
    await expect(outgoing).toHaveAttribute("href", expected);
    await expect(outgoing).toHaveAttribute("target", "_blank");
    await expect(outgoing).toHaveAttribute("rel", "noopener noreferrer");
    expect(page.url()).not.toContain(expected);
    await panel.getByRole("button", { name: /Back to Wayfinder/ }).click();
    await expect(panel).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
});

test("Wayfinder browser passport saves only on demand, supports share links and clearing", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Inspect The Field Atlas public doorway" }).click();
  await expect(page).toHaveURL(/wayfinder=field-atlas/);
  await page.getByRole("button", { name: "Bookmark on this browser" }).click();
  await expect(page.getByText("LOCAL PASSPORT · 1 SAVED DOOR")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove browser bookmark" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("commons.wayfinder.bookmarks.v0.2")))).toEqual(["field-atlas"]);
  await page.reload();
  await expect(page.getByRole("region", { name: "The Field Atlas doorway handoff" })).toBeVisible();
  await expect(page.getByText("LOCAL PASSPORT · 1 SAVED DOOR")).toBeVisible();
  await page.getByRole("button", { name: "Forget all bookmarks" }).click();
  await expect(page.getByText("LOCAL PASSPORT · 0 SAVED DOORS")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("commons.wayfinder.bookmarks.v0.2"))).toBeNull();
  await page.getByRole("button", { name: /Back to Wayfinder/ }).click();
  await expect(page).not.toHaveURL(/wayfinder=/);
});

test("Wayfinder rejects hostile or unknown URL selections, supports Back navigation and mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./?wayfinder=javascript%3Aalert(1)&wayfinder=field-atlas");
  await expect(page.getByRole("region", { name: /doorway handoff/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Inspect Field Constellation public doorway" }).click();
  await expect(page.getByRole("region", { name: "Field Constellation doorway handoff" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("region", { name: /doorway handoff/ })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
});
