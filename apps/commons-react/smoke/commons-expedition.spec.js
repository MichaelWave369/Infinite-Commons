import { test, expect } from "@playwright/test";

test("guided four-world trail records only inspected local stories, then reaches the Grand Roundtable", async ({ page }) => {
  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  await page.goto("./");

  await expect(page.getByRole("heading", { name: /A journey through the worlds/ })).toBeVisible();
  await expect(page.getByText("0 / 4")).toBeVisible();
  await expect(page.getByText("STATIONNNNN!!!")).toHaveCount(0);
  await page.getByRole("button", { name: "Begin the five-stop expedition →" }).click();

  const waypoint = page.getByRole("region", { name: "Current expedition waypoint" });
  const stopNames = ["ΞΦWorld", "Nevora", "BLACKOUT", "Mikey & Ori"];
  await expect(waypoint.getByRole("button", { name: "Continue to the next threshold →" })).toBeDisabled();

  for (let i = 0; i < stopNames.length; i += 1) {
    await expect(waypoint).toContainText(stopNames[i]);
    await waypoint.getByRole("button", { name: "Inspect this story window ↗" }).click();
    const preview = page.getByRole("region", { name: stopNames[i] + " story preview" });
    await expect(preview).toBeVisible();
    await expect(preview).toBeFocused();
    await expect(page.getByText((i + 1) + " / 4")).toBeVisible();
    await preview.getByRole("button", { name: /Return to Portal Plaza/ }).click();
    await expect(waypoint.getByRole("button", { name: "Continue to the next threshold →" })).toBeEnabled();
    await waypoint.getByRole("button", { name: "Continue to the next threshold →" }).click();
  }

  await expect(waypoint).toContainText("The Fifth Threshold");
  await expect(waypoint.getByRole("link", { name: /Enter the Grand Roundtable Hall/ })).toHaveAttribute("href", "#roundtable-hall");
  await waypoint.getByRole("link", { name: /Enter the Grand Roundtable Hall/ }).click();
  await expect(page).toHaveURL(/#roundtable-hall/);
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
  await waypoint.getByRole("button", { name: "Complete this local expedition ✳" }).click();
  await expect(page.getByText("Expedition complete. The Commons remembers this moment.")).toBeVisible();
  await expect(page.getByText("commons.expedition.session-only.v0.4")).toBeVisible();
  await expect(page.getByText("STATIONNNNN!!!")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Begin the five-stop expedition →" })).toBeVisible();
  await expect(page.getByText("0 / 4")).toBeVisible();
  expect(errors).toEqual([]);
});

test("ordinary portal preview advances only current expedition stop, on a narrow mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: "Begin the five-stop expedition →" }).click();

  await page.getByRole("button", { name: "Preview Nevora original world" }).click();
  await expect(page.getByRole("region", { name: "Nevora story preview" })).toBeVisible();
  await expect(page.getByText("0 / 4")).toBeVisible();
  await page.getByRole("button", { name: /Return to Portal Plaza/ }).click();

  await page.getByRole("button", { name: "Preview ΞΦWorld original world" }).click();
  await expect(page.getByText("1 / 4")).toBeVisible();
  await page.getByRole("button", { name: /Return to Portal Plaza/ }).click();

  await page.getByRole("region", { name: "Current expedition waypoint" })
    .getByRole("button", { name: "End this expedition" }).click();
  await expect(page.getByRole("button", { name: "Begin the five-stop expedition →" })).toBeVisible();
  await expect(page.getByText("0 / 4")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Midnight Sierra" })).toBeVisible();
});
