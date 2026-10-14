import {test,expect} from "@playwright/test";

test("Heritage Archive is owner-curated metadata only and closes accessibly",async({page},info)=>{
  test.setTimeout(75000);
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("./");
  await expect(page.getByRole("button",{name:/Explore Heritage Archive/})).toHaveCount(0);
  await page.getByRole("button",{name:/Explore Shasta Campus 3D/}).click();
  const scene=page.locator(".scene-frame");
  if(await scene.getAttribute("data-renderer")==="webgl2"){
    const trigger=page.getByRole("button",{name:/Explore Heritage Archive/});
    await expect(trigger).toBeVisible();
    await trigger.click();
    const dialog=page.getByRole("dialog",{name:/Heritage Archive/});
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("article")).toHaveCount(3);
    await expect(dialog.getByText("Larrina / Koramya SIGL")).toBeVisible();
    await expect(dialog.getByText(/Original design by Helion/)).toBeVisible();
    await expect(dialog.getByText(/Original conversations, original blueprints and private memories have not been imported/)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole("button",{name:/Close Heritage Archive/}).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("button",{name:/Legacy Living City/}).click();
    await expect(trigger).toHaveCount(0);
    await page.getByRole("button",{name:/Return to Painted View/}).click();
  }else{
    info.annotations.push({type:"gpu-fallback",description:"No WebGL2 available: manually validate dialog in a desktop browser."});
  }
  await expect(scene).toHaveAttribute("data-renderer","painted");
  await page.getByRole("button",{name:/Visit offline sample BBS Lounge/}).click();
  await expect(page.getByRole("heading",{name:"The BBS Lounge"})).toBeVisible();
  expect(errors).toEqual([]);
});
