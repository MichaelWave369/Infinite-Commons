import {test, expect} from "@playwright/test";
test("Sisters of Shasta is an opt-in visual-only scene and legacy Commons survives",async({page},info)=>{
  test.setTimeout(75000);
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("./");
  const scene=page.locator(".scene-frame");
  await expect(scene).toHaveAttribute("data-renderer","painted");
  await page.getByRole("button",{name:/Explore Shasta Campus 3D/}).click();
  if (await scene.getAttribute("data-renderer")==="webgl2"){
    await expect(scene.locator("canvas")).toBeVisible({timeout:20000});
    await expect(page.getByText(/Three · Six · Nine · Root Temple/)).toBeVisible();
    await page.screenshot({path:"test-results/shasta-v01-browser.png",animations:"disabled",timeout:15000});
    await page.getByRole("button",{name:/Legacy Living City/}).click();
    await expect(page.getByText("A thousand windows. A thousand stories.")).toBeVisible();
    await page.getByRole("button",{name:/Sisters of Shasta/}).click();
    await page.getByRole("button",{name:/Return to Painted View/}).click();
  } else {
    info.annotations.push({type:"gpu-fallback",description:"No WebGL2 in CI; a desktop skyline screenshot remains required."});
  }
  await expect(scene).toHaveAttribute("data-renderer","painted");
  await page.getByRole("button",{name:/Visit offline sample BBS Lounge/}).click();
  await expect(page.getByRole("heading",{name:"The BBS Lounge"})).toBeVisible();
  expect(errors).toEqual([]);
});
