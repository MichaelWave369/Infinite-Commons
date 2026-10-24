import { test, expect } from "@playwright/test";

test("nested chambers independently step through fifteen labeled fixtures and compare human questions", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("./");
  await page.getByRole("link", { name: /COUNCIL CHAMBERS/ }).click();
  await expect(page.getByRole("heading", { name: /Nested Council Chambers/ })).toBeVisible();

  const doors = page.getByRole("group", { name: "Choose a nested council chamber" });
  await expect(doors.getByRole("button")).toHaveCount(3);
  await expect(page.getByText("0 / 3")).toBeVisible();
  await page.getByRole("textbox", { name: "One question for all three chambers" })
    .fill("Can separate worlds exchange research without sharing credentials?");
  await page.getByRole("button", { name: "Convene three practice chambers →" }).click();
  await expect(page.getByRole("button", { name: "Compare the three chambers →" })).toBeDisabled();

  for (const [index, room, prompt] of [
    [0, "The Inquiry Chamber", "Which assumption should be tested before the next move?"],
    [1, "The Forge Chamber", "What failure would make this plan unsafe to ship?"],
    [2, "The Dreamwell Chamber", "Which invented idea deserves a prototype without being mistaken for fact?"]
  ]) {
    await doors.getByRole("button", { name: new RegExp(room) }).click();
    await expect(page.getByRole("heading", { name: room, exact: true })).toBeVisible();
    for (let turn = 0; turn < 5; turn++) {
      await page.getByRole("button", { name: "Hear next " + room + " seat →" }).click();
    }
    const transcript = page.getByRole("log", { name: room + " offline council transcript" });
    await expect(transcript.locator(".chamber-entry")).toHaveCount(5);
    await expect(transcript.locator(".chamber-evidence")).toHaveCount(5);
    await expect(transcript.getByText("OFFLINE FIXTURE", { exact: false })).toHaveCount(5);
    await expect(page.getByRole("button", { name: "Compare the three chambers →" })).toBeDisabled();

    await page.getByRole("textbox", { name: prompt }).fill("Who can independently verify " + room + "?");
    await page.getByRole("button", { name: "Submit operator review question" }).click();
    await expect(page.getByText("OPERATOR QUESTION · NOT INDEPENDENTLY VERIFIED")).toBeVisible();
    await page.getByRole("button", { name: "Close " + room + " practice session" }).click();
    await expect(page.getByText("CHAMBER REVIEWED · LOCAL PRACTICE DOSSIER")).toBeVisible();
    await expect(page.getByText((index + 1) + " / 3")).toBeVisible();
  }

  await page.getByRole("button", { name: "Compare the three chambers →" }).click();
  const panel = page.getByRole("region", { name: "Three chamber practice comparison" });
  await expect(panel).toBeVisible();
  await expect(panel.locator("article")).toHaveCount(3);
  await expect(panel.getByText("SCRIPTED COMPARISON ONLY", { exact: false })).toBeVisible();
  await expect(page.getByText("STATIONNNNN!!!")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Convene three practice chambers →" })).toBeVisible();
  await expect(page.getByText("0 / 3")).toBeVisible();
  expect(errors).toEqual([]);
});

test("switching rooms preserves offline seat progression; reset clears operator notes on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await page.getByRole("button", { name: "Convene three practice chambers →" }).click();
  const doors = page.getByRole("group", { name: "Choose a nested council chamber" });
  await page.getByRole("button", { name: "Hear next The Inquiry Chamber seat →" }).click();
  await doors.getByRole("button", { name: /The Forge Chamber/ }).click();
  await expect(page.getByRole("log", { name: "The Forge Chamber offline council transcript" })
    .locator(".chamber-entry")).toHaveCount(0);
  await doors.getByRole("button", { name: /The Inquiry Chamber/ }).click();
  await expect(page.getByRole("log", { name: "The Inquiry Chamber offline council transcript" })
    .locator(".chamber-entry")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Compare the three chambers →" })).toBeDisabled();
  await page.getByRole("button", { name: "Discard all local chamber sessions" }).click();
  await expect(page.getByRole("button", { name: "Convene three practice chambers →" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Knights of the Nested Roundtables/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Convene five seats" })).toBeVisible();
});
