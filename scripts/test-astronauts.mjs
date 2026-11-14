import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const userDir = mkdtempSync(join(tmpdir(), "astralis-astronauts-"));
const browser = spawn("/repl/tools/bin/chromium", [
  "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--ignore-certificate-errors",
  "--remote-allow-origins=*", "--remote-debugging-port=9339",
  `--user-data-dir=${userDir}`, "--window-size=1440,1000", "about:blank"
], { stdio: "ignore" });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const pending = new Map(), errors = [];
let socket, nextId = 0;
function cdp(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(expression, description) {
  for (let i = 0; i < 150; i++) {
    const value = await evaluate(`Boolean(${expression})`);
    if (value) return value;
    await sleep(150);
  }
  throw new Error(`Not ready: ${description}`);
}
function assert(value, description) { if (!value) throw new Error(description); }
async function click(selector, index = 0) {
  // HTMLElement.click dispatches the same React action without viewport scrolling
  // changing the Phaser canvas geometry during the exhibit regression.
  return evaluate(`(() => { const node = document.querySelectorAll(${JSON.stringify(selector)})[${index}]; if (!node || node.disabled) throw new Error('Unavailable control: ' + ${JSON.stringify(selector)}); node.click(); return node.innerText; })()`);
}
async function clickText(text, selector = "button") {
  const index = await evaluate(`[...document.querySelectorAll(${JSON.stringify(selector)})].findIndex(node => node.innerText.includes(${JSON.stringify(text)}))`);
  assert(index >= 0, `Missing control: ${text}`);
  return click(selector, index);
}
async function press(key, ms = 180) {
  const upper = key.toUpperCase(), code = key === "Escape" ? "Escape" : `Key${upper}`;
  const keyCode = key === "Escape" ? 27 : upper.charCodeAt(0);
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: keyCode });
  await sleep(ms);
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: keyCode });
  await sleep(100);
}
const ready = async () => {
  await waitFor(`document.querySelector('.game-canvas[data-ready="true"]')`, "Phaser scene");
  // Read the real scene ref through React's development fiber; keep test
  // instrumentation out of the production application.
  await evaluate(`(() => { window.__testScene = () => { const element = document.querySelector('.game-canvas'); let fiber = element[Object.keys(element).find(key => key.startsWith('__reactFiber'))]; while (fiber && !fiber.memoizedProps?.sceneRef) fiber = fiber.return; return fiber.memoizedProps.sceneRef.current; }; return true; })()`);
};
async function capture(name, fullPage = false) {
  mkdirSync("generated-artifacts/astronaut-tests", { recursive: true });
  let result;
  if (fullPage) {
    const metrics = await cdp("Page.getLayoutMetrics");
    const size = metrics.cssContentSize ?? metrics.contentSize;
    result = await cdp("Page.captureScreenshot", {
      format: "jpeg", quality: 85, captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: size.width, height: size.height, scale: 1 }
    });
  } else {
    result = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 85 });
  }
  writeFileSync(`generated-artifacts/astronaut-tests/${name}.jpg`, Buffer.from(result.data, "base64"));
}
async function resumeFixture(value) {
  await evaluate(`localStorage.setItem('astralis-progress-v1',${JSON.stringify(JSON.stringify(value))})`);
  await cdp("Page.reload");
  await waitFor(`document.querySelector('.astralis-welcome__enter')`, "welcome");
  await click(".astralis-welcome__enter");
}
async function checkDirections(id) {
  await sleep(250);
  for (const [key, row] of [["a",1],["d",2],["w",3],["s",0]]) {
    const before = await evaluate(`(() => { const actor = window.__testScene().avatar; return {x:actor.container.x,y:actor.container.y}; })()`);
    await cdp("Input.dispatchKeyEvent", {type:"keyDown",key,code:`Key${key.toUpperCase()}`,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});
    await sleep(210);
    const state = await evaluate(`(() => { const actor = window.__testScene().avatar; return {x:actor.container.x,y:actor.container.y,texture:actor.sprite.texture.key,frame:Number(actor.sprite.frame.name),playing:actor.sprite.anims.isPlaying}; })()`);
    await cdp("Input.dispatchKeyEvent", {type:"keyUp",key,code:`Key${key.toUpperCase()}`,windowsVirtualKeyCode:key.toUpperCase().charCodeAt(0)});
    await sleep(100);
    assert(state.texture===`${id}-walk` && Math.floor(state.frame/4)===row && state.playing, `${id}: missing walking direction ${key}: ${JSON.stringify(state)}`);
    assert(Math.hypot(state.x-before.x,state.y-before.y)>5, `${id}: character did not move`);
    assert(await evaluate(`!window.__testScene().avatar.sprite.anims.isPlaying`), `${id}: walking did not stop on release`);
  }
  console.log(`PASS ${id}: four directional sprite rows rendered by Phaser`);
}

