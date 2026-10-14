import {test,expect} from "@playwright/test";

test("Third Light Array is opt-in visual simulation and preserves original navigation",async({page},info)=>{
  test.setTimeout(75_000);
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("./");
  const scene=page.locator(".scene-frame");
  await expect(page.getByRole("button",{name:/Activate Signal Halo/})).toHaveCount(0);
  await page.getByRole("button",{name:/Explore Shasta Campus 3D/}).click();
  if(await scene.getAttribute("data-renderer")==="webgl2"){
    await expect(scene.locator("canvas")).toBeVisible({timeout:20_000});
    const control=page.getByRole("button",{name:/Activate Signal Halo/});
    await expect(control).toBeVisible();
    await expect(control).toHaveAttribute("aria-pressed","false");
    await page.screenshot({path:"test-results/third-light-quiet.png",animations:"disabled",timeout:15_000});
    await control.click();
    const signal=page.getByRole("button",{name:/Return to Quiet Beacon/});
    await expect(signal).toHaveAttribute("aria-pressed","true");
    await page.screenshot({path:"test-results/third-light-signal.png",animations:"disabled",timeout:15_000});
    await page.getByRole("button",{name:/Legacy Living City/}).click();
    await expect(signal).toHaveCount(0);
    await page.getByRole("button",{name:/Sisters of Shasta/}).click();
    await expect(signal).toBeVisible();
    await signal.click();
    await expect(page.getByRole("button",{name:/Activate Signal Halo/})).toHaveAttribute("aria-pressed","false");
    await page.getByRole("button",{name:/Return to Painted View/}).click();
  } else {
    info.annotations.push({type:"gpu-fallback",description:"WebGL2 context unavailable; manual desktop scene comparison still required."});
  }
  await expect(scene).toHaveAttribute("data-renderer","painted");
  await page.getByRole("button",{name:/Visit offline sample BBS Lounge/}).click();
  await expect(page.getByRole("heading",{name:"The BBS Lounge"})).toBeVisible();
  expect(errors).toEqual([]);
});

test.use({reducedMotion:"reduce"});
test("reduced-motion users can still select signal and quiet static modes",async({page})=>{
  await page.goto("./");
  await page.getByRole("button",{name:/Explore Shasta Campus 3D/}).click();
  const scene=page.locator(".scene-frame");
  if(await scene.getAttribute("data-renderer")==="webgl2"){
    await page.getByRole("button",{name:/Activate Signal Halo/}).click();
    await expect(page.getByRole("button",{name:/Return to Quiet Beacon/})).toBeVisible();
    await page.getByRole("button",{name:/Return to Painted View/}).click();
  }
  await expect(scene).toHaveAttribute("data-renderer","painted");
});
