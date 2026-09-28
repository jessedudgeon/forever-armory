const { chromium } = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + "/playwright")
  : require("playwright");
const assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const server = require("node:child_process").spawn(process.execPath, [
    "dev-server.mjs",
    "--port",
    "4173",
  ]);
  await new Promise((r) => setTimeout(r, 500));
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : {}),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.route("**/firebase-config.js", (r) =>
      r.fulfill({
        contentType: "text/javascript",
        body: "export const firebaseConfig={apiKey:'demo-key',authDomain:'demo-forever-armory.firebaseapp.com',projectId:'demo-forever-armory',appId:'demo-app'};",
      }),
    );
    await page.route("**/test-sdk.js", (r) =>
      r.fulfill({
        contentType: "text/javascript",
        body: fs.readFileSync(
          process.env.FIREBASE_TEST_BUNDLE || "/tmp/forever-sdk.js",
          "utf8",
        ),
      }),
    );
    let cloud = fs
      .readFileSync("site/cloud.js", "utf8")
      .replace(
        /import\(SDK\+'firebase-(app|auth|firestore)\.js'\)/g,
        "import('./test-sdk.js')",
      )
      .replace(
        "// Session-only authentication",
        "A.connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});F.connectFirestoreEmulator(db,'127.0.0.1',8080);\n // Session-only authentication",
      );
    await page.route("**/cloud.js", (r) =>
      r.fulfill({ contentType: "text/javascript", body: cloud }),
    );
    await page.goto("http://localhost:4173/#account");
    await page.waitForFunction(
      () =>
        document.querySelector("#google-signin") &&
        !document.querySelector("#google-signin").disabled,
    );
    await page.evaluate(async () => {
      const sdk = await import("./test-sdk.js");
      const token = JSON.stringify({
        sub: "alice-browser",
        email: "alice@example.test",
        email_verified: true,
        name: "Alice Test",
      });
      await sdk.signInWithCredential(
        sdk.getAuth(),
        sdk.GoogleAuthProvider.credential(token),
      );
    });
    await page.waitForFunction(() =>
      document
        .querySelector("#account-header")
        ?.textContent.includes("Saved to your account"),
    );
    await page.goto("http://localhost:4173/#roster");
    await page.locator("#new-game-account").click();
    await page.locator("#game-account-form [name=name]").fill("Cloud WoW 2");
    await page.locator("#game-account-form button[type=submit]").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    await page.locator("#add-manual").click();
    await page.locator("[name=mainName]").fill("Cloud");
    await page.locator("[name=secondaryName]").fill("Keeper");
    await page.locator("[name=playStyle]").selectOption("Normal");
    await page.locator("[name=faction]").selectOption("Horde");
    await page.locator("[name=race]").selectOption("Undead");
    await page.locator("[name=class]").selectOption("PALADIN");
    await page.locator("#manual-form button[type=submit]").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    await page.locator(".profile-hero").waitFor();
    assert.equal(
      await page.evaluate(() => localStorage.getItem("forever-armory-v1")),
      null,
    );
    assert.equal(
      await page.evaluate(() => localStorage.getItem("forever-inventory-v1")),
      null,
    );
    await page.reload();
    await page.locator(".profile-hero").waitFor();
    assert.match(await page.locator("h1").innerText(), /Cloud Keeper/);
    await page.goto("http://localhost:4173/#guilds");
    await page.locator("#new-guild").click();
    await page.locator("#guild-form [name=name]").fill("Private Cloud Guild");
    await page.locator("#guild-form button").click();
    await page.locator("#modal").waitFor({ state: "hidden" });
    await page.reload();
    await page.waitForFunction(
      () => document.querySelector("h1")?.textContent === "Private Cloud Guild",
    );
    await page.goto("http://localhost:4173/#account");
    await page.locator("#signout").click();
    await page.waitForFunction(
      () => !!document.querySelector("#google-signin"),
    );
    await page.goto("http://localhost:4173/#search");
    await page.locator("#global-query").fill("Cloud");
    await page.waitForTimeout(500);
    assert.ok(
      !(await page.locator("#global-results").innerText()).includes(
        "Cloud Keeper",
      ),
    );
    await page.goto("http://localhost:4173/#account");
    await page.waitForFunction(
      () => !document.querySelector("#google-signin").disabled,
    );
    await page.evaluate(async () => {
      const sdk = await import("./test-sdk.js");
      const token = JSON.stringify({
        sub: "bob-browser",
        email: "bob@example.test",
        email_verified: true,
        name: "Bob Test",
      });
      await sdk.signInWithCredential(
        sdk.getAuth(),
        sdk.GoogleAuthProvider.credential(token),
      );
    });
    await page.waitForFunction(() =>
      document
        .querySelector("#account-header")
        ?.textContent.includes("Saved to your account"),
    );
    await page.goto("http://localhost:4173/#roster");
    assert.equal(await page.locator(".character").count(), 0);
    assert.ok(
      !(await page.locator("#main").innerText()).includes("Cloud WoW 2"),
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: emulated Google-provider sign-in, private account and character creation, cloud reload, guild save/reload, sign-out clearing and second-user isolation; no local copies or page errors.",
    );
  } finally {
    await browser.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
