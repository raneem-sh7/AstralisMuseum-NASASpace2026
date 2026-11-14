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
  if (process.argv.includes("--visual-only")) {
    console.log("PASS desktop and mobile picker visual captures, biographies, selection, and no horizontal overflow");
  } else if (process.argv.includes("--flow-only")) {
    await click(".astronaut-selection__back");
    assert(await evaluate(`document.querySelector('.astralis-welcome__new') === null && localStorage.getItem('astralis-progress-v1') === null`), "First-time welcome incorrectly shows New Adventure or saved data");

    const savedMars = {astronaut:"victor-glover",planet:"Mars",oxygen:33,completed:["spirit"],stamps:["spirit"]};
    await evaluate(`localStorage.setItem('astralis-progress-v1',${JSON.stringify(JSON.stringify(savedMars))})`);
    await cdp("Page.reload");
    await waitFor(`document.querySelector('.astralis-welcome__new')`, "saved-player welcome options");
    await click(".astralis-welcome__enter"); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === 'victor-glover' && document.querySelector('.game-canvas').getAttribute('aria-label').startsWith('Mars')`), "Returning save did not restore Victor and Mars");
    assert(await evaluate(`(() => { const saved = JSON.parse(localStorage.getItem('astralis-progress-v1')); return saved.oxygen === 33 && saved.stamps.includes('spirit') && saved.completed.includes('spirit') && !saved.archivedStamps.includes('spirit'); })()`), "Returning save failed to reactivate Spirit's existing passport stamp or changed oxygen");
    await click('button[aria-label="Open main menu"]');
    await waitFor(`document.querySelector('.astralis-welcome__new')`, "return to saved welcome");
    await click(".astralis-welcome__new");
    assert(await evaluate(`localStorage.getItem('astralis-progress-v1') === null && document.querySelectorAll('.astronaut-profile').length === 2`), "New Adventure did not clear saved progress and open selection");
    await click(".astronaut-profile__select", 0); await click(".astronaut-selection__confirm"); await ready();
    assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === 'christina-koch' && document.querySelector('.moon-o2-info strong').innerText.includes('60') && document.querySelector('.moon-count').innerText.startsWith('0 /')`), "New Adventure did not start a clean Christina expedition");
    const cleanSave = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
    assert(cleanSave.astronaut === "christina-koch" && cleanSave.planet === "Moon" && cleanSave.oxygen === 60 && cleanSave.stamps.length === 0 && cleanSave.completed.length === 0, "New Adventure persisted old progress");

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
      assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === ${JSON.stringify(nextId)} && document.querySelector('.moon-o2-info strong').innerText.includes('60') && document.querySelector('.moon-count').innerText.startsWith('0 /')`), `${id} game over did not restart cleanly as ${nextId}`);
      const restart = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
      assert(restart.astronaut===nextId && restart.oxygen===60 && restart.stamps.length===0 && restart.completed.length===0, `${id} game over restart retained progress`);
      console.log(`PASS ${id}: oxygen depletion clears mission and supports a clean restart as ${nextId}`);
    }
    assert(errors.length===0,`Browser exceptions: ${errors.join("\n")}`);
    console.log("PASS first-time entry, both saved-game refreshes, New Adventure, and both astronaut game-over/restart flows");
  } else {
  await click(".astronaut-selection__confirm"); await ready();
  assert(await evaluate(`document.querySelector('.game-canvas').dataset.astronaut === 'victor-glover'`), "Victor selection was lost");
  await checkDirections("victor-glover");
  await capture("victor-moon");
  await cdp("Page.reload");
  await waitFor(`document.querySelector('.astralis-welcome__enter')`, "resume welcome");
  await click(".astralis-welcome__enter"); await ready();
  const exhibits = await evaluate(`import('/src/data/exhibits.ts').then(m=>m.EXHIBITS)`);
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
        assert(await evaluate(`document.querySelector('.moon-o2-info strong').innerText.includes('40')`), "Wrong answer did not subtract 20 oxygen");
        await clickText("Try this memory again");
      }
      await click(".moon-dialogue .moon-answer", question.answer);
    }
    await waitFor(`document.querySelector('.moon-stamp-mark')`, `${item.id} stamp`);
    console.log(`PASS ${item.id}: Inspect → Hook → Story → three Memory Questions → Passport Stamp`);
    await clickText("Return to the lunar surface");
    if(item.id!=="alsep") { await ready(); await sleep(250); }
  }
  await waitFor(`document.querySelector('#travel-title')`, "Mars unlock");
  await clickText("Travel to Mars"); await ready();
  await checkDirections("victor-glover");
  const saved = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
  assert(saved.astronaut==="victor-glover" && saved.planet==="Mars" && saved.stamps.length===3 && saved.oxygen===100, "Travel/save/oxygen regression");
  await capture("victor-mars");
  const marsExhibits = exhibits.filter(e => e.planet === "Mars");
  assert(marsExhibits.length === 6 && marsExhibits.map(e => e.id).join(",") === "sojourner,spirit,opportunity,curiosity,perseverance,ingenuity", "Mars exhibit list does not contain all six missions");
  assert(marsExhibits.every(e => e.story.length === 6 && e.memory.length === 3 && e.hook.options.length === 4 && e.memory.every(q => q.options.length === 4)), "Mars exhibits do not have six story boxes, one four-option hook, and three four-option memory questions");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
  await sleep(300); await ready();
  const mobileMars = await evaluate(`(() => { const scene = window.__testScene(); const passportCount = document.querySelector('.moon-hud-button .moon-count'); const audioButton = document.querySelector('.audio-settings-button'); return { overflow:document.documentElement.scrollWidth > innerWidth, compact:scene.compactWorld, count:scene.exhibits.length, columns:new Set(scene.exhibits.map(item=>Math.round(item.x))).size, rows:new Set(scene.exhibits.map(item=>Math.round(item.y))).size, passportNoWrap:getComputedStyle(passportCount).whiteSpace === 'nowrap', audioTextHidden:getComputedStyle(audioButton).fontSize === '0px' }; })()`);
  assert(!mobileMars.overflow && mobileMars.compact && mobileMars.count === 6 && mobileMars.columns === 2 && mobileMars.rows === 3 && mobileMars.passportNoWrap && mobileMars.audioTextHidden, `Mars mobile gallery or header did not fit: ${JSON.stringify(mobileMars)}`);
  await capture("victor-mars-mobile");
  const firstMarsExhibit = marsExhibits[0];
  await evaluate(`(() => { const scene = window.__testScene(); const target = scene.exhibits.find(item => item.id === ${JSON.stringify(firstMarsExhibit.id)}); scene.player.setPosition(target.x, target.y + 106); return true; })()`);
  await waitFor(`document.querySelector('.moon-nearby')?.innerText.includes(${JSON.stringify((firstMarsExhibit.galleryName ?? firstMarsExhibit.name).toUpperCase())})`, "mobile Mars equipment proximity");
  await click(".moon-mobile-interact");
  await waitFor(`document.querySelector('.moon-dialogue-title')?.innerText === ${JSON.stringify(firstMarsExhibit.name)}`, "mobile Mars equipment interaction");
  await click(".moon-close");
  await cdp("Emulation.clearDeviceMetricsOverride");
  await sleep(300); await ready();
  console.log("PASS Mars responsive 2×3 mobile layout and touch interaction");
  assert(await evaluate(`document.querySelector('.legacy-wall') === null`), "Legacy Wall appeared before all nine stamps");
  for (const [exhibitIndex, item] of marsExhibits.entries()) {
    await evaluate(`(() => { const scene = window.__testScene(); const target = scene.exhibits.find(item => item.id === ${JSON.stringify(item.id)}); scene.player.setPosition(target.x, target.y + 106); return true; })()`);
    await waitFor(`document.querySelector('.moon-nearby')?.innerText.includes(${JSON.stringify((item.galleryName ?? item.name).toUpperCase())})`, `${item.id} proximity`);
    await press("e", 80);
    await waitFor(`document.querySelector('.moon-dialogue-title')?.innerText === ${JSON.stringify(item.name)}`, `${item.id} inspect screen`);
    await waitFor(`document.querySelector('.moon-character-reference')?.complete && document.querySelector('.moon-character-reference').naturalWidth > 0`, `${item.id} portrait image`);
    assert(await evaluate(`window.__testScene().textures.exists(${JSON.stringify(`mars-character-${item.id}`)}) && window.__testScene().textures.exists(${JSON.stringify(`mars-reference-${item.id}`)})`), `${item.id} Phaser exhibit images did not load`);
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
        assert(await evaluate(`document.querySelector('.moon-o2-info strong')?.innerText.includes('80') && Boolean(document.querySelector('.moon-explanation')?.innerText.includes('Try this memory again'))`), "Wrong Mars answer did not subtract 20 oxygen or explain retry");
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
      await waitFor(`document.querySelector('.legacy-scene h1')?.innerText === 'THE LEGACY WALL'`, "nine-stamp Legacy Wall");
      await waitFor(`[...document.querySelectorAll('.legacy-item')].length === 9 && [...document.querySelectorAll('.legacy-item')].every(item => getComputedStyle(item).opacity === '1')`, "nine character reveals");
      await waitFor(`[...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].length === 9 && [...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].every(stamp => getComputedStyle(stamp).opacity === '1')`, "nine cinematic stamp reveals");
      assert(await evaluate(`document.querySelectorAll('.legacy-item').length === 9 && document.querySelectorAll('.legacy-item .stamp-full').length === 9`), "Legacy Wall does not show all nine characters and stamps");
      assert(await evaluate(`document.querySelectorAll('.legacy-item .legacy-art').length === 9 && [...document.querySelectorAll('.legacy-item .legacy-art')].every(art => art.children.length > 0)`), "Legacy Wall character portraits did not render");
      assert(await evaluate(`[...document.querySelectorAll('.legacy-item')].find(item => item.innerText.includes('ALSEP Science Package'))?.querySelector('.legacy-art')?.innerText.includes('TEMP ART · REPLACE')`), "Legacy Wall does not flag the temporary ALSEP illustration");
      assert(await evaluate(`document.querySelectorAll('.legacy-world-reveal--panel .legacy-world').length === 3`), "Legacy Wall is missing Earth, Moon, or Mars");
      assert(await evaluate(`document.querySelector('.legacy-subtitle')?.innerText === 'NINE MISSIONS. ONE LEGACY.' && document.querySelector('.legacy-catchline')?.innerText.includes('Their missions may have ended')`), "Legacy Wall closing title or message missing");
      assert(await evaluate(`document.querySelector('.legacy-deep-space img')?.complete && document.querySelector('.legacy-deep-space img').naturalWidth > 0 && document.querySelector('.legacy-image-credit')?.innerText.includes('Tarantula Nebula')`), "NASA deep-space background or its credit did not load");
      const completeSave = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
      assert(completeSave.planet === "Mars" && completeSave.oxygen === 100 && completeSave.stamps.length === 9 && completeSave.completed.length === 9, "Full Mars completion did not preserve all nine stamps and oxygen");
      await cdp("Page.reload");
      await waitFor(`document.querySelector('.astralis-welcome__enter')`, "saved Legacy Wall welcome");
      await click(".astralis-welcome__enter");
      await waitFor(`document.querySelectorAll('.legacy-item').length === 9`, "saved Legacy Wall after refresh");
      await waitFor(`[...document.querySelectorAll('.legacy-item')].every(item => getComputedStyle(item).opacity === '1') && [...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].every(stamp => getComputedStyle(stamp).opacity === '1')`, "restored cinematic Legacy Wall");
      assert(await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1')).stamps.length === 9`), "Refresh did not restore all nine Legacy Wall stamps");
      await cdp("Emulation.setDeviceMetricsOverride", { width: 402, height: 874, deviceScaleFactor: 1, mobile: true });
      await sleep(200);
      assert(await evaluate(`document.documentElement.scrollWidth <= innerWidth && document.querySelectorAll('.legacy-item').length === 9`), "Mobile Legacy Wall overflows or loses a character");
      await capture("legacy-wall-mobile", true);
      await cdp("Emulation.clearDeviceMetricsOverride");
    }
  }
  await resumeFixture({astronaut:"purple",planet:"Mars",oxygen:73,completed:["sojourner","opportunity","ingenuity"],stamps:["sojourner","opportunity","ingenuity"],archivedStamps:["spirit"]});
  await ready();
  const migrated = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
  assert(migrated.astronaut==="christina-koch" && migrated.oxygen===73 && migrated.stamps.length===4 && migrated.completed.length===4 && migrated.stamps.includes("spirit") && !migrated.archivedStamps.includes("spirit") && migrated.planet==="Mars", "Old save migration did not restore the previously archived Spirit stamp into current progression");
  await clickText("Passport", ".moon-hud-button");
  assert(await evaluate(`document.querySelector('.passport-book').innerText.includes('4 / 9') && !document.querySelector('.passport-archive')`), "Reactivated Spirit passport stamp is not counted in the current nine-mission passport");
  await click('.passport-book button[aria-label="Close passport"]');
  await checkDirections("christina-koch");
  await resumeFixture({astronaut:"christina-koch",planet:"Moon",oxygen:60,completed:[],stamps:[]});
  await ready(); await checkDirections("christina-koch"); await capture("christina-moon");
  const missingWalkFallback = await evaluate(`import('/src/game/AstronautActor.ts').then(({AstronautActor}) => { const scene = window.__testScene(); scene.textures.remove('christina-koch-walk'); const actor = new AstronautActor(scene, 780, 300, 'christina-koch'); actor.update(1, 0); return actor.sprite.texture.key; })`);
  assert(missingWalkFallback === "christina-koch-idle", "Missing walk sheet did not safely fall back to idle art");
  assert(errors.length === 0, `Missing walk sheet raised a browser exception: ${errors.join("\n")}`);
  console.log("PASS missing astronaut walk sheet: movement animation falls back without crashing");
  for (const id of ["christina-koch","victor-glover"]) {
    await resumeFixture({astronaut:id,planet:"Mars",oxygen:80,completed:exhibits.map(e=>e.id),stamps:exhibits.map(e=>e.id)});
    await waitFor(`document.querySelectorAll('.legacy-item').length === 9 && JSON.parse(localStorage.getItem('astralis-progress-v1')).astronaut === ${JSON.stringify(id)}`, `${id} saved Legacy Wall`);
    await waitFor(`[...document.querySelectorAll('.legacy-item')].every(item => getComputedStyle(item).opacity === '1') && [...document.querySelectorAll('.legacy-stamp-reveal .stamp-full')].every(stamp => getComputedStyle(stamp).opacity === '1')`, `${id} complete Legacy Wall reveal`);
  }
  await capture("legacy-wall", true);
  assert(errors.length===0, `Browser exceptions: ${errors.join("\n")}`);
  console.log("PASS two profiles, biographies, mobile layout, Moon/Mars/Legacy for both astronauts, all six Mars exhibits, oxygen, nine stamps, unlock, save migration, and zero browser exceptions.");
  }
} catch (error) {
  console.error("FAIL",error.stack);
  try { console.error(await evaluate(`({text:document.body.innerText.slice(-3000),draws:window.__astronautDraws?.slice(-3)})`)); await capture("failure"); } catch {}
  process.exitCode=1;
} finally {
  socket?.close(); browser.kill("SIGTERM"); await sleep(200);
  rmSync(userDir,{recursive:true,force:true});
}