try {
  let page;
  for (let i = 0; i < 100 && !page; i++) {
    try { page = (await (await fetch("http://127.0.0.1:9339/json/list")).json()).find(item => item.type === "page"); } catch {}
    if (!page) await sleep(100);
  }
  assert(page, "Chromium did not start");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener("open", resolve, { once: true }));
  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    const request = pending.get(message.id);
    if (request) {
      pending.delete(message.id); clearTimeout(request.timer);
      message.error ? request.reject(new Error(message.error.message)) : request.resolve(message.result);
    }
  });
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Page.navigate", { url: origin });
  await waitFor(`document.querySelector('.astralis-welcome__image')?.naturalWidth > 0`, "welcome image");
  assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === null`), "Welcome created a save");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
  await sleep(100);
  assert(await evaluate(`document.documentElement.scrollWidth <= innerWidth && Boolean(document.querySelector('.astralis-welcome__mars-preview'))`), "Mars preview button overflows or is missing on mobile welcome");
  await cdp("Emulation.clearDeviceMetricsOverride");
  await click(".astralis-welcome__mars-preview");
  await ready();
  assert(await evaluate(`document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars') && document.querySelector('.moon-world-label p')?.innerText.includes('Preview only') && window.__testScene().exhibits.length === 3 && localStorage.getItem('astralis-progress-v1') === null`), "Direct Mars preview did not open three exhibits without creating a save");
  await capture("mars-preview");
  await click('button[aria-label="Open main menu"]');
  await waitFor(`document.querySelector('.astralis-welcome__enter')`, "welcome after unsaved Mars preview");
  assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === null`), "Exiting the Mars preview wrote a save");
  await click(".astralis-welcome__enter");
  await waitFor(`document.querySelectorAll('.astronaut-profile').length === 2`, "two profiles");
  assert(await evaluate(`[...document.querySelectorAll('.astronaut-profile__portrait img')].every(img => img.complete && img.naturalWidth > 0)`), "NASA portraits failed to load");
  assert(!await evaluate(`/Blue Explorer|Orange Explorer|Purple Explorer|choose the color/i.test(document.body.innerText)`), "Old color choices remain");
  for (const [index,name] of [[0,"Christina Koch"],[1,"Victor Glover"]]) {
    await click(".astronaut-profile__meet", index);
    await waitFor(`document.querySelector('#astronaut-dialog-title')?.innerText === ${JSON.stringify(name)}`, `${name} biography`);
    assert(await evaluate(`document.querySelectorAll('.astronaut-dialog__achievements li').length === 4 && document.querySelectorAll('.astronaut-dialog__sources a').length === 2`), "Biography/source links incomplete");
    await press("Escape", 40);
  }
  await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
  await sleep(250);
  assert(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), "Mobile picker overflows");
  await capture("picker-mobile");
  await cdp("Emulation.clearDeviceMetricsOverride");
  await click(".astronaut-profile__select", 1);
  assert(await evaluate(`document.querySelector('.astronaut-selection__preview-name').innerText === 'Victor Glover'`), "Selected avatar preview differs");
  await capture("picker-desktop");
  const exhibits = await evaluate(`import('/src/data/exhibits.ts').then(m=>m.EXHIBITS)`);
  if (process.argv.includes("--visual-only")) {
    console.log("PASS desktop and mobile picker visual captures, biographies, selection, and no horizontal overflow");
  } else if (process.argv.includes("--flow-only")) {
    await click(".astronaut-selection__back");
    assert(await evaluate(`document.querySelector('.astralis-welcome__new') === null && localStorage.getItem('astralis-progress-v1') === null`), "First-time welcome incorrectly shows New Adventure or saved data");

    const savedMars = {astronaut:"victor-glover",planet:"Mars",oxygen:33,completed:["opportunity"],stamps:["opportunity"]};
    await evaluate(`localStorage.setItem('astralis-progress-v1',${JSON.stringify(JSON.stringify(savedMars))})`);
    await cdp("Page.reload");
    await waitFor(`document.querySelector('.astralis-welcome__new')`, "saved-player welcome options");
    await click(".astralis-welcome__enter"); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === 'victor-glover' && document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars')`), "Returning save did not restore Victor and Mars");
    assert(await evaluate(`(() => { const saved = JSON.parse(localStorage.getItem('astralis-progress-v1')); return saved.oxygen === 33 && saved.stamps.includes('opportunity') && saved.completed.includes('opportunity') && !saved.archivedStamps.includes('opportunity'); })()`), "Returning save failed to preserve Opportunity's active passport stamp or changed oxygen");
    const savedBeforePreview = await evaluate(`localStorage.getItem('astralis-progress-v1')`);
    await click('button[aria-label="Open main menu"]');
    await waitFor(`document.querySelector('.astralis-welcome__new')`, "return to saved welcome");
    await click(".astralis-welcome__mars-preview"); await ready();
    assert(await evaluate(`document.querySelector('.moon-world-label p')?.innerText.includes('Preview only') && localStorage.getItem('astralis-progress-v1') === ${JSON.stringify(savedBeforePreview)}`), "Mars preview altered the saved expedition before play");
    const sojourner = await evaluate(`import('/src/data/exhibits.ts').then(m=>m.EXHIBITS.find(e=>e.id==='sojourner'))`);
    await evaluate(`(() => { const scene = window.__testScene(); const target = scene.exhibits.find(item => item.id === 'sojourner'); scene.player.setPosition(target.x, target.y + 106); return true; })()`);
    await waitFor(`document.querySelector('.moon-nearby')?.innerText.includes('SOJOURNER')`, "preview Sojourner proximity");
    await press("e", 60);
    await waitFor(`document.querySelector('.moon-dialogue-title')?.innerText === ${JSON.stringify(sojourner.name)}`, "preview Sojourner inspect");
    await click(".moon-action");
    await click(".moon-answer", sojourner.hook.answer);
    await click(".moon-action");
    for (let i = 0; i < sojourner.story.length; i++) await click(".moon-action");
    for (const [index, question] of sojourner.memory.entries()) {
      await click(".moon-answer", question.answer);
      if (index < sojourner.memory.length - 1) {
        await waitFor(`document.querySelector('.moon-dialogue-copy .moon-dialogue-intro')?.innerText === ${JSON.stringify(sojourner.memory[index + 1].prompt)}`, `preview Sojourner memory ${index + 2}`);
      }
    }
    await waitFor(`document.querySelector('.moon-stamp-mark')`, "preview Sojourner stamp");
    assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === ${JSON.stringify(savedBeforePreview)}`), "Completing a Mars exhibit in preview changed the saved expedition");
    await click(".moon-action");
    await click('button[aria-label="Open main menu"]');
    await waitFor(`document.querySelector('.astralis-welcome__new')`, "welcome after saved Mars preview");
    assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === ${JSON.stringify(savedBeforePreview)}`), "Exiting Mars preview did not preserve the saved expedition");
    await click(".astralis-welcome__enter"); await ready();
    assert(await evaluate(`document.querySelector('.moon-o2-info strong').innerText.includes('33') && JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.includes('opportunity')`), "Saved Mars expedition did not resume after preview");
    await click('button[aria-label="Open main menu"]');
    await waitFor(`document.querySelector('.astralis-welcome__new')`, "saved welcome after preview resume");
    await click(".astralis-welcome__new");
    assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === null && document.querySelectorAll('.astronaut-profile').length === 2`), "New Adventure did not clear saved progress and open selection");
    await click(".astronaut-profile__select", 0); await click(".astronaut-selection__confirm"); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === 'christina-koch' && document.querySelector('.moon-o2-info strong').innerText.includes('60') && document.querySelector('.moon-count').innerText.startsWith('0 /')`), "New Adventure did not start a clean Christina expedition");
    const cleanSave = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
    assert(cleanSave.astronaut === "christina-koch" && cleanSave.planet === "Mars" && cleanSave.oxygen === 60 && cleanSave.stamps.length === 0 && cleanSave.completed.length === 0, "New Adventure did not start a clean Mars-first expedition");

    for (const id of ["christina-koch","victor-glover"]) {
      await evaluate(`localStorage.setItem('astralis-progress-v1',${JSON.stringify(JSON.stringify({astronaut:id,planet:"Moon",oxygen:20,completed:[],stamps:[]}))})`);
      await cdp("Page.reload"); await waitFor(`document.querySelector('.astralis-welcome__enter')`, "game-over fixture welcome");
      await click(".astralis-welcome__enter"); await ready();
      assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === ${JSON.stringify(id)}`), `${id} was not restored before game over`);
      await press("a",1150); await press("e",60);
      await waitFor(`document.querySelector('.moon-dialogue-title')`, `${id} inspect`);
      const eagle = await evaluate(`import('/src/data/exhibits.ts').then(m=>m.EXHIBITS.find(e=>e.id==='apollo-11-eagle'))`);
      await clickText("Meet ", ".moon-dialogue-actions .moon-action");
      await click(".moon-dialogue .moon-answer",eagle.hook.answer);
      await clickText("Continue to the story");
      for(let i=0;i<eagle.story.length;i++) await click(".moon-dialogue-actions .moon-action");
      const memory = eagle.memory[0];
      await click(".moon-dialogue .moon-answer",(memory.answer+1)%4);
      await waitFor(`document.body.innerText.includes('Mission Failed')`, `${id} oxygen game over`);
      assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === null`), `${id} game over left a save`);
      const nextId = id === "christina-koch" ? "victor-glover" : "christina-koch";
      await clickText("Return to astronaut selection");
      await waitFor(`document.querySelectorAll('.astronaut-profile').length === 2`, `${id} return to selection`);
      await click(".astronaut-profile__select",nextId === "victor-glover" ? 1 : 0);
      await click(".astronaut-selection__confirm"); await ready();
      assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === ${JSON.stringify(nextId)} && document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars') && document.querySelector('.moon-o2-info strong').innerText.includes('60') && document.querySelector('.moon-count').innerText.startsWith('0 /')`), `${id} game over did not restart cleanly as ${nextId}`);
      const restart = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
      assert(restart.astronaut===nextId && restart.planet==="Mars" && restart.oxygen===60 && restart.stamps.length===0 && restart.completed.length===0, `${id} game over restart retained progress`);
      console.log(`PASS ${id}: oxygen depletion clears mission and supports a clean restart as ${nextId}`);
    }
    assert(errors.length===0,`Browser exceptions: ${errors.join("\n")}`);
    console.log("PASS first-time entry, both saved-game refreshes, New Adventure, and both astronaut game-over/restart flows");
  } else {
    await click(".astronaut-selection__confirm"); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === 'victor-glover' && document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars')`), "New expedition did not start with the selected astronaut at Mars");
    const marsExhibits = exhibits.filter(e => e.planet === "Mars");
    assert(marsExhibits.length === 3 && marsExhibits.map(e => e.id).join(",") === "sojourner,opportunity,ingenuity", "Mars museum did not restore its original three missions");
    assert(marsExhibits.every(e => e.story.length === 6 && e.memory.length === 3 && e.hook.options.length === 4 && e.memory.every(q => q.options.length === 4)), "Mars exhibits do not have six story boxes, one four-option hook, and three four-option memory questions");
    await click('.moon-hud-button[aria-label^="Open passport"]');
    await waitFor(`document.querySelector('.passport-page.mars')`, "Mars-first Passport");
    assert(await evaluate(`document.querySelector('.passport-page.mars')?.innerText.includes('RECOMMENDED NEXT') && document.querySelector('.passport-page.moon')?.innerText.includes('AVAILABLE ANY TIME') && Boolean(document.querySelector('.passport-page.mars button[aria-label="Enter Mars Museum"]') && document.querySelector('.passport-page.moon button[aria-label="Enter Moon Museum"]'))`), "Passport did not recommend Mars while keeping Moon open");
    await click('.passport-page.mars button[aria-label="Enter Mars Museum"]'); await ready();
    await checkDirections("victor-glover");
    await capture("victor-mars-first");
    await cdp("Page.reload");
    await waitFor(`document.querySelector('.astralis-welcome__enter')`, "resume Mars-first welcome");
    await click(".astralis-welcome__enter"); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars') && JSON.parse(localStorage.getItem('astralis-progress-v1')).planet === 'Mars'`), "Saved Mars-first location did not survive refresh");
    await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
    await sleep(300); await ready();
    const mobileMars = await evaluate(`(() => { const scene = window.__testScene(); const passportCount = document.querySelector('.moon-hud-button .moon-count'); const audioButton = document.querySelector('.audio-settings-button'); return { overflow:document.documentElement.scrollWidth > innerWidth, compact:scene.compactWorld, count:scene.exhibits.length, columns:new Set(scene.exhibits.map(item=>Math.round(item.x))).size, rows:new Set(scene.exhibits.map(item=>Math.round(item.y))).size, passportNoWrap:getComputedStyle(passportCount).whiteSpace === 'nowrap', audioTextHidden:getComputedStyle(audioButton).fontSize === '0px' }; })()`);
    assert(!mobileMars.overflow && mobileMars.compact && mobileMars.count === 3 && mobileMars.columns === 3 && mobileMars.rows === 2 && mobileMars.passportNoWrap && mobileMars.audioTextHidden, `Mars mobile gallery or header did not fit: ${JSON.stringify(mobileMars)}`);
    await capture("victor-mars-mobile");
    const firstMarsExhibit = marsExhibits[0];
    await evaluate(`(() => { const scene = window.__testScene(); const target = scene.exhibits.find(item => item.id === ${JSON.stringify(firstMarsExhibit.id)}); scene.player.setPosition(target.x, target.y + 106); return true; })()`);
    await waitFor(`document.querySelector('.moon-nearby')?.innerText.includes(${JSON.stringify((firstMarsExhibit.galleryName ?? firstMarsExhibit.name).toUpperCase())})`, "mobile Mars equipment proximity");
    await click(".moon-mobile-interact");
    await waitFor(`document.querySelector('.moon-dialogue-title')?.innerText === ${JSON.stringify(firstMarsExhibit.name)}`, "mobile Mars equipment interaction");
    await click(".moon-close");
    await cdp("Emulation.clearDeviceMetricsOverride");
    await sleep(300); await ready();
    console.log("PASS three-exhibit Mars mobile layout and touch interaction");
    assert(await evaluate(`document.querySelector('.legacy-wall') === null`), "Legacy Wall appeared before all six stamps");
    for (const [exhibitIndex, item] of marsExhibits.entries()) {
      await evaluate(`(() => { const scene = window.__testScene(); const target = scene.exhibits.find(item => item.id === ${JSON.stringify(item.id)}); scene.player.setPosition(target.x, target.y + 106); return true; })()`);
      await waitFor(`document.querySelector('.moon-nearby')?.innerText.includes(${JSON.stringify((item.galleryName ?? item.name).toUpperCase())})`, `${item.id} proximity`);
      await click(".moon-mobile-interact");
      await waitFor(`document.querySelector('.moon-dialogue-title')?.innerText === ${JSON.stringify(item.name)}`, `${item.id} inspect screen`);
      await waitFor(`document.querySelector('.moon-character-reference')?.complete && document.querySelector('.moon-character-reference').naturalWidth > 0`, `${item.id} portrait image`);
      assert(await evaluate(`window.__testScene().textures.exists(${JSON.stringify(`mars-character-${item.id}`)}) && window.__testScene().textures.exists(${JSON.stringify(`mars-reference-${item.id}`)})`), `${item.id} Phaser exhibit images did not load`);
      if (exhibitIndex === 0) {
        await click(".moon-passport-shortcut");
        await waitFor(`document.querySelector('.passport-book')`, "Passport opened from an exhibit");
        assert(await evaluate(`document.querySelector('.passport-page.mars')?.innerText.includes('0 / 3') && document.querySelector('.passport-page.moon')?.innerText.includes('0 / 3')`), "In-exhibit Passport did not show separate three-stamp planet totals");
        await click('.passport-book button[aria-label="Close passport"]');
        await waitFor(`document.querySelector('.moon-dialogue-title')?.innerText === ${JSON.stringify(item.name)}`, "return to exhibit after Passport");
      }
      await click(".moon-credits-disclosure summary");
      assert(await evaluate(`document.querySelectorAll('.moon-credits a').length >= 2 && document.querySelector('.moon-credits')?.innerText.includes(${JSON.stringify(item.characterImageCredit)})`), `${item.id} verified sources or portrait credit missing`);
      await click(".moon-dialogue-actions .moon-action");
      assert(await evaluate(`document.querySelectorAll('.moon-answer').length === 4 && document.querySelector('.moon-dialogue-copy .moon-dialogue-intro')?.innerText === ${JSON.stringify(item.hook.prompt)}`), `${item.id} Hook Question or four options missing`);
      await click(".moon-answer", item.hook.answer);
      await click(".moon-action");
      assert(await evaluate(`document.querySelector('.moon-quote') && document.querySelector('.moon-story-progress')?.children.length === 6`), `${item.id} does not have six story boxes`);
      for (let story = 0; story < item.story.length; story++) {
        assert(await evaluate(`document.querySelector('.moon-quote')?.innerText === ${JSON.stringify(item.story[story])}`), `${item.id} story box ${story + 1} is missing`);
        await click(".moon-action");
      }
      assert(await evaluate(`document.querySelector('.moon-dialogue-copy .moon-dialogue-intro')?.innerText === ${JSON.stringify(item.memory[0].prompt)} && document.querySelectorAll('.moon-answer').length === 4`), `${item.id} Memory Quiz did not start with four options`);
      for (const [memoryIndex, question] of item.memory.entries()) {
        if (exhibitIndex === 0 && memoryIndex === 0) {
          await click(".moon-answer", (question.answer + 1) % 4);
          assert(await evaluate(`document.querySelector('.moon-o2-info strong')?.innerText.includes('40') && Boolean(document.querySelector('.moon-explanation')?.innerText.includes('Try this memory again'))`), "Wrong Mars answer did not subtract 20 oxygen or explain retry");
          await clickText("Try this memory again");
        }
        await click(".moon-answer", question.answer);
        if (memoryIndex < item.memory.length - 1) {
          const nextQuestion = item.memory[memoryIndex + 1];
          await waitFor(`document.querySelector('.moon-dialogue-copy .moon-dialogue-intro')?.innerText === ${JSON.stringify(nextQuestion.prompt)}`, `${item.id} memory question ${memoryIndex + 2}`);
        }
      }
      await waitFor(`document.querySelector('.moon-stamp-mark')`, `${item.id} passport stamp`);
      assert(await evaluate(`document.querySelectorAll('.moon-memory-review ol li').length === 3 && document.querySelectorAll('.stamp-full').length === 0`), `${item.id} answer review missing or unintended shared stamp`);
      assert(await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.includes(${JSON.stringify(item.id)})`), `${item.id} stamp was not saved`);
      console.log(`PASS ${item.id}: Inspect → Hook → six story boxes → three memory questions → Passport Stamp`);
      if (exhibitIndex < marsExhibits.length - 1) {
        await clickText("Return to the Martian surface");
        await ready();
      } else {
        await clickText("Return to the Martian surface");
        await waitFor(`document.querySelector('.legacy-scene h1')?.innerText === 'THE MARTIAN ARCHIVE IS COMPLETE'`, "Mars expedition completion screen");
        await waitFor(`document.querySelectorAll('.legacy-scene article').length === 3`, "three restored Mars missions");
        assert(await evaluate(`document.querySelector('.legacy-scene')?.innerText.includes('Continue to Moon Museum') && document.querySelector('.legacy-scene')?.innerText.includes('Moon as the next museum')`), "Mars completion screen did not recommend continuing to the Moon");
        const marsCompleteSave = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
        assert(marsCompleteSave.planet === "Mars" && marsCompleteSave.oxygen === 100 && marsCompleteSave.stamps.length === 3 && marsCompleteSave.completed.length === 3, "Mars completion did not save all three Mars stamps independently");
        await clickText("Open Passport", ".legacy-scene button");
        await waitFor(`document.querySelector('.passport-book')`, "Passport from Mars completion");
        assert(await evaluate(`document.querySelector('.passport-page.mars')?.innerText.includes('3 / 3') && document.querySelector('.passport-page.moon')?.innerText.includes('0 / 3') && document.querySelector('.passport-page.moon')?.innerText.includes('RECOMMENDED NEXT')`), "Mars completion did not unlock Moon as the recommended next stop");
        await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
        await sleep(150);
        const mobilePassport = await evaluate(`(() => { const book = document.querySelector('.passport-book'); const rect = book.getBoundingClientRect(); return { overflow:document.documentElement.scrollWidth > innerWidth, left:rect.left, right:rect.right, bottom:rect.bottom, height:rect.height, maxHeight:parseFloat(getComputedStyle(book).maxHeight), overflowY:getComputedStyle(book).overflowY }; })()`);
        assert(!mobilePassport.overflow && mobilePassport.left >= 0 && mobilePassport.right <= 402 && mobilePassport.bottom <= 874 && mobilePassport.height <= mobilePassport.maxHeight && mobilePassport.overflowY === "auto", `Mobile Passport is clipped or overflowing: ${JSON.stringify(mobilePassport)}`);
        await capture("passport-mobile");
        await cdp("Emulation.clearDeviceMetricsOverride");
        await sleep(150);
        await click('.passport-book button[aria-label="Close passport"]');
        await waitFor(`document.querySelector('.legacy-scene h1')?.innerText === 'THE MARTIAN ARCHIVE IS COMPLETE'`, "return to Mars completion");
        await capture("mars-completion");
        await clickText("Continue to Moon Museum"); await ready();
        assert(await evaluate(`document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Moon') && JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.length === 3 && JSON.parse(localStorage.getItem('astralis-progress-v1')).planet === 'Moon'`), "Continuing to Moon lost Mars stamps or failed to save the new location");
      }
    }
    for (const [item,approach] of exhibits.filter(e=>e.planet==="Moon").map((e,i)=>[e,[["a",1150],["d",1050],["s",800]][i]])) {
      await press(...approach);
      await waitFor(`document.querySelector('.moon-nearby')?.innerText.includes(${JSON.stringify(item.galleryName.toUpperCase())})`, `${item.id} proximity`);
      await press("e", 60);
      await waitFor(`document.querySelector('.moon-dialogue-title')`, "Inspect");
      if (item.id === "alsep") {
        assert(await evaluate(`document.querySelector('.moon-dialogue-copy .moon-explanation[role="note"]')?.innerText.includes('Replace this image')`), "ALSEP concept-art replacement warning is not visible during Inspect");
      }
      await click(".moon-credits-disclosure summary");
      assert(await evaluate(`document.querySelectorAll('.moon-credits a').length >= 2 && document.querySelector('.moon-credits')?.innerText.includes(${JSON.stringify(item.characterImageCredit)})`), `${item.id} character-art credit or NASA sources missing`);
      if (item.id === "alsep") {
        assert(await evaluate(`document.querySelector('.moon-credits')?.innerText.includes(${JSON.stringify(item.imageWarning)})`), "ALSEP's temporary wheel-bearing concept art is not flagged for replacement");
      }
      await clickText("Meet ", ".moon-dialogue-actions .moon-action");
      await click(".moon-dialogue .moon-answer", item.hook.answer);
      await clickText("Continue to the story");
      for (let i=0;i<item.story.length;i++) await click(".moon-dialogue-actions .moon-action");
      for (const [index,question] of item.memory.entries()) {
        if (item.id === "apollo-11-eagle" && index === 0) {
          await click(".moon-dialogue .moon-answer", (question.answer+1)%4);
          assert(await evaluate(`document.querySelector('.moon-o2-info strong').innerText.includes('80')`), "Wrong answer did not subtract 20 oxygen");
          await clickText("Try this memory again");
        }
        await click(".moon-dialogue .moon-answer", question.answer);
      }
      await waitFor(`document.querySelector('.moon-stamp-mark')`, `${item.id} stamp`);
      console.log(`PASS ${item.id}: Inspect → Hook → Story → three Memory Questions → Passport Stamp`);
      await clickText("Return to the lunar surface");
      if(item.id!=="alsep") { await ready(); await sleep(250); }
    }
    await waitFor(`document.querySelector('.legacy-scene h1')?.innerText === 'THE LEGACY WALL'`, "six-stamp Legacy Wall");
    await waitFor(`[...document.querySelectorAll('.legacy-item')].length === 6 && [...document.querySelectorAll('.legacy-item')].every(item => getComputedStyle(item).opacity === '1')`, "six character reveals");
    await waitFor(`[...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].length === 6 && [...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].every(stamp => getComputedStyle(stamp).opacity === '1')`, "six cinematic stamp reveals");
    assert(await evaluate(`document.querySelectorAll('.legacy-item').length === 6 && document.querySelectorAll('.legacy-item .stamp-full').length === 6`), "Legacy Wall does not show all six characters and stamps");
    assert(await evaluate(`document.querySelectorAll('.legacy-item .legacy-art').length === 6 && [...document.querySelectorAll('.legacy-item .legacy-art')].every(art => art.children.length > 0)`), "Legacy Wall character portraits did not render");
    assert(await evaluate(`[...document.querySelectorAll('.legacy-item')].find(item => item.innerText.includes('ALSEP Science Package'))?.querySelector('.legacy-art')?.innerText.includes('TEMP ART · REPLACE')`), "Legacy Wall does not flag the temporary ALSEP illustration");
    assert(await evaluate(`document.querySelectorAll('.legacy-world-reveal--panel .legacy-world').length === 3`), "Legacy Wall is missing Earth, Moon, or Mars");
    assert(await evaluate(`document.querySelector('.legacy-subtitle')?.innerText === '6 MISSIONS. ONE LEGACY.' && document.querySelector('.legacy-catchline')?.innerText.includes('Their missions may have ended')`), "Legacy Wall closing title or message missing");
    assert(await evaluate(`document.querySelector('.legacy-deep-space img')?.complete && document.querySelector('.legacy-deep-space img').naturalWidth > 0 && document.querySelector('.legacy-image-credit')?.innerText.includes('Tarantula Nebula')`), "NASA deep-space background or its credit did not load");
    const completeSave = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
    assert(completeSave.planet === "Moon" && completeSave.oxygen === 100 && completeSave.stamps.length === 6 && completeSave.completed.length === 6, "Full Mars-then-Moon completion did not preserve all six stamps and oxygen");
    await cdp("Page.reload");
    await waitFor(`document.querySelector('.astralis-welcome__enter')`, "saved Legacy Wall welcome");
    await click(".astralis-welcome__enter");
    await waitFor(`document.querySelectorAll('.legacy-item').length === 6`, "saved Legacy Wall after refresh");
    await waitFor(`[...document.querySelectorAll('.legacy-item')].every(item => getComputedStyle(item).opacity === '1') && [...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].every(stamp => getComputedStyle(stamp).opacity === '1')`, "restored cinematic Legacy Wall");
    assert(await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.length === 6`), "Refresh did not restore all six Legacy Wall stamps");
    await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
    await sleep(200);
    assert(await evaluate(`document.documentElement.scrollWidth <= innerWidth && document.querySelectorAll('.legacy-item').length === 6`), "Mobile Legacy Wall overflows or loses a character");
    await capture("legacy-wall-mobile", true);
    await cdp("Emulation.clearDeviceMetricsOverride");
    await clickText("OPEN PASSPORT", ".legacy-scene button");
    await waitFor(`document.querySelector('.passport-page.mars')`, "Passport from completed Legacy Wall");
    assert(await evaluate(`document.querySelector('.passport-page.mars')?.innerText.includes('3 / 3') && document.querySelector('.passport-page.moon')?.innerText.includes('3 / 3') && document.querySelector('.passport-book')?.innerText.includes('6 / 6')`), "Completed Passport did not retain independent planet totals");
    await click('.passport-page.mars button[aria-label="Enter Mars Museum"]'); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars') && JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.length === 6`), "Passport could not revisit completed Mars without losing stamps");
    await click('.moon-hud-button[aria-label^="Open passport"]');
    await click('.passport-page.moon button[aria-label="Enter Moon Museum"]'); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Moon') && JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.length === 6`), "Passport could not revisit completed Moon without losing stamps");
  }
  await resumeFixture({astronaut:"purple",planet:"Mars",oxygen:73,completed:["sojourner","spirit","opportunity","curiosity","perseverance","ingenuity"],stamps:["sojourner","spirit","opportunity","curiosity","perseverance","ingenuity"],archivedStamps:[]});
  await waitFor(`document.querySelector('.legacy-scene h1')?.innerText === 'THE MARTIAN ARCHIVE IS COMPLETE'`, "restored saved Mars completion");
  await clickText("Open Passport", ".legacy-scene button");
  await waitFor(`document.querySelector('.passport-book')`, "Passport for restored Mars save");
  assert(await evaluate(`document.querySelector('.passport-page.mars')?.innerText.includes('3 / 3') && document.querySelector('.passport-page.moon')?.innerText.includes('0 / 3') && document.querySelector('.passport-book')?.innerText.includes('3 / 6') && ['Spirit Rover','Curiosity Mars Rover','Perseverance Mars Rover'].every(name => document.querySelector('.passport-archive')?.innerText.includes(name))`), "Restored Mars save lost stamps, miscounted active progress, or hid archived missions");
  await click('.passport-page.moon button[aria-label="Enter Moon Museum"]'); await ready();
  await waitFor(`(() => { const value = JSON.parse(localStorage.getItem('astralis-progress-v1')); return value?.planet === 'Moon' && value?.stamps.length === 3 && value?.archivedStamps.length === 3; })()`, "archived progress saved after Passport travel");
  const migratedAfterTravel = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
  assert(migratedAfterTravel.astronaut === "christina-koch" && migratedAfterTravel.planet === "Moon" && migratedAfterTravel.oxygen === 73 && migratedAfterTravel.stamps.length === 3 && migratedAfterTravel.completed.length === 3 && ["sojourner","opportunity","ingenuity"].every(id => migratedAfterTravel.stamps.includes(id)) && ["spirit","curiosity","perseverance"].every(id => migratedAfterTravel.archivedStamps.includes(id)), "Switching from a restored Mars save changed progress or archives");
  await checkDirections("christina-koch");
  await resumeFixture({astronaut:"christina-koch",planet:"Moon",oxygen:60,completed:[],stamps:[]});
  await ready();
  await click('.moon-hud-button[aria-label^="Open passport"]');
  await waitFor(`document.querySelector('.passport-page.mars')`, "Passport from an unfinished Moon save");
  assert(await evaluate(`document.querySelector('.passport-page.mars')?.innerText.includes('RECOMMENDED NEXT') && document.querySelector('.passport-page.moon')?.innerText.includes('AVAILABLE ANY TIME')`), "An unfinished Moon save still gates Mars");
  await click('.passport-page.mars button[aria-label="Enter Mars Museum"]'); await ready();
  const switchedMars = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
  assert(switchedMars.planet === "Mars" && switchedMars.oxygen === 60 && switchedMars.stamps.length === 0 && switchedMars.completed.length === 0, "Entering Mars from an unfinished Moon save changed progress");
  await click('.moon-hud-button[aria-label^="Open passport"]');
  await click('.passport-page.moon button[aria-label="Enter Moon Museum"]'); await ready();
  assert(await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1')).planet === 'Moon' && JSON.parse(localStorage.getItem('astralis-progress-v1')).oxygen === 60`), "Returning to Moon did not preserve the unfinished save");
  await checkDirections("christina-koch"); await capture("christina-moon");
  const missingWalkFallback = await evaluate(`import('/src/game/AstronautActor.ts').then(({AstronautActor}) => { const scene = window.__testScene(); scene.textures.remove('christina-koch-walk'); const actor = new AstronautActor(scene, 780, 300, 'christina-koch'); actor.update(1, 0); return actor.sprite.texture.key; })`);
  assert(missingWalkFallback === "christina-koch-idle", "Missing walk sheet did not safely fall back to idle art");
  assert(errors.length === 0, `Missing walk sheet raised a browser exception: ${errors.join("\n")}`);
  console.log("PASS missing astronaut walk sheet: movement animation falls back without crashing");
  for (const id of ["christina-koch","victor-glover"]) {
    await resumeFixture({astronaut:id,planet:"Mars",oxygen:80,completed:exhibits.map(e=>e.id),stamps:exhibits.map(e=>e.id)});
    await waitFor(`document.querySelectorAll('.legacy-item').length === 6 && JSON.parse(localStorage.getItem('astralis-progress-v1')).astronaut === ${JSON.stringify(id)}`, `${id} saved Legacy Wall`);
    await waitFor(`[...document.querySelectorAll('.legacy-item')].every(item => getComputedStyle(item).opacity === '1') && [...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].every(stamp => getComputedStyle(stamp).opacity === '1')`, `${id} complete Legacy Wall reveal`);
  }
  await capture("legacy-wall", true);
  assert(errors.length===0, `Browser exceptions: ${errors.join("\n")}`);
  console.log("PASS two profiles, biographies, mobile layout, Moon/Mars/Legacy for both astronauts, all three Mars exhibits, oxygen, six stamps, unlock, save migration, and zero browser exceptions.");
} catch (error) {
  console.error("FAIL",error.stack);
  try { console.error(await evaluate(`({text:document.body.innerText.slice(-3000),draws:window.__astronautDraws?.slice(-3)})`)); await capture("failure"); } catch {}
  process.exitCode=1;
} finally {
  socket?.close(); browser.kill("SIGTERM"); await sleep(200);
  rmSync(userDir,{recursive:true,force:true});
}
