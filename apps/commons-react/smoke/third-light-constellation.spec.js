import {test,expect} from "@playwright/test";

test("Trihelion constellation show/close controls preserve existing modes",async({page},info)=>{
  test.setTimeout(75_000);
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto("./");
  await expect(page.getByRole("button",{name:/Show Constellation/})).toHaveCount(0);
  await page.getByRole("button",{name:/Explore Shasta Campus 3D/}).click();
  const scene=page.locator(".scene-frame");
  if(await scene.getAttribute("data-renderer")==="webgl2"){
    await expect(scene.locator("canvas")).toBeVisible({timeout:20_000});
    const show=page.getByRole("button",{name:/Show Constellation/});
    await expect(show).toHaveAttribute("aria-pressed","false");
    await show.click();
    const close=page.getByRole("button",{name:/Close Constellation/});
    await expect(close).toHaveAttribute("aria-pressed","true");
    await expect(page.getByText(/NOT A HISTORICAL SKY RECONSTRUCTION/)).toBeVisible();
    await page.screenshot({path:"test-results/third-light-constellation.png",animations:"disabled",timeout:15_000});
    await close.click();
    await expect(show).toHaveAttribute("aria-pressed","false");
    await page.getByRole("button",{name:/Activate Signal Halo/}).click();
    await expect(page.getByRole("button",{name:/Return to Quiet Beacon/})).toBeVisible();
    await page.getByRole("button",{name:/Return to Painted View/}).click();
  } else {
    info.annotations.push({type:"gpu-fallback",description:"No WebGL2; visual acceptance requires separate real-device check."});
  }
  await expect(scene).toHaveAttribute("data-renderer","painted");
  expect(errors).toEqual([]);
});

test.describe("reduced motion",()=>{
  test.use({reducedMotion:"reduce"});
  test("Constellation can be selected without requiring animation",async({page})=>{
    await page.goto("./");
    await page.getByRole("button",{name:/Explore Shasta Campus 3D/}).click();
    if(await page.locator(".scene-frame").getAttribute("data-renderer")==="webgl2"){
      await page.getByRole("button",{name:/Show Constellation/}).click();
      await expect(page.getByRole("button",{name:/Close Constellation/})).toBeVisible();
      await page.getByRole("button",{name:/Return to Painted View/}).click();
    }
    await expect(page.locator(".scene-frame")).toHaveAttribute("data-renderer","painted");
  });
});
