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
async function capture(name) {
  mkdirSync("generated-artifacts/astronaut-tests", { recursive: true });
  const result = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 85 });
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
  await resumeFixture({...saved, astronaut:"purple",oxygen:73,completed:[...saved.completed,"spirit"],stamps:[...saved.stamps,"spirit"]});
  await ready();
  const migrated = await evaluate(`JSON.parse(localStorage.getItem('astralis-progress-v1'))`);
  assert(migrated.astronaut==="christina-koch" && migrated.oxygen===73 && migrated.stamps.length===4 && migrated.completed.length===4 && migrated.planet==="Mars", "Old save migration reset progress");
  await checkDirections("christina-koch");
  await resumeFixture({astronaut:"christina-koch",planet:"Moon",oxygen:60,completed:[],stamps:[]});
  await ready(); await checkDirections("christina-koch"); await capture("christina-moon");
  for (const id of ["christina-koch","victor-glover"]) {
    await resumeFixture({astronaut:id,planet:"Mars",oxygen:80,completed:exhibits.map(e=>e.id),stamps:exhibits.map(e=>e.id)});
    await waitFor(`document.querySelector('.legacy-scene [data-astronaut="${id}"] img')?.complete`, `${id} Legacy Wall`);
    assert(await evaluate(`document.querySelector('.legacy-scene [data-astronaut="${id}"] img').getAttribute('src').includes('${id}-idle.png')`), "Legacy Wall identity mismatch");
  }
  await capture("legacy-wall");
  assert(errors.length===0, `Browser exceptions: ${errors.join("\n")}`);
  console.log("PASS two profiles, biographies, mobile layout, both astronaut identities in Moon/Mars/Legacy, directional animation, oxygen, stamps, unlock, LocalStorage migration, and zero browser exceptions.");
  }
} catch (error) {
  console.error("FAIL",error.stack);
  try { console.error(await evaluate(`({text:document.body.innerText.slice(-3000),draws:window.__astronautDraws?.slice(-3)})`)); await capture("failure"); } catch {}
  process.exitCode=1;
} finally {
  socket?.close(); browser.kill("SIGTERM"); await sleep(200);
  rmSync(userDir,{recursive:true,force:true});
}
